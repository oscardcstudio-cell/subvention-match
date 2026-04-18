import { db } from "../../server/db";
import { sql } from "drizzle-orm";

async function main() {
  // CNC URLs — check diversity
  const cnc = await db.execute(sql`
    SELECT url, improved_url, COUNT(*) as c
    FROM grants WHERE organization LIKE 'CNC%' AND status='active'
    GROUP BY url, improved_url ORDER BY c DESC LIMIT 20
  `);
  console.log("=== CNC URL DIVERSITY ===");
  for (const r of cnc.rows as any[]) {
    console.log(`  ${r.c}x | url=${(r.url||"").substring(0,80)} | improved=${(r.improved_url||"null").substring(0,80)}`);
  }

  // Aides territoires
  const at = await db.execute(sql`
    SELECT url, COUNT(*) as c
    FROM grants WHERE url LIKE '%aides-territoires%' AND status='active'
    GROUP BY url ORDER BY c DESC LIMIT 10
  `);
  console.log("\n=== AIDES-TERRITOIRES TOP URLS ===");
  for (const r of at.rows as any[]) {
    console.log(`  ${r.c}x | ${r.url}`);
  }

  // Duplicate titles detection
  const dup = await db.execute(sql`
    SELECT title, COUNT(*) as c, STRING_AGG(organization, ' | ') as orgs
    FROM grants WHERE status='active'
    GROUP BY title HAVING COUNT(*) > 1
    ORDER BY c DESC LIMIT 15
  `);
  console.log("\n=== TITRES DUPLIQUÉS ===");
  for (const r of dup.rows as any[]) {
    console.log(`  ${r.c}x | "${r.title.substring(0,70)}" | ${r.orgs.substring(0,80)}`);
  }

  // Grants sans sectors
  const noSect = await db.execute(sql`
    SELECT COUNT(*) FILTER (WHERE eligible_sectors IS NULL OR array_length(eligible_sectors,1) IS NULL) as no_sect,
           COUNT(*) FILTER (WHERE grant_type IS NULL OR array_length(grant_type,1) IS NULL) as no_type,
           COUNT(*) FILTER (WHERE geographic_zone IS NULL OR array_length(geographic_zone,1) IS NULL) as no_geo
    FROM grants WHERE status='active'
  `);
  console.log("\n=== FILTRAGE META ===");
  console.log(JSON.stringify(noSect.rows, null, 2));

  // Sample of grants with no description
  const weak = await db.execute(sql`
    SELECT id, title, organization, LENGTH(description) as desc_len, LENGTH(eligibility) as elig_len
    FROM grants WHERE status='active' AND (LENGTH(description) < 100 OR LENGTH(eligibility) < 50)
    LIMIT 10
  `);
  console.log("\n=== GRANTS AVEC DESCRIPTIONS/ÉLIGIBILITÉ FAIBLES ===");
  for (const r of weak.rows as any[]) {
    console.log(`  desc=${r.desc_len} elig=${r.elig_len} | ${r.organization} | ${r.title.substring(0,60)}`);
  }

  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
