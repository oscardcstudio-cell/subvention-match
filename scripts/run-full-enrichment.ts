/**
 * Enrichissement massif de toutes les grants en pending
 * Usage: npx tsx scripts/run-full-enrichment.ts [--limit N]
 *
 * Analyse la qualité, identifie les grants à enrichir, et lance
 * l'enrichissement IA (DeepSeek) sur chacune.
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, eq } from "drizzle-orm";
import { analyzeDataQuality } from "../server/data-quality-analyzer.js";
import { enrichGrant, type QualityIssue } from "../server/ai-enricher.js";

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

async function run() {
  const startTime = Date.now();

  console.log("=".repeat(60));
  console.log("  ENRICHISSEMENT MASSIF — Mecene");
  console.log("=".repeat(60));
  console.log();

  // 1. Vérifier les grants pending
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(grants)
    .where(sql`status = 'active' AND enrichment_status = 'pending'`);

  console.log(`Grants en pending: ${count}`);

  if (count === 0) {
    console.log("Rien à enrichir !");
    return;
  }

  // 2. Analyser la qualité
  console.log("\nAnalyse qualité en cours...");
  const report = await analyzeDataQuality();

  // 3. Grouper issues par grant (critical + warning uniquement)
  const grantIssuesMap = new Map<string, QualityIssue[]>();
  report.issuesFound
    .filter((i) => i.severity === "critical" || i.severity === "warning")
    .forEach((issue) => {
      const existing = grantIssuesMap.get(issue.grantId) || [];
      grantIssuesMap.set(issue.grantId, [...existing, issue as QualityIssue]);
    });

  // 4. Ne garder que les grants encore en pending
  const pendingGrants = await db
    .select({ id: grants.id })
    .from(grants)
    .where(sql`status = 'active' AND enrichment_status = 'pending'`);
  const pendingIds = new Set(pendingGrants.map((g) => g.id));

  let requests = Array.from(grantIssuesMap.entries())
    .filter(([id]) => pendingIds.has(id))
    .sort((a, b) => b[1].length - a[1].length); // plus d'issues en premier

  const totalToEnrich = requests.length;
  if (LIMIT < Infinity) {
    requests = requests.slice(0, LIMIT);
  }

  console.log(`\nGrants avec issues (critical/warning): ${totalToEnrich}`);
  console.log(`Grants à enrichir dans ce run: ${requests.length}`);
  console.log(`Temps estimé: ~${Math.ceil((requests.length * 8) / 60)} minutes`);
  console.log();

  if (requests.length === 0) {
    console.log("Aucune grant pending avec des issues à corriger.");
    return;
  }

  // 5. Enrichir
  let success = 0;
  let failed = 0;
  let totalChanges = 0;
  const errors: { id: string; error: string }[] = [];

  for (let i = 0; i < requests.length; i++) {
    const [grantId, issues] = requests[i];
    const grantTitle = issues[0]?.grantTitle?.substring(0, 50) || grantId;

    console.log(`[${i + 1}/${requests.length}] ${grantTitle}...`);

    const result = await enrichGrant(grantId, issues);

    if (result.success) {
      success++;
      totalChanges += result.changes.length;
      if (result.changes.length > 0) {
        const fields = result.changes.map((c) => c.field).join(", ");
        console.log(`  → ${result.changes.length} changements: ${fields}`);
      }
    } else {
      failed++;
      errors.push({ id: grantId, error: result.error || "?" });
      console.log(`  → ÉCHEC: ${result.error}`);
    }

    // Pause entre les grants (API rate limit)
    if (i < requests.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Progress tous les 20
    if ((i + 1) % 20 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      const remaining = (((requests.length - i - 1) * 8) / 60).toFixed(1);
      console.log(`\n--- Progress: ${i + 1}/${requests.length} (${elapsed}m écoulé, ~${remaining}m restant) ---\n`);
    }
  }

  // 6. Stats finales
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log("\n" + "=".repeat(60));
  console.log("  RÉSUMÉ");
  console.log("=".repeat(60));
  console.log(`  Durée: ${elapsed} minutes`);
  console.log(`  Réussis: ${success}/${requests.length}`);
  console.log(`  Échecs: ${failed}`);
  console.log(`  Total changements: ${totalChanges}`);

  if (errors.length > 0) {
    console.log(`\n  Erreurs:`);
    for (const e of errors.slice(0, 10)) {
      console.log(`    - ${e.id.substring(0, 8)}: ${e.error}`);
    }
    if (errors.length > 10) console.log(`    ... et ${errors.length - 10} de plus`);
  }

  // 7. Stats DB finales
  const [finalStats] = await db
    .select({
      pending: sql<number>`count(*) filter (where enrichment_status = 'pending')::int`,
      completed: sql<number>`count(*) filter (where enrichment_status = 'completed')::int`,
      failed: sql<number>`count(*) filter (where enrichment_status = 'failed')::int`,
    })
    .from(grants)
    .where(sql`status = 'active'`);

  console.log(`\n  État DB final:`);
  console.log(`    pending:   ${finalStats?.pending}`);
  console.log(`    completed: ${finalStats?.completed}`);
  console.log(`    failed:    ${finalStats?.failed}`);
  console.log("=".repeat(60));
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Erreur fatale:", err);
    process.exit(1);
  });
