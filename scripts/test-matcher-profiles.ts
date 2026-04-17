/**
 * Diagnostic matching IA sur profils récurrents.
 * Appelle matchGrantsWithAI() en direct (bypass du front) et logge les
 * résultats pour valider que les modifs de ai-matcher.ts donnent des
 * subventions pertinentes sur les cas d'usage typiques.
 *
 * Lancer : `npx tsx scripts/test-matcher-profiles.ts`
 * Coût : ~7 profils × 2 appels DeepSeek ≈ $0.05
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { matchGrantsWithAI } from "../server/ai-matcher.js";
import type { FormSubmission, GrantResult } from "../shared/schema.js";

interface TestProfile {
  label: string;
  submission: Partial<FormSubmission>;
  expected: string[]; // mots-clés/organismes qu'on s'attend à voir dans les résultats
  antiExpected: string[]; // mots-clés qu'on NE veut PAS voir
}

const PROFILES: TestProfile[] = [
  {
    label: "🎧 Organisateur de soirées / programmateur (IDF)",
    submission: {
      status: ["association"],
      artisticDomain: ["musique"],
      projectDescription:
        "Nous organisons des soirées mensuelles dans Paris mettant en avant la scène électronique émergente, avec programmation d'artistes français et étrangers, location de salles, production technique.",
      projectType: ["diffusion", "action-culturelle"],
      projectStage: "production",
      region: "Île-de-France",
      isInternational: "non",
      aidTypes: ["subvention"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["festival", "diffusion", "SPEDIDAM", "manifestation", "programmat"],
    antiExpected: ["création musicale", "mobilier", "bâtiment", "patrimoine"],
  },
  {
    label: "🎵 Musicien en création d'album (Bretagne)",
    submission: {
      status: ["artiste-auto"],
      artisticDomain: ["musique"],
      projectDescription:
        "Je suis auteur-compositeur-interprète, je prépare mon deuxième album studio (10 titres). Besoin de financement pour l'enregistrement, le mix et mastering, et la promotion de la sortie.",
      projectType: ["creation", "production"],
      projectStage: "production",
      region: "Bretagne",
      isInternational: "non",
      aidTypes: ["subvention", "bourse"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["création", "CNM", "ADAMI", "enregistrement", "développement"],
    antiExpected: ["mobilier", "bâtiment", "cinéma", "patrimoine bâti"],
  },
  {
    label: "🎭 Compagnie de danse en résidence (Occitanie)",
    submission: {
      status: ["association"],
      artisticDomain: ["spectacle-vivant"],
      projectDescription:
        "Compagnie de danse contemporaine cherchant une résidence de création pour un nouveau spectacle de 4 danseurs. Besoin de financer la résidence, les répétitions, la création lumière et costumes.",
      projectType: ["creation", "residence"],
      projectStage: "developpement",
      region: "Occitanie",
      isInternational: "non",
      aidTypes: ["subvention", "residence"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["résidence", "création", "spectacle vivant", "chorég", "compagnie"],
    antiExpected: ["cinéma", "littérature", "patrimoine bâti"],
  },
  {
    label: "🎬 Cinéaste court-métrage (PACA)",
    submission: {
      status: ["artiste-auto"],
      artisticDomain: ["audiovisuel"],
      projectDescription:
        "Réalisateur préparant un court-métrage de fiction (20 min) sur le thème de l'exil. Besoin de financer l'écriture, le développement et la production.",
      projectType: ["creation", "production"],
      projectStage: "developpement",
      region: "Provence-Alpes-Côte d'Azur",
      isInternational: "non",
      aidTypes: ["subvention", "bourse"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["court métrage", "court-métrage", "CNC", "cinéma", "audiovisuel"],
    antiExpected: ["musique", "patrimoine", "mobilier"],
  },
  {
    label: "📖 Écrivain bourse d'écriture (Nouvelle-Aquitaine)",
    submission: {
      status: ["artiste-auto"],
      artisticDomain: ["ecriture"],
      projectDescription:
        "Je suis auteur de romans, je travaille sur mon troisième roman. Je cherche une bourse d'écriture pour pouvoir me consacrer plusieurs mois à l'écriture sans contraintes alimentaires.",
      projectType: ["creation"],
      projectStage: "developpement",
      region: "Nouvelle-Aquitaine",
      isInternational: "non",
      aidTypes: ["bourse"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["CNL", "écriture", "auteur", "littér", "livre", "roman"],
    antiExpected: ["musique", "cinéma", "arts visuels", "patrimoine bâti"],
  },
  {
    label: "🎪 Organisateur de festival de musique (Hauts-de-France)",
    submission: {
      status: ["association"],
      artisticDomain: ["musique"],
      projectDescription:
        "Association qui organise un festival annuel de musiques actuelles (3 jours, 20 artistes). Besoin de financer la programmation, la technique, la communication et l'accueil public.",
      projectType: ["diffusion"],
      projectStage: "production",
      region: "Hauts-de-France",
      isInternational: "non",
      aidTypes: ["subvention"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["festival", "manifestation", "diffusion", "musique", "SPEDIDAM", "CNM"],
    antiExpected: ["mobilier", "patrimoine bâti", "cinéma"],
  },
  {
    label: "🖼️  Artiste plasticien exposition (Grand Est)",
    submission: {
      status: ["artiste-auto"],
      artisticDomain: ["arts-plastiques"],
      projectDescription:
        "Artiste plasticien travaillant sur sculpture et installation. Préparation d'une exposition personnelle dans un centre d'art. Besoin de financer la production des œuvres et le transport.",
      projectType: ["creation", "diffusion"],
      projectStage: "production",
      region: "Grand Est",
      isInternational: "non",
      aidTypes: ["subvention", "bourse"],
      geographicScope: ["regional", "national"],
      email: "test@example.com",
    },
    expected: ["arts plastiques", "arts visuels", "exposition", "DRAC", "plastic"],
    antiExpected: ["musique", "cinéma", "mobilier", "patrimoine bâti"],
  },
];

function scoreResults(results: GrantResult[], profile: TestProfile) {
  const joined = results
    .map((r) => `${r.title} ${r.organization ?? ""}`.toLowerCase())
    .join(" | ");

  const hits = profile.expected.filter((kw) => joined.includes(kw.toLowerCase()));
  const misses = profile.antiExpected.filter((kw) => joined.includes(kw.toLowerCase()));
  return { hits, misses };
}

async function run() {
  const allGrants = (await db
    .select()
    .from(grants)
    .where(eq(grants.status, "active"))) as unknown as GrantResult[];
  console.log(`📦 ${allGrants.length} grants actives chargées\n`);

  const summary: Array<{
    label: string;
    count: number;
    avgScore: number;
    hits: string[];
    misses: string[];
  }> = [];

  for (const profile of PROFILES) {
    console.log("━".repeat(80));
    console.log(`\n${profile.label}`);
    console.log(`  Region: ${profile.submission.region}`);
    console.log(`  Projet: ${profile.submission.projectDescription?.substring(0, 100)}...\n`);

    try {
      const results = await matchGrantsWithAI(
        profile.submission as FormSubmission,
        allGrants
      );

      const { hits, misses } = scoreResults(results, profile);
      const avgScore =
        results.reduce((s, r) => s + (r.matchScore ?? 0), 0) /
        Math.max(results.length, 1);

      console.log(`✅ ${results.length} résultats, score moyen ${avgScore.toFixed(0)}`);
      results.slice(0, 8).forEach((r, i) => {
        const reason = (r.matchReason ?? "").substring(0, 90).replace(/\s+/g, " ");
        console.log(
          `   ${i + 1}. [${r.matchScore ?? "?"}] ${r.title?.substring(0, 60)} — ${r.organization?.substring(0, 40)}`
        );
        if (reason) console.log(`      ↳ ${reason}...`);
      });

      console.log(
        `\n   🎯 Matches mots-clés attendus (${hits.length}/${profile.expected.length}) : ${hits.join(", ") || "aucun"}`
      );
      if (misses.length > 0) {
        console.log(`   ⚠️  Anti-matches détectés : ${misses.join(", ")}`);
      }

      summary.push({
        label: profile.label,
        count: results.length,
        avgScore,
        hits,
        misses,
      });
    } catch (e: any) {
      console.error(`❌ Erreur : ${e.message}`);
      summary.push({
        label: profile.label,
        count: 0,
        avgScore: 0,
        hits: [],
        misses: [],
      });
    }

    console.log();
  }

  // Synthèse finale
  console.log("━".repeat(80));
  console.log("\n📊 SYNTHÈSE\n");
  summary.forEach((s) => {
    const verdict =
      s.misses.length > 0
        ? "⚠️  bruit"
        : s.hits.length >= 2 && s.count >= 2
          ? "✅ OK"
          : s.count === 0
            ? "❌ vide"
            : "🤔 faible";
    console.log(
      `${verdict}  ${s.label.padEnd(52)} ${s.count} résultats, score moy ${s.avgScore.toFixed(0)}, ${s.hits.length}/${PROFILES.find((p) => p.label === s.label)!.expected.length} hits`
    );
  });

  process.exit(0);
}

run().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
