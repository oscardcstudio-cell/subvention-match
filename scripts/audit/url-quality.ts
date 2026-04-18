import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import { scoreUrl } from "../../server/url-validator";

async function main() {
  const rows = await db.execute(sql`
    SELECT id, title, organization, url, improved_url
    FROM grants WHERE status = 'active'
  `);

  let withUrl = 0;
  let withImproved = 0;
  let goodUrl = 0;
  let goodImproved = 0;
  const homepages: string[] = [];
  const urlBuckets: Record<string, number> = {};

  for (const r of rows.rows as any[]) {
    if (r.url) withUrl++;
    if (r.improved_url) withImproved++;

    const chosen = r.improved_url || r.url;
    if (!chosen) continue;
    const s = scoreUrl(chosen);
    if (chosen === r.url) {
      if (s >= 60) goodUrl++;
    }
    if (chosen === r.improved_url) {
      if (s >= 60) goodImproved++;
    }
    if (s < 40) homepages.push(`${r.organization} | ${r.title.substring(0,50)} | ${chosen}`);

    try {
      const host = new URL(chosen).hostname.replace(/^www\./, "");
      urlBuckets[host] = (urlBuckets[host] || 0) + 1;
    } catch {}
  }

  console.log("total active:", rows.rows.length);
  console.log("with url:", withUrl);
  console.log("with improved_url:", withImproved);
  console.log("good url score>=60 (when only url):", goodUrl);
  console.log("good improved_url score>=60:", goodImproved);
  console.log("\n=== TOP DOMAINS ===");
  const sorted = Object.entries(urlBuckets).sort((a, b) => b[1] - a[1]).slice(0, 20);
  for (const [d, c] of sorted) console.log(`  ${c.toString().padStart(4)}  ${d}`);
  console.log(`\n=== ${homepages.length} URL "homepages"/faible score (sample 10) ===`);
  for (const h of homepages.slice(0, 10)) console.log("  " + h);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
