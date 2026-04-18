/**
 * Rapport final — état de la DB après le grand nettoyage + enrichissement.
 */
import { db } from "../../server/db";
import { sql, eq } from "drizzle-orm";
import { scoreUrl } from "../../server/url-validator";
import { calculateQualityScore } from "../../server/quality-gate";
import { grants } from "../../shared/schema";

async function main() {
  const total = await db.execute(sql`SELECT COUNT(*)::int as c FROM grants`);
  const active = await db.execute(sql`SELECT COUNT(*)::int as c FROM grants WHERE status='active'`);
  const archived = await db.execute(sql`SELECT COUNT(*)::int as c FROM grants WHERE status='archived'`);

  const enrich = await db.execute(sql`SELECT enrichment_status, COUNT(*)::int as c FROM grants WHERE status='active' GROUP BY 1`);

  const fill = await db.execute(sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE description IS NOT NULL AND LENGTH(description) >= 100)::int as desc_ok,
      COUNT(*) FILTER (WHERE eligibility IS NOT NULL AND LENGTH(eligibility) >= 50)::int as elig_ok,
      COUNT(*) FILTER (WHERE requirements IS NOT NULL AND LENGTH(requirements) >= 20)::int as req_ok,
      COUNT(*) FILTER (WHERE url IS NOT NULL)::int as url_ok,
      COUNT(*) FILTER (WHERE improved_url IS NOT NULL)::int as improved_url_ok,
      COUNT(*) FILTER (WHERE amount IS NOT NULL OR amount_min IS NOT NULL OR amount_max IS NOT NULL)::int as amount_ok,
      COUNT(*) FILTER (WHERE deadline IS NOT NULL OR frequency IS NOT NULL)::int as deadline_ok,
      COUNT(*) FILTER (WHERE eligible_sectors IS NOT NULL AND array_length(eligible_sectors,1) > 0)::int as sectors_ok,
      COUNT(*) FILTER (WHERE geographic_zone IS NOT NULL AND array_length(geographic_zone,1) > 0)::int as zone_ok,
      COUNT(*) FILTER (WHERE grant_type IS NOT NULL AND array_length(grant_type,1) > 0)::int as type_ok,
      COUNT(*) FILTER (WHERE application_difficulty IS NOT NULL)::int as difficulty_ok,
      COUNT(*) FILTER (WHERE preparation_advice IS NOT NULL AND LENGTH(preparation_advice) >= 50)::int as advice_ok,
      COUNT(*) FILTER (WHERE obligatory_documents IS NOT NULL AND array_length(obligatory_documents,1) > 0)::int as docs_ok,
      COUNT(*) FILTER (WHERE contact_email IS NOT NULL OR contact_phone IS NOT NULL)::int as contact_ok
    FROM grants WHERE status='active'
  `);

  const rows = await db.select().from(grants).where(eq(grants.status, "active"));
  const qualityBuckets = { "<40": 0, "40-59": 0, "60-79": 0, "80-99": 0, "100": 0 };
  let goodUrl = 0;
  for (const g of rows) {
    const s = calculateQualityScore(g as any).score;
    if (s < 40) qualityBuckets["<40"]++;
    else if (s < 60) qualityBuckets["40-59"]++;
    else if (s < 80) qualityBuckets["60-79"]++;
    else if (s < 100) qualityBuckets["80-99"]++;
    else qualityBuckets["100"]++;
    const u = g.improvedUrl || g.url;
    if (u && scoreUrl(u) >= 60) goodUrl++;
  }

  const f = fill.rows[0] as any;
  const t = f.total;
  const pct = (n: any) => `${((Number(n) / t) * 100).toFixed(0)}%`;

  console.log("=".repeat(70));
  console.log("RAPPORT FINAL — SubventionMatch");
  console.log("=".repeat(70));
  console.log();
  console.log(`📦 Total: ${total.rows[0].c} (actives: ${active.rows[0].c}, archivées: ${archived.rows[0].c})`);
  console.log(`🔧 Enrichissement:`);
  for (const r of enrich.rows as any[]) console.log(`    ${r.enrichment_status.padEnd(12)}: ${r.c}`);
  console.log();
  console.log(`📊 Remplissage champs (actives) :`);
  console.log(`    description      : ${f.desc_ok}/${t}   (${pct(f.desc_ok)})`);
  console.log(`    eligibility      : ${f.elig_ok}/${t}   (${pct(f.elig_ok)})`);
  console.log(`    requirements     : ${f.req_ok}/${t}   (${pct(f.req_ok)})`);
  console.log(`    url              : ${f.url_ok}/${t}   (${pct(f.url_ok)})`);
  console.log(`    improved_url     : ${f.improved_url_ok}/${t}   (${pct(f.improved_url_ok)})`);
  console.log(`    URL score>=60    : ${goodUrl}/${t}   (${Math.round(goodUrl/t*100)}%)`);
  console.log(`    amount           : ${f.amount_ok}/${t}   (${pct(f.amount_ok)})`);
  console.log(`    deadline/freq    : ${f.deadline_ok}/${t}   (${pct(f.deadline_ok)})`);
  console.log(`    eligible_sectors : ${f.sectors_ok}/${t}   (${pct(f.sectors_ok)})`);
  console.log(`    geographic_zone  : ${f.zone_ok}/${t}   (${pct(f.zone_ok)})`);
  console.log(`    grant_type       : ${f.type_ok}/${t}   (${pct(f.type_ok)})`);
  console.log(`    difficulty       : ${f.difficulty_ok}/${t}   (${pct(f.difficulty_ok)})`);
  console.log(`    advice           : ${f.advice_ok}/${t}   (${pct(f.advice_ok)})`);
  console.log(`    obligatory_docs  : ${f.docs_ok}/${t}   (${pct(f.docs_ok)})`);
  console.log(`    contact          : ${f.contact_ok}/${t}   (${pct(f.contact_ok)})`);
  console.log();
  console.log(`📏 Distribution qualityScore :`);
  for (const [bucket, n] of Object.entries(qualityBuckets)) {
    console.log(`    ${bucket.padStart(6)}: ${n.toString().padStart(4)}  (${Math.round(n/t*100)}%)`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
