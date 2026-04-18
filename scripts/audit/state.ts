import { db } from "../../server/db";
import { sql } from "drizzle-orm";

async function main() {
  const total = await db.execute(sql`SELECT COUNT(*) as c FROM grants`);
  const byStatus = await db.execute(sql`SELECT status, COUNT(*) as c FROM grants GROUP BY status`);
  const byEnrich = await db.execute(sql`SELECT enrichment_status, COUNT(*) as c FROM grants GROUP BY enrichment_status`);

  const activeMissing = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE description IS NULL OR LENGTH(description) < 50) as missing_description,
      COUNT(*) FILTER (WHERE eligibility IS NULL OR LENGTH(eligibility) < 30) as missing_eligibility,
      COUNT(*) FILTER (WHERE requirements IS NULL OR LENGTH(requirements) < 20) as missing_requirements,
      COUNT(*) FILTER (WHERE url IS NULL OR url = '') as missing_url,
      COUNT(*) FILTER (WHERE improved_url IS NULL OR improved_url = '') as missing_improved_url,
      COUNT(*) FILTER (WHERE amount IS NULL AND amount_min IS NULL AND amount_max IS NULL) as missing_amount,
      COUNT(*) FILTER (WHERE deadline IS NULL OR deadline = '') as missing_deadline,
      COUNT(*) FILTER (WHERE eligible_sectors IS NULL OR array_length(eligible_sectors,1) IS NULL) as missing_sectors,
      COUNT(*) FILTER (WHERE preparation_advice IS NULL OR LENGTH(preparation_advice) < 30) as missing_advice,
      COUNT(*) FILTER (WHERE application_difficulty IS NULL) as missing_difficulty,
      COUNT(*) FILTER (WHERE obligatory_documents IS NULL OR array_length(obligatory_documents,1) IS NULL) as missing_docs,
      COUNT(*) FILTER (WHERE contact_email IS NULL AND contact_phone IS NULL) as missing_contact
    FROM grants WHERE status = 'active'
  `);

  const byOrg = await db.execute(sql`
    SELECT organization, COUNT(*) as c
    FROM grants WHERE status = 'active'
    GROUP BY organization ORDER BY c DESC LIMIT 30
  `);

  console.log("=== TOTAL ===", JSON.stringify(total.rows));
  console.log("=== BY STATUS ===", JSON.stringify(byStatus.rows));
  console.log("=== BY ENRICHMENT ===", JSON.stringify(byEnrich.rows));
  console.log("=== ACTIVE MISSING FIELDS ===");
  console.log(JSON.stringify(activeMissing.rows, null, 2));
  console.log("=== TOP ORGS ===");
  console.log(JSON.stringify(byOrg.rows, null, 2));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
