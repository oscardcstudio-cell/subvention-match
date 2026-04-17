/**
 * Test du matching IA sur 3 profils types
 * Usage: npx tsx scripts/test-matching.ts
 */
import { grantStorage } from "../server/grant-storage.js";
import { matchGrantsWithAI } from "../server/ai-matcher.js";

// Format Grant → GrantResult (repris de routes.ts)
function formatGrantToResult(grant: any): any {
  return {
    ...grant,
    amount: grant.amount
      ? `${grant.amount}€`
      : grant.amountMax
      ? `Jusqu'à ${grant.amountMax}€`
      : grant.amountMin
      ? `À partir de ${grant.amountMin}€`
      : "Variable selon projet",
  };
}

// 3 profils types
const PROFILES = [
  {
    name: "Compositrice électro IDF",
    submission: {
      sessionId: "test-musique-idf",
      email: "test@test.fr",
      region: "Île-de-France",
      status: ["artiste"],
      artisticDomain: ["musique"],
      age: 28,
      projectDescription: "Création d'un album de musique électronique expérimentale avec résidence de 3 mois dans un studio parisien.",
      projectType: ["creation"],
      projectStage: "en cours",
      aidTypes: ["subvention", "bourse"],
      innovation: [],
      socialDimension: [],
      geographicScope: ["national"],
    },
  },
  {
    name: "Écrivain Occitanie",
    submission: {
      sessionId: "test-ecriture-occ",
      email: "test@test.fr",
      region: "Occitanie",
      status: ["artiste", "auteur"],
      artisticDomain: ["ecriture", "litterature"],
      age: 42,
      projectDescription: "Écriture d'un roman historique sur les cathares, résidence de 6 mois prévue.",
      projectType: ["creation", "residence"],
      projectStage: "debut",
      aidTypes: ["bourse", "residence"],
      geographicScope: ["regional"],
    },
  },
  {
    name: "Assoc spectacle vivant Bretagne",
    submission: {
      sessionId: "test-theatre-bre",
      email: "test@test.fr",
      region: "Bretagne",
      status: ["association"],
      artisticDomain: ["theatre", "spectacle_vivant"],
      projectDescription: "Festival de théâtre de rue itinérant dans 8 communes rurales bretonnes, programmation de 12 compagnies.",
      projectType: ["diffusion", "evenement"],
      projectStage: "en cours",
      aidTypes: ["subvention"],
      socialDimension: ["rural"],
      geographicScope: ["regional", "local"],
    },
  },
];

async function run() {
  console.log("=".repeat(60));
  console.log("  TEST MATCHING — 3 profils");
  console.log("=".repeat(60));
  console.log();

  const allGrants = await grantStorage.getAllActiveGrants();
  const formattedGrants = allGrants.map(formatGrantToResult);
  console.log(`Base: ${allGrants.length} grants actives\n`);

  for (const profile of PROFILES) {
    console.log("─".repeat(60));
    console.log(`📝 ${profile.name}`);
    console.log("─".repeat(60));
    console.log(`   Région: ${profile.submission.region}`);
    console.log(`   Domaine: ${profile.submission.artisticDomain?.join(", ")}`);
    console.log(`   Projet: ${profile.submission.projectDescription?.substring(0, 80)}...`);
    console.log();

    const start = Date.now();
    const matches = await matchGrantsWithAI(profile.submission as any, formattedGrants);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`⏱️  Matching en ${elapsed}s → ${matches.length} résultats\n`);

    for (let i = 0; i < Math.min(matches.length, 5); i++) {
      const m = matches[i];
      console.log(`  ${i + 1}. [${m.relevanceScore ?? "?"}%] ${(m.title || "").substring(0, 60)}`);
      console.log(`     ${m.organization?.substring(0, 50)} | ${m.amount || "?"}`);
      if ((m as any).matchReason) {
        console.log(`     💡 ${(m as any).matchReason.substring(0, 120)}`);
      }
    }
    if (matches.length > 5) console.log(`  ... et ${matches.length - 5} autres`);
    console.log();
  }

  console.log("=".repeat(60));
  console.log("  FIN");
  console.log("=".repeat(60));
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error("Erreur:", e); process.exit(1); });
