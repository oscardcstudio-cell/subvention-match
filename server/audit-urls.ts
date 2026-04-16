/**
 * Script d'audit des URLs dans la base de données
 * Usage: tsx server/audit-urls.ts
 */

import { db } from "./db.js";
import { grants } from "../shared/schema.js";
import { scoreUrl, extractDomain } from "./url-validator.js";
import { isNotNull } from "drizzle-orm";

async function auditUrls() {
  console.log("🔍 Audit des URLs des subventions...\n");

  // Récupérer toutes les subventions avec URL
  const allGrants = await db
    .select({
      id: grants.id,
      title: grants.title,
      url: grants.url,
      organization: grants.organization,
    })
    .from(grants)
    .where(isNotNull(grants.url));

  console.log(`📊 ${allGrants.length} subventions avec URL à analyser\n`);

  // Statistiques
  const stats = {
    total: allGrants.length,
    excellent: 0,  // Score >= 80
    good: 0,       // Score >= 60
    average: 0,    // Score >= 40
    poor: 0,       // Score < 40
    byDomain: new Map<string, number>(),
  };

  const poorUrls: Array<{ title: string; url: string; score: number }> = [];

  // Analyser chaque URL
  for (const grant of allGrants) {
    const score = scoreUrl(grant.url!);
    const domain = extractDomain(grant.url!);

    // Catégoriser
    if (score >= 80) stats.excellent++;
    else if (score >= 60) stats.good++;
    else if (score >= 40) stats.average++;
    else {
      stats.poor++;
      poorUrls.push({ 
        title: grant.title, 
        url: grant.url!, 
        score 
      });
    }

    // Compter par domaine
    if (domain) {
      stats.byDomain.set(domain, (stats.byDomain.get(domain) || 0) + 1);
    }
  }

  // Afficher les résultats
  console.log("📈 RÉSULTATS DE L'AUDIT:\n");
  console.log(`✅ Excellentes (≥80): ${stats.excellent} (${Math.round(stats.excellent / stats.total * 100)}%)`);
  console.log(`👍 Bonnes (60-79): ${stats.good} (${Math.round(stats.good / stats.total * 100)}%)`);
  console.log(`⚠️  Moyennes (40-59): ${stats.average} (${Math.round(stats.average / stats.total * 100)}%)`);
  console.log(`❌ Faibles (<40): ${stats.poor} (${Math.round(stats.poor / stats.total * 100)}%)\n`);

  console.log("🌐 TOP 10 DOMAINES:");
  const topDomains = Array.from(stats.byDomain.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  topDomains.forEach(([domain, count]) => {
    console.log(`   ${count.toString().padStart(3)} × ${domain}`);
  });

  if (poorUrls.length > 0) {
    console.log(`\n⚠️  URLS DE FAIBLE QUALITÉ (${poorUrls.length}):\n`);
    poorUrls
      .sort((a, b) => a.score - b.score)
      .slice(0, 10)
      .forEach(({ title, url, score }) => {
        console.log(`   [${score}/100] ${title.substring(0, 50)}...`);
        console.log(`            → ${url}\n`);
      });
    
    if (poorUrls.length > 10) {
      console.log(`   ... et ${poorUrls.length - 10} autres URLs à améliorer\n`);
    }
  }

  console.log("\n💡 RECOMMANDATIONS:");
  console.log("   1. Re-synchroniser avec le script amélioré: tsx server/sync-grants.ts");
  console.log("   2. Pour les URLs faibles, vérifier manuellement et mettre à jour si nécessaire");
  console.log("   3. L'enrichissement IA peut aussi proposer de meilleures URLs lors du matching\n");
}

auditUrls()
  .then(() => {
    console.log("✅ Audit terminé!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
