/**
 * Script pour initialiser les organismes dans la base de données
 */

import { initializeOrganisms } from './scraping-system';

async function main() {
  try {
    await initializeOrganisms();
    console.log('✅ Initialisation terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();
