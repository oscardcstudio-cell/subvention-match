import { db } from "../../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const rows = await db.execute(sql`
    SELECT title, organization, application_difficulty, preparation_advice, requirements, eligible_sectors, geographic_zone, grant_type, amount, amount_min, amount_max
    FROM grants
    WHERE status='active' AND application_difficulty IS NOT NULL AND preparation_advice IS NOT NULL
    ORDER BY updated_at DESC LIMIT 3
  `);
  for (const r of rows.rows as any[]) {
    console.log("\n---");
    console.log("Title:", r.title.substring(0, 70));
    console.log("Org:", r.organization);
    console.log("Difficulty:", r.application_difficulty);
    console.log("Advice:", r.preparation_advice);
    console.log("Requirements:", (r.requirements || "").substring(0, 200));
    console.log("Sectors:", r.eligible_sectors);
    console.log("Zone:", r.geographic_zone);
    console.log("Type:", r.grant_type);
    console.log("Amounts:", r.amount, r.amount_min, r.amount_max);
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
