/**
 * Script pour enrichir les subventions avec scraping web
 * Usage: tsx server/enrich-grants-with-scraping.ts [--limit N]
 */

import { db } from "./db.js";
import { grants } from "../shared/schema.js";
import { isNotNull } from "drizzle-orm";
import { scrapeGrantUrl, batchScrapeGrants } from "./grant-scraper.js";

async function enrichGrantsWithScraping() {
  console.log("🌐 Enrichissement des subventions avec scraping web...\n");
  
  // Récupérer les arguments (limit optionnel)
  const args = process.argv.slice(2);
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : undefined;
  
  // Récupérer les subventions avec URL mais sans scraping
  let query = db
    .select({
      id: grants.id,
      title: grants.title,
      url: grants.url,
      improvedUrl: grants.improvedUrl,
      helpResources: grants.helpResources,
    })
    .from(grants)
    .where(isNotNull(grants.url));
  
  if (limit) {
    query = query.limit(limit) as any;
  }
  
  const grantsToScrape = await query;
  
  console.log(`📊 ${grantsToScrape.length} subventions à scraper\n`);
  
  if (grantsToScrape.length === 0) {
    console.log("✅ Aucune subvention à enrichir!");
    return;
  }
  
  // Filtrer celles qui n'ont pas encore été scrapées
  const needsScraping = grantsToScrape.filter(g => 
    !g.improvedUrl && (!g.helpResources || (g.helpResources as any[]).length === 0)
  );
  
  console.log(`🔍 ${needsScraping.length} subventions n'ont pas encore été scrapées\n`);
  
  if (needsScraping.length === 0) {
    console.log("✅ Toutes les subventions sont déjà enrichies!");
    return;
  }
  
  // Scraper en batch (3 par 3 pour ne pas surcharger)
  const scrapeResults = await batchScrapeGrants(
    needsScraping.map(g => ({ id: g.id, url: g.url!, title: g.title })),
    3 // Concurrence
  );
  
  // Mettre à jour la base de données
  console.log("\n💾 Mise à jour de la base de données...\n");
  
  let updated = 0;
  let failed = 0;
  
  for (const [grantId, result] of Array.from(scrapeResults.entries())) {
    if (!result.success) {
      failed++;
      continue;
    }
    
    // Mettre à jour uniquement si on a trouvé quelque chose
    if (result.improvedUrl || result.helpResources.length > 0) {
      await db
        .update(grants)
        .set({
          improvedUrl: result.improvedUrl,
          helpResources: result.helpResources.length > 0 ? result.helpResources : null,
        })
        .where(eq(grants.id, grantId));
      
      updated++;
      
      console.log(`   ✅ ${grantId.substring(0, 8)}... enrichi:`);
      if (result.improvedUrl) {
        console.log(`      🔗 URL améliorée`);
      }
      if (result.helpResources.length > 0) {
        console.log(`      📚 ${result.helpResources.length} ressources d'aide`);
      }
    }
  }
  
  console.log(`\n📈 RÉSUMÉ:`);
  console.log(`   ✅ ${updated} subventions enrichies`);
  console.log(`   ❌ ${failed} erreurs`);
  console.log(`   📊 ${scrapeResults.size - updated - failed} sans changement\n`);
}

// Import dynamique pour eq
import { eq } from "drizzle-orm";

enrichGrantsWithScraping()
  .then(() => {
    console.log("✅ Enrichissement terminé!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
