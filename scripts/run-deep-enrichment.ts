/**
 * Lance deepEnrichGrant sur toutes les grants actives qui ont au moins un
 * champ structuré manquant (difficulty / advice / requirements / docs /
 * sectors / zone / type / amount).
 *
 * Usage: npx tsx scripts/run-deep-enrichment.ts [--limit N] [--concurrency K]
 */
import { db } from "../server/db";
import { grants } from "../shared/schema";
import { sql, and, eq } from "drizzle-orm";
import { deepEnrichGrant } from "../server/deep-enricher";

const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
const concIdx = args.indexOf("--concurrency");
const CONCURRENCY = concIdx >= 0 ? parseInt(args[concIdx + 1], 10) : 4;

async function run() {
  const start = Date.now();

  // Pick grants that need at least one field filled
  const rows = await db.execute(sql`
    SELECT id, title FROM grants
    WHERE status = 'active'
      AND (
        application_difficulty IS NULL
        OR preparation_advice IS NULL OR LENGTH(preparation_advice) < 30
        OR requirements IS NULL OR LENGTH(requirements) < 20
        OR obligatory_documents IS NULL OR array_length(obligatory_documents, 1) IS NULL
        OR eligible_sectors IS NULL OR array_length(eligible_sectors, 1) IS NULL
        OR geographic_zone IS NULL OR array_length(geographic_zone, 1) IS NULL
        OR grant_type IS NULL OR array_length(grant_type, 1) IS NULL
        OR (amount IS NULL AND amount_min IS NULL AND amount_max IS NULL)
      )
    ORDER BY updated_at DESC
  `);

  const items = (rows.rows as any[]).slice(0, LIMIT);
  console.log(`${items.length} grants à enrichir (concurrence ${CONCURRENCY})`);
  if (items.length === 0) { console.log("Rien à faire."); return; }

  let done = 0, success = 0, failed = 0;
  const errors: string[] = [];
  const changesCount: Record<string, number> = {};

  // Process with limited concurrency
  const queue = [...items];
  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const r = await deepEnrichGrant(item.id);
      done++;
      if (r.success) {
        success++;
        for (const c of r.changes) changesCount[c] = (changesCount[c] || 0) + 1;
        if (done % 10 === 0 || r.changes.length > 0) {
          const mins = ((Date.now() - start) / 60000).toFixed(1);
          console.log(`[${done}/${items.length}] (${mins}m) ${item.title.substring(0, 55)} → ${r.changes.join(",") || "no-op"}`);
        }
      } else {
        failed++;
        errors.push(`${item.id.substring(0, 8)}: ${r.error}`);
        console.log(`[${done}/${items.length}] ❌ ${item.title.substring(0, 50)}: ${r.error}`);
      }
      await new Promise((res) => setTimeout(res, 400)); // rate limit buffer
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const mins = ((Date.now() - start) / 60000).toFixed(1);
  console.log(`\n=== Terminé en ${mins} minutes ===`);
  console.log(`  ✅ Succès: ${success}`);
  console.log(`  ❌ Échecs: ${failed}`);
  console.log(`  Changements par champ:`);
  for (const [k, v] of Object.entries(changesCount).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${k}: ${v}`);
  }
  if (errors.length > 0) {
    console.log(`\nPremières erreurs:`);
    for (const e of errors.slice(0, 10)) console.log(`  ${e}`);
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
