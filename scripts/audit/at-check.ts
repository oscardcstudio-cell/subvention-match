import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT id, title, url, improved_url FROM grants 
  WHERE status='active' 
    AND (url = 'https://aides-territoires.beta.gouv.fr/' OR improved_url = 'https://aides-territoires.beta.gouv.fr/')
`);
console.log(`found: ${r.rows.length}`);
for (const x of r.rows as any[]) console.log(`  url=${x.url} improved=${x.improved_url}`);
process.exit(0);
