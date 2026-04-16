/**
 * Script de synchronisation des subventions depuis l'API Aides et Territoires
 * Usage: tsx server/sync-grants.ts
 */

import { db } from "./db.js";
import { grants } from "../shared/schema.js";
import { fetchAides, testApiConnection } from "./aides-territoires-api.js";
import { sql } from "drizzle-orm";
import { selectBestUrl, scoreUrl } from "./url-validator.js";

// Mapping des catégories vers domaines artistiques
const ARTISTIC_CATEGORIES = [
  "culture",
  "patrimoine",
  "création",
  "arts",
  "spectacle",
  "livre",
  "cinéma",
  "audiovisuel",
  "musique",
  "théâtre",
  "danse",
  "numérique",
  "médiation",
  "éducation artistique",
];

// Mapping des audiences vers nos statuts
const ARTIST_AUDIENCES = [
  "artist",
  "artiste",
  "auteur",
  "créateur",
  "association",
  "entreprise culturelle",
  "micro-entreprise",
  "auto-entrepreneur",
  "collectif",
  "compagnie",
];

/**
 * Synchronise toutes les subventions culturelles depuis l'API
 */
async function syncGrants() {
  console.log("🚀 Début de la synchronisation des subventions culturelles...\n");

  // Test de connexion
  console.log("🔐 Test de connexion à l'API Aides et Territoires...");
  const testResult = await testApiConnection();
  if (!testResult.success) {
    console.error("❌ Échec de connexion à l'API:", testResult.message);
    process.exit(1);
  }
  console.log(`✅ Connexion réussie! ${testResult.totalCount} aides culturelles disponibles.\n`);

  let page = 1;
  let totalFetched = 0;
  let totalInserted = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`📡 Récupération de la page ${page}...`);
    
    try {
      const response = await fetchAides({
        text: "culture",
        page,
        page_size: 50,
      });

      console.log(`   → ${response.results.length} aides récupérées`);
      totalFetched += response.results.length;

      // Traiter chaque aide
      for (const aid of response.results) {
        try {
          // Extraire l'organisme principal (premier financeur)
          const organization = aid.financers_full?.[0]?.name || aid.financers?.[0]?.name || "Non spécifié";
          
          // Formater le montant
          let amount = null;
          let amountMin = null;
          let amountMax = null;
          let maxFundingRate = null;
          
          if (aid.subvention_rate_lower_bound !== null || aid.subvention_rate_upper_bound !== null) {
            maxFundingRate = aid.subvention_rate_upper_bound || aid.subvention_rate_lower_bound;
          }
          
          // Formater la date limite
          let deadline = null;
          if (aid.submission_deadline) {
            deadline = new Date(aid.submission_deadline).toLocaleDateString('fr-FR');
          }
          
          // Récurrence
          const frequency = aid.recurrence || (aid.is_call_for_project ? "Appel à projets" : null);
          
          // Zone géographique
          const geographicZone = aid.perimeter?.name ? [aid.perimeter.name] : [];
          
          // Types de subvention
          const grantType = aid.aid_types || [];
          
          // Secteurs éligibles (audiences ciblées)
          const eligibleSectors = aid.targeted_audiences || [];
          
          // Contact
          const contactParts = aid.contact ? aid.contact.split(/[,\n]/) : [];
          let contactEmail = null;
          let contactPhone = null;
          
          for (const part of contactParts) {
            const trimmed = part.trim();
            if (trimmed.includes('@')) {
              contactEmail = trimmed;
            } else if (trimmed.match(/\d{2}/)) {
              contactPhone = trimmed;
            }
          }
          
          // Sélectionner la meilleure URL parmi les options disponibles
          const bestUrl = selectBestUrl(aid.application_url, aid.origin_url, aid.url);
          if (bestUrl && scoreUrl(bestUrl) < 60) {
            console.log(`   ⚠️  URL de faible qualité (${scoreUrl(bestUrl)}/100) pour ${aid.name.substring(0, 40)}...`);
          }
          
          // Insérer ou mettre à jour la subvention
          await db
            .insert(grants)
            .values({
              id: aid.id,
              title: aid.name,
              organization,
              amount,
              amountMin,
              amountMax,
              deadline,
              nextSession: aid.start_date ? new Date(aid.start_date).toLocaleDateString('fr-FR') : null,
              frequency,
              description: aid.description || null,
              eligibility: aid.eligibility || "Non spécifié",
              requirements: aid.project_examples || null,
              obligatoryDocuments: aid.mobilization_steps?.length > 0 ? aid.mobilization_steps : null,
              url: bestUrl,
              contactEmail,
              contactPhone,
              grantType: grantType.length > 0 ? grantType : null,
              eligibleSectors: eligibleSectors.length > 0 ? eligibleSectors : null,
              geographicZone: geographicZone.length > 0 ? geographicZone : null,
              maxFundingRate,
              coFundingRequired: aid.subvention_comment || null,
              cumulativeAllowed: null,
              processingTime: null,
              responseDelay: null,
              applicationDifficulty: null, // Sera enrichi par l'IA
              acceptanceRate: null,
              annualBeneficiaries: null,
              successProbability: null,
              preparationAdvice: null, // Sera enrichi par l'IA
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
                updatedAt: sql`CURRENT_TIMESTAMP`,
              },
            });
          
          totalInserted++;
          
          if (totalInserted % 10 === 0) {
            console.log(`   ✅ ${totalInserted} subventions synchronisées...`);
          }
        } catch (error: any) {
          console.error(`   ⚠️  Erreur pour l'aide ${aid.id}:`, error.message);
        }
      }

      // Vérifier s'il y a une page suivante
      hasMore = response.next !== null;
      page++;
      
      // Pause pour ne pas surcharger l'API
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      console.error(`❌ Erreur lors de la récupération de la page ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n✅ Synchronisation terminée!`);
  console.log(`   📊 Total récupéré: ${totalFetched} aides`);
  console.log(`   💾 Total inséré/mis à jour: ${totalInserted} subventions`);
  console.log(`\n💡 Note: Les champs "difficulté" et "conseils" seront enrichis par l'IA lors du matching.\n`);
}

// Exécuter la synchronisation
syncGrants()
  .then(() => {
    console.log("✨ Terminé!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
