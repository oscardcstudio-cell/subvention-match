import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT
    COUNT(*) FILTER (WHERE application_difficulty IS NOT NULL)::int as diff,
    COUNT(*) FILTER (WHERE preparation_advice IS NOT NULL AND LENGTH(preparation_advice) >= 50)::int as advice,
    COUNT(*) FILTER (WHERE requirements IS NOT NULL AND LENGTH(requirements) >= 20)::int as req,
    COUNT(*) FILTER (WHERE eligible_sectors IS NOT NULL AND array_length(eligible_sectors,1) > 0)::int as sect,
    COUNT(*) FILTER (WHERE geographic_zone IS NOT NULL AND array_length(geographic_zone,1) > 0)::int as zone,
    COUNT(*) FILTER (WHERE grant_type IS NOT NULL AND array_length(grant_type,1) > 0)::int as type,
    COUNT(*)::int as total
  FROM grants WHERE status='active'
`);
console.log(JSON.stringify(r.rows[0]));
process.exit(0);
