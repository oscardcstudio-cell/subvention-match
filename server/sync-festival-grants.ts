/**
 * Script ciblé pour gonfler le catalogue événementiel / festival.
 *
 * Stratégie : plutôt que relancer tous les scrapers legacy, on interroge
 * l'API Aides et Territoires avec plusieurs requêtes keyword ciblées,
 * on dédoublonne, et on insère en tagguant `eligibleSectors` avec
 * "festival" pour que le matcher IA puisse remonter ces aides quand
 * l'utilisateur coche projectType=evenementiel.
 *
 * Usage: tsx server/sync-festival-grants.ts
 */

import { db } from "./db.js";
import { grants } from "../shared/schema.js";
import { fetchAides, testApiConnection } from "./aides-territoires-api.js";
import { sql } from "drizzle-orm";
import { selectBestUrl, scoreUrl } from "./url-validator.js";

// Requêtes ciblées événementiel. Chaque keyword est lancé séparément puis
// dédupliqué pour maximiser la couverture (l'API fait un match large).
const FESTIVAL_KEYWORDS = [
  "festival",
  "événement culturel",
  "diffusion concert",
  "programmation musicale",
  "salle de spectacle",
  "scène musiques actuelles",
  "spectacle vivant diffusion",
  "manifestation artistique",
];

const PAGES_PER_KEYWORD = 5; // ~250 aides max par keyword (50 × 5)

async function syncFestivalGrants() {
  console.log("🎪 Sync ciblé événementiel / festival\n");

  const testResult = await testApiConnection();
  if (!testResult.success) {
    console.error("❌ Échec connexion API:", testResult.message);
    process.exit(1);
  }
  console.log(`✅ API OK (${testResult.totalCount} aides disponibles)\n`);

  const seenIds = new Set<string>();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;

  for (const keyword of FESTIVAL_KEYWORDS) {
    console.log(`\n🔎 Keyword: "${keyword}"`);
    let page = 1;
    let hasMore = true;
    let keywordCount = 0;

    while (hasMore && page <= PAGES_PER_KEYWORD) {
      try {
        const response = await fetchAides({
          text: keyword,
          page,
          page_size: 50,
        });

        totalFetched += response.results.length;

        for (const aid of response.results) {
          if (seenIds.has(aid.id)) continue;
          seenIds.add(aid.id);

          try {
            const organization =
              aid.financers_full?.[0]?.name || aid.financers?.[0]?.name || "Non spécifié";

            let maxFundingRate: number | null = null;
            if (
              aid.subvention_rate_lower_bound !== null ||
              aid.subvention_rate_upper_bound !== null
            ) {
              maxFundingRate =
                aid.subvention_rate_upper_bound || aid.subvention_rate_lower_bound || null;
            }

            const deadline = aid.submission_deadline
              ? new Date(aid.submission_deadline).toLocaleDateString("fr-FR")
              : null;

            const frequency =
              aid.recurrence || (aid.is_call_for_project ? "Appel à projets" : null);

            const geographicZone = aid.perimeter?.name ? [aid.perimeter.name] : [];
            const grantType = aid.aid_types || [];

            // IMPORTANT : on ajoute le tag "festival" / "evenementiel" aux eligibleSectors
            // pour que le matcher IA route ces aides aux users cochant projectType=evenementiel.
            const baseSectors = aid.targeted_audiences || [];
            const eligibleSectors = Array.from(
              new Set([...baseSectors, "festival", "evenementiel"]),
            );

            const contactParts = aid.contact ? aid.contact.split(/[,\n]/) : [];
            let contactEmail: string | null = null;
            let contactPhone: string | null = null;
            for (const part of contactParts) {
              const trimmed = part.trim();
              if (trimmed.includes("@")) contactEmail = trimmed;
              else if (trimmed.match(/\d{2}/)) contactPhone = trimmed;
            }

            const bestUrl = selectBestUrl(aid.application_url, aid.origin_url, aid.url);

            const result = await db
              .insert(grants)
              .values({
                id: aid.id,
                title: aid.name,
                organization,
                amount: null,
                amountMin: null,
                amountMax: null,
                deadline,
                nextSession: aid.start_date
                  ? new Date(aid.start_date).toLocaleDateString("fr-FR")
                  : null,
                frequency,
                description: aid.description || null,
                eligibility: aid.eligibility || "Non spécifié",
                requirements: aid.project_examples || null,
                obligatoryDocuments:
                  aid.mobilization_steps && aid.mobilization_steps.length > 0
                    ? aid.mobilization_steps
                    : null,
                url: bestUrl,
                contactEmail,
                contactPhone,
                grantType: grantType.length > 0 ? grantType : null,
                eligibleSectors,
                geographicZone: geographicZone.length > 0 ? geographicZone : null,
                maxFundingRate,
                coFundingRequired: aid.subvention_comment || null,
                cumulativeAllowed: null,
                processingTime: null,
                responseDelay: null,
                applicationDifficulty: null,
                acceptanceRate: null,
                annualBeneficiaries: null,
                successProbability: null,
                preparationAdvice: null,
                experienceFeedback: aid.project_references || null,
                priority: aid.is_call_for_project ? "haute" : "moyenne",
                status: "active",
              })
              .onConflictDoUpdate({
                target: grants.id,
                set: {
                  title: aid.name,
                  organization,
                  deadline,
                  description: aid.description || null,
                  eligibility: aid.eligibility || "Non spécifié",
                  url: bestUrl,
                  // Merge : on garde les secteurs existants + on ajoute les tags festival
                  eligibleSectors,
                  updatedAt: sql`CURRENT_TIMESTAMP`,
                },
              })
              .returning({ id: grants.id });

            if (result.length > 0) {
              totalInserted++;
              keywordCount++;
            }
          } catch (error: any) {
            console.error(`   ⚠️  Aide ${aid.id}:`, error.message);
          }
        }

        hasMore = response.next !== null;
        page++;
        if (hasMore) await new Promise((r) => setTimeout(r, 800));
      } catch (error: any) {
        console.error(`   ❌ Page ${page}:`, error.message);
        hasMore = false;
      }
    }

    console.log(`   → ${keywordCount} nouvelles/maj pour "${keyword}"`);
  }

  console.log(`\n✅ Sync festival terminé`);
  console.log(`   📊 Aides uniques vues : ${seenIds.size}`);
  console.log(`   💾 Insertions/updates  : ${totalInserted}`);
  console.log(`   🔢 Total fetches API   : ${totalFetched}\n`);
}

syncFestivalGrants()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
