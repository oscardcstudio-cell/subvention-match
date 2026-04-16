/**
 * Script de test pour le système de scraping
 */

import { db } from './db';
import { organismsTracking } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { scrapeOrganism } from './scraping-system';

async function main() {
  try {
    // Récupérer le CNM
    const cnm = await db.select()
      .from(organismsTracking)
      .where(eq(organismsTracking.name, 'Centre National de la Musique (CNM)'))
      .limit(1);
    
    if (cnm.length === 0) {
      console.error('❌ CNM non trouvé dans la base');
      process.exit(1);
    }
    
    console.log('🚀 Test de scraping du CNM...\n');
    
    // Lancer le scraping
    const result = await scrapeOrganism(cnm[0].id);
    
    console.log('\n📊 Résultats:');
    console.log(`  Succès: ${result.success}`);
    console.log(`  Aides trouvées: ${result.grantsFound.length}`);
    console.log(`  Aides ajoutées: ${result.grantsAdded}`);
    
    if (result.error) {
      console.log(`  Erreur: ${result.error}`);
    }
    
    if (result.grantsFound.length > 0) {
      console.log('\n📝 Exemples d\'aides trouvées:');
      result.grantsFound.slice(0, 3).forEach((grant, i) => {
        console.log(`\n  ${i + 1}. ${grant.title}`);
        console.log(`     Organisation: ${grant.organization}`);
        console.log(`     URL: ${grant.url}`);
        if (grant.description) {
          console.log(`     Description: ${grant.description.substring(0, 100)}...`);
        }
      });
    }
    
    console.log('\n✅ Test terminé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
