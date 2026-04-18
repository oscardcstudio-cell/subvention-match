import { db } from "../../server/db";
import { sql } from "drizzle-orm";
import { scoreUrl } from "../../server/url-validator";

// If improved_url scores worse than url, null it out.
const rows = await db.execute(sql`SELECT id, url, improved_url FROM grants WHERE status='active' AND improved_url IS NOT NULL`);
let cleaned = 0;
for (const r of rows.rows as any[]) {
  if (!r.improved_url) continue;
  const urlScore = r.url ? scoreUrl(r.url) : 0;
  const improvedScore = scoreUrl(r.improved_url);
  if (improvedScore < urlScore) {
    await db.execute(sql`UPDATE grants SET improved_url = NULL, updated_at = NOW() WHERE id = ${r.id}`);
    cleaned++;
  }
}
console.log(`${cleaned} improved_url pollués nettoyés`);
process.exit(0);
