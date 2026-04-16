/**
 * Script pour enrichir automatiquement toutes les subventions actives
 * qui ont des problèmes détectés (critical ou warning)
 */

import { analyzeDataQuality } from './data-quality-analyzer';
import { enrichMultipleGrants } from './ai-enricher';

async function runEnrichment() {
  console.log('🚀 Démarrage de l\'enrichissement automatique...\n');
  
  // 1. Analyser la qualité des données
  console.log('📊 Analyse de la qualité des données...');
  const report = await analyzeDataQuality();
  
  console.log(`\n✅ Analyse terminée:`);
  console.log(`   - Total subventions actives: ${report.totalGrants}`);
  console.log(`   - Problèmes détectés: ${report.issuesFound.length}`);
  console.log(`   - Critical: ${report.summary.critical}`);
  console.log(`   - Warnings: ${report.summary.warnings}`);
  console.log(`   - Info: ${report.summary.info}\n`);
  
  // 2. Grouper les issues par subvention (critical + warning uniquement)
  const grantIssuesMap = new Map<string, any[]>();
  
  report.issuesFound
    .filter(issue => issue.severity === 'critical' || issue.severity === 'warning')
    .forEach(issue => {
      const existing = grantIssuesMap.get(issue.grantId) || [];
      grantIssuesMap.set(issue.grantId, [...existing, issue]);
    });
  
  const requests = Array.from(grantIssuesMap.entries()).map(([grantId, issues]) => ({
    grantId,
    issues,
  }));
  
  console.log(`🎯 ${requests.length} subventions à enrichir\n`);
  
  if (requests.length === 0) {
    console.log('✨ Aucune subvention à enrichir. Tout est déjà de bonne qualité !');
    return;
  }
  
  // 3. Lancer l'enrichissement
  console.log(`⏱️  Temps estimé: ~${Math.ceil(requests.length / 60)} minutes (1 sec/subvention)\n`);
  console.log('🤖 Enrichissement en cours...\n');
  
  const results = await enrichMultipleGrants(requests);
  
  // 4. Afficher les résultats
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalChanges = results.reduce((sum, r) => sum + r.changes.length, 0);
  
  console.log('\n📈 Résultats de l\'enrichissement:');
  console.log(`   ✅ Réussis: ${successful}/${requests.length}`);
  console.log(`   ❌ Échecs: ${failed}`);
  console.log(`   📝 Total changements: ${totalChanges}`);
  
  // Afficher les échecs
  if (failed > 0) {
    console.log('\n⚠️  Échecs détaillés:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - Subvention ${r.grantId}: ${r.error}`);
      });
  }
  
  // Afficher un échantillon de changements
  console.log('\n📋 Échantillon de changements (5 premiers):');
  results
    .filter(r => r.success && r.changes.length > 0)
    .slice(0, 5)
    .forEach(r => {
      console.log(`\n   Subvention ${r.grantId}:`);
      r.changes.forEach(change => {
        console.log(`      - ${change.field}: "${change.oldValue.substring(0, 50)}..." → "${change.newValue.substring(0, 50)}..."`);
      });
    });
  
  console.log('\n✨ Enrichissement terminé !');
}

// Lancer le script
runEnrichment().catch(error => {
  console.error('❌ Erreur lors de l\'enrichissement:', error);
  process.exit(1);
});
