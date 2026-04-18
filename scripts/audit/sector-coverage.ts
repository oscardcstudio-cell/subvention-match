import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT unnest(eligible_sectors) as sector, COUNT(*) FROM grants WHERE status='active' AND eligible_sectors IS NOT NULL GROUP BY sector ORDER BY count DESC
`);
console.log("=== Couverture par eligible_sectors ===");
for (const x of r.rows as any[]) console.log(`  ${x.count.toString().padStart(4)}  ${x.sector}`);
const r2 = await db.execute(sql`
  SELECT unnest(grant_type) as type, COUNT(*) FROM grants WHERE status='active' AND grant_type IS NOT NULL GROUP BY type ORDER BY count DESC
`);
console.log("\n=== Couverture par grant_type ===");
for (const x of r2.rows as any[]) console.log(`  ${x.count.toString().padStart(4)}  ${x.type}`);
process.exit(0);
