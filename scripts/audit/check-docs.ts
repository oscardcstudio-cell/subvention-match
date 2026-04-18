import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT unnest(obligatory_documents) as d, COUNT(*) FROM grants 
  WHERE status='active' AND obligatory_documents IS NOT NULL 
  GROUP BY d ORDER BY count DESC LIMIT 30
`);
for (const x of r.rows as any[]) console.log(`  ${x.count.toString().padStart(4)}  ${x.d}`);
process.exit(0);
