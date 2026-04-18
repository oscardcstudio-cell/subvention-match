import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`SELECT id, url, improved_url FROM grants WHERE id IN ('136b' || '', '')`);
// Real query: find those 6 remaining by title
const r2 = await db.execute(sql`SELECT title, url, improved_url FROM grants WHERE status='active' AND title IN (
  'Favoriser la culture pour tous',
  'Promouvoir la culture et le savoir-faire alpins',
  'Aide aux artistes de moins de 30 ans'
)`);
for (const x of r2.rows as any[]) console.log(x);
process.exit(0);
