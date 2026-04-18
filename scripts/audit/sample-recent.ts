import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT title, organization, application_difficulty, preparation_advice, 
         eligible_sectors, geographic_zone, grant_type, amount, amount_min, amount_max, 
         obligatory_documents, requirements
  FROM grants
  WHERE status='active' AND enrichment_status='completed' AND enrichment_date > NOW() - INTERVAL '20 minutes'
  ORDER BY enrichment_date DESC LIMIT 5
`);
for (const x of r.rows as any[]) {
  console.log("\n---");
  console.log("Title:", x.title.substring(0, 80));
  console.log("Org:", x.organization);
  console.log("Difficulty:", x.application_difficulty);
  console.log("Advice:", (x.preparation_advice || "").substring(0, 200));
  console.log("Requirements:", (x.requirements || "").substring(0, 150));
  console.log("Docs:", x.obligatory_documents);
  console.log("Sectors:", x.eligible_sectors);
  console.log("Zone:", x.geographic_zone);
  console.log("Type:", x.grant_type);
  console.log("Amounts:", x.amount, x.amount_min, x.amount_max);
}
process.exit(0);
