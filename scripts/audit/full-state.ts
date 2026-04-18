import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`
  SELECT
    COUNT(*) FILTER (WHERE amount IS NOT NULL OR amount_min IS NOT NULL OR amount_max IS NOT NULL)::int as amount,
    COUNT(*) FILTER (WHERE amount IS NOT NULL)::int as amount_fixed,
    COUNT(*) FILTER (WHERE amount_min IS NOT NULL)::int as amount_min,
    COUNT(*) FILTER (WHERE amount_max IS NOT NULL)::int as amount_max,
    COUNT(*) FILTER (WHERE deadline IS NOT NULL)::int as deadline,
    COUNT(*) FILTER (WHERE frequency IS NOT NULL)::int as freq,
    COUNT(*) FILTER (WHERE obligatory_documents IS NOT NULL AND array_length(obligatory_documents,1) > 0)::int as docs,
    COUNT(*) FILTER (WHERE contact_email IS NOT NULL)::int as email,
    COUNT(*) FILTER (WHERE contact_phone IS NOT NULL)::int as phone,
    COUNT(*)::int as total
  FROM grants WHERE status='active'
`);
console.log(r.rows[0]);
process.exit(0);
