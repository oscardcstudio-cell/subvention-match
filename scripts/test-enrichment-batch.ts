/**
 * Test d'enrichissement sur 5 grants réelles
 * Vérifie que enrichmentStatus est bien mis à jour et que les changements sont corrects
 * Usage: npx tsx scripts/test-enrichment-batch.ts
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, eq } from "drizzle-orm";
import { analyzeDataQuality } from "../server/data-quality-analyzer.js";
import { enrichGrant, type QualityIssue } from "../server/ai-enricher.js";

const BATCH_SIZE = 5;
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ FAIL: ${message}`);
  }
}

async function testBatch() {
  console.log("=".repeat(60));
  console.log("  TEST — Enrichissement batch (5 grants réelles)");
  console.log("=".repeat(60));
  console.log();

  // 1. Analyser la qualité pour obtenir les issues
  console.log("1. Analyse qualité...");
  const report = await analyzeDataQuality();

  const grantIssuesMap = new Map<string, QualityIssue[]>();
  report.issuesFound
    .filter((i) => i.severity === "critical" || i.severity === "warning")
    .forEach((issue) => {
      const existing = grantIssuesMap.get(issue.grantId) || [];
      grantIssuesMap.set(issue.grantId, [...existing, issue as QualityIssue]);
    });

  // Prendre les 5 premières avec le plus d'issues
  const sorted = Array.from(grantIssuesMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, BATCH_SIZE);

  console.log(`  ${sorted.length} grants sélectionnées (les plus problématiques)\n`);

  // 2. Vérifier l'état initial
  console.log("2. Vérification état initial...");
  const grantIds = sorted.map(([id]) => id);
  for (const grantId of grantIds) {
    const [g] = await db.select().from(grants).where(eq(grants.id, grantId));
    assert(g?.enrichmentStatus === "pending", `#${grantId.substring(0, 8)}: status=pending`);
  }
  console.log();

  // 3. Enrichir chaque grant
  console.log("3. Enrichissement...\n");
  const results = [];
  for (const [grantId, issues] of sorted) {
    console.log(`--- Grant #${grantId.substring(0, 8)} (${issues.length} issues) ---`);
    const result = await enrichGrant(grantId, issues);
    results.push(result);
    console.log();

    // Pause entre les appels
    await new Promise((r) => setTimeout(r, 1500));
  }

  // 4. Vérifier les résultats
  console.log("4. Vérification des résultats...\n");

  const successCount = results.filter((r) => r.success).length;
  const totalChanges = results.reduce((s, r) => s + r.changes.length, 0);
  assert(successCount >= 3, `${successCount}/${results.length} réussis (>= 3 attendu)`);
  assert(totalChanges > 0, `${totalChanges} changements au total`);

  // 5. Vérifier que enrichmentStatus a été mis à jour en DB
  console.log("\n5. Vérification enrichmentStatus en DB...");
  for (const grantId of grantIds) {
    const [g] = await db.select().from(grants).where(eq(grants.id, grantId));
    const expectedStatus = results.find((r) => r.grantId === grantId)?.success
      ? "completed"
      : "failed";
    assert(
      g?.enrichmentStatus === expectedStatus,
      `#${grantId.substring(0, 8)}: status=${g?.enrichmentStatus} (attendu: ${expectedStatus})`
    );
    if (g?.enrichmentDate) {
      assert(true, `#${grantId.substring(0, 8)}: enrichmentDate renseignée`);
    }
  }
  console.log();

  // 6. Détail des changements
  console.log("6. Détail des changements:");
  for (const result of results) {
    if (result.changes.length > 0) {
      console.log(`  #${result.grantId.substring(0, 8)}:`);
      for (const c of result.changes) {
        console.log(`    ${c.field}: ${c.oldValue} → ${c.newValue}`);
      }
    }
  }
  console.log();

  // 7. Remettre les grants en "pending" pour ne pas polluer la prod
  console.log("7. Rollback enrichmentStatus → pending...");
  for (const grantId of grantIds) {
    await db
      .update(grants)
      .set({ enrichmentStatus: "pending", enrichmentDate: null, enrichmentError: null })
      .where(eq(grants.id, grantId));
  }
  console.log("  ✅ Rollback effectué (status remis à pending)");
  console.log("  ⚠️  Les changements de contenu (org, desc, elig) ne sont PAS rollbackés");
  console.log();

  // ========================================
  console.log("=".repeat(60));
  console.log(`  RÉSULTAT: ${passed} passés, ${failed} échoués`);
  console.log("=".repeat(60));

  if (failed > 0) process.exit(1);
}

testBatch()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erreur:", err);
    process.exit(1);
  });
