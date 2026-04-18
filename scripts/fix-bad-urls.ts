/**
 * Corrige les URLs génériques (homepages) des grants via AI-based search.
 * Usage: npx tsx scripts/fix-bad-urls.ts [--apply]
 */
import { db } from "../server/db";
import { grants } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { scoreUrl } from "../server/url-validator";
import { deepSearchUrl } from "../server/ai-url-searcher";

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await db.execute(sql`
    SELECT id, title, organization, url, improved_url
    FROM grants WHERE status='active'
  `);

  const bad: any[] = [];
  for (const r of rows.rows as any[]) {
    const chosen = r.improved_url || r.url;
    if (!chosen || scoreUrl(chosen) < 50) bad.push(r);
  }

  console.log(`${bad.length} URLs à corriger`);
  if (!apply) {
    for (const r of bad) console.log(`  ${r.id.substring(0,8)} | ${r.title.substring(0,40)} | ${r.improved_url || r.url}`);
    console.log("\n(--apply pour exécuter)");
    return;
  }

  let fixed = 0;
  for (const r of bad) {
    console.log(`\n→ ${r.title.substring(0, 60)}`);
    console.log(`  actuel: ${r.improved_url || r.url}`);
    try {
      const result = await deepSearchUrl(r.id);
      if (result.success && result.foundUrl) {
        console.log(`  ✅ trouvé: ${result.foundUrl}`);
        fixed++;
      } else {
        console.log(`  ❌ pas trouvé (${result.method})`);
      }
    } catch (e: any) {
      console.log(`  ❌ erreur: ${e.message}`);
    }
    await new Promise((res) => setTimeout(res, 1500));
  }
  console.log(`\n✅ ${fixed}/${bad.length} URLs corrigées.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
