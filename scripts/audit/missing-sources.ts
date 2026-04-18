import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT organization, COUNT(*) FROM grants WHERE status='active' GROUP BY organization ORDER BY count DESC
`);
console.log("=== Organismes actifs (> 1) ===");
for (const x of r.rows as any[]) if (parseInt(x.count) >= 1) console.log(`  ${x.count.toString().padStart(4)}  ${x.organization}`);
process.exit(0);
