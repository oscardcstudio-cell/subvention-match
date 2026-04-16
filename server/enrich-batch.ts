/**
 * Script pour enrichir les subventions par batches (plus rapide et résistant)
 * Usage: tsx server/enrich-batch.ts
 */

import { db } from "./db.js";
import { grants } from "../shared/schema.js";
import { isNotNull, isNull, or, and, eq } from "drizzle-orm";
import { scrapeGrantUrl } from "./grant-scraper.js";

const BATCH_SIZE = 20;

async function enrichBatch() {
  console.log("🌐 Enrichissement par batch de 20 subventions...\n");
  
  // Récupérer 20 subventions qui n'ont pas encore été scrapées
  const grantsToScrape = await db
    .select({
      id: grants.id,
      title: grants.title,
      url: grants.url,
    })
    .from(grants)
    .where(
      and(
        isNotNull(grants.url),
        or(
          isNull(grants.helpResources),
          isNull(grants.improvedUrl)
        )
      )
    )
    .limit(BATCH_SIZE);
  
  if (grantsToScrape.length === 0) {
    console.log("✅ Toutes les subventions sont déjà enrichies!");
    return;
  }
  
  console.log(`📊 ${grantsToScrape.length} subventions à scraper\n`);
  
  let updated = 0;
  let failed = 0;
  let noChange = 0;
  
  // Scraper une par une pour éviter les timeouts
  for (let i = 0; i < grantsToScrape.length; i++) {
    const grant = grantsToScrape[i];
    
    console.log(`\n[${i + 1}/${grantsToScrape.length}] ${grant.title.substring(0, 50)}...`);
    
    try {
      const result = await scrapeGrantUrl(grant.url!, grant.title);
      
      if (!result.success) {
        failed++;
        console.log(`   ❌ Échec`);
        continue;
      }
      
      // Mettre à jour si on a trouvé quelque chose
      if (result.improvedUrl || result.helpResources.length > 0) {
        await db
          .update(grants)
          .set({
            improvedUrl: result.improvedUrl || null,
            helpResources: result.helpResources.length > 0 ? result.helpResources : null,
          })
          .where(eq(grants.id, grant.id));
        
        updated++;
        
        if (result.improvedUrl) {
          console.log(`   🔗 URL améliorée`);
        }
        if (result.helpResources.length > 0) {
          console.log(`   📚 ${result.helpResources.length} ressources d'aide`);
        }
      } else {
        noChange++;
        console.log(`   ⚪ Rien trouvé`);
      }
      
      // Pause de 500ms entre chaque scraping
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      failed++;
      console.error(`   ❌ Erreur:`, error);
    }
  }
  
  console.log(`\n📈 RÉSUMÉ:`);
  console.log(`   ✅ ${updated} subventions enrichies`);
  console.log(`   ⚪ ${noChange} sans changement`);
  console.log(`   ❌ ${failed} erreurs`);
  
  // Compter combien il en reste
  const remaining = await db
    .select({ count: grants.id })
    .from(grants)
    .where(
      and(
        isNotNull(grants.url),
        or(
          isNull(grants.helpResources),
          isNull(grants.improvedUrl)
        )
      )
    );
  
  console.log(`\n💡 Il reste environ ${remaining.length} subventions à enrichir`);
  console.log(`   Relancez: tsx server/enrich-batch.ts\n`);
}

enrichBatch()
  .then(() => {
    console.log("✅ Batch terminé!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur:", error);
    process.exit(1);
  });
