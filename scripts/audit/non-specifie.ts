import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT id, title, url, improved_url FROM grants WHERE status='active' AND organization IN ('Non spécifié', 'Inconnu') LIMIT 30
`);
console.log(`${r.rows.length} grants sans organisme:`);
for (const x of r.rows as any[]) console.log(`  ${x.title.substring(0,70)} | ${x.url ?? x.improved_url}`);
process.exit(0);
