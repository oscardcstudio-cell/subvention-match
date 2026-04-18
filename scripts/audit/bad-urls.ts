import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import { scoreUrl } from "../../server/url-validator";

async function main() {
  const rows = await db.execute(sql`
    SELECT id, title, organization, url, improved_url
    FROM grants WHERE status = 'active'
  `);

  const bad: any[] = [];
  for (const r of rows.rows as any[]) {
    const chosen = r.improved_url || r.url;
    if (!chosen) { bad.push(r); continue; }
    if (scoreUrl(chosen) < 50) bad.push(r);
  }

  console.log(`=== ${bad.length} URLs faible score (<50) ===`);
  for (const r of bad) {
    console.log(`  ${r.organization.substring(0,40).padEnd(40)} | ${r.title.substring(0,50).padEnd(50)} | ${r.improved_url || r.url}`);
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
