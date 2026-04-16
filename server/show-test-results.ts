/**
 * Script pour afficher les résultats des 5 tests
 */

import { storage } from "./storage";

// IDs des 5 sessions de test (à récupérer depuis la base)
async function showAllTestResults() {
  console.log("\n╔" + "═".repeat(78) + "╗");
  console.log("║" + " ".repeat(20) + "RÉSULTATS DES 5 SIMULATIONS" + " ".repeat(31) + "║");
  console.log("╚" + "═".repeat(78) + "╝\n");

  // Récupérer toutes les sessions récentes
  const allSubmissions = await storage.getAllSubmissions();
  
  // Prendre les 5 dernières
  const lastFive = allSubmissions.slice(-5);

  for (let i = 0; i < lastFive.length; i++) {
    const submission = lastFive[i];
    const results = submission.results as any[];

    console.log(`\n${"━".repeat(80)}`);
    console.log(`📋 SIMULATION ${i + 1}/5`);
    console.log(`${"━".repeat(80)}\n`);

    console.log("👤 PROFIL:");
    console.log(`   Statut: ${submission.status?.join(", ") || "N/A"}`);
    console.log(`   Domaine: ${submission.artisticDomain?.join(", ") || "N/A"}`);
    console.log(`   Région: ${submission.region || "N/A"}`);
    console.log(`   Email: ${submission.email}`);
    console.log(`   Session ID: ${submission.sessionId}\n`);

    console.log("📝 PROJET:");
    console.log(`   ${submission.projectDescription}\n`);

    if (results && results.length > 0) {
      console.log(`🎯 ${results.length} SUBVENTIONS MATCHÉES:\n`);

      results.forEach((grant: any, idx: number) => {
        console.log(`   ${idx + 1}. ${grant.title}`);
        console.log(`      Organisation: ${grant.organization}`);
        console.log(`      Score de match: ${grant.matchScore || "N/A"}/100`);
        if (grant.matchReason) {
          const reason = grant.matchReason.length > 100 
            ? grant.matchReason.substring(0, 100) + "..." 
            : grant.matchReason;
          console.log(`      Raison: ${reason}`);
        }
        console.log("");
      });
    } else {
      console.log("❌ Aucune subvention matchée\n");
    }
  }

  console.log("\n" + "═".repeat(80));
  console.log("📊 RÉSUMÉ");
  console.log("═".repeat(80) + "\n");

  const totalGrants = lastFive.reduce((sum, sub) => {
    const results = sub.results as any[];
    return sum + (results?.length || 0);
  }, 0);

  const avgGrants = (totalGrants / lastFive.length).toFixed(1);

  console.log(`Total simulations: ${lastFive.length}`);
  console.log(`Total subventions matchées: ${totalGrants}`);
  console.log(`Moyenne par profil: ${avgGrants} subventions\n`);

  const breakdown = lastFive.map((sub, i) => {
    const results = sub.results as any[];
    return `   Profil ${i + 1}: ${results?.length || 0} subventions`;
  }).join("\n");

  console.log("Détail:");
  console.log(breakdown);
  console.log("");
}

showAllTestResults()
  .then(() => {
    console.log("✅ Affichage terminé!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
