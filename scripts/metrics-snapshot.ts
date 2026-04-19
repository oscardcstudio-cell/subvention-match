import * as fs from "fs";
import * as path from "path";
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
  }
}

async function main() {
  const { db } = await import("../server/db");
  const { formSubmissions, matchFeedback, betaFeedback, betaWaitlist, grants } = await import("../shared/schema");
  const { sql, desc } = await import("drizzle-orm");

  console.log("=== SUBMISSIONS ===");
  const subsTotal = await db.select({ c: sql<number>`count(*)::int` }).from(formSubmissions);
  const subsPaid = await db.select({ c: sql<number>`count(*)::int` }).from(formSubmissions).where(sql`is_paid = 'true'`);
  const subsByDay = await db.execute(sql`
    SELECT date_trunc('day', created_at)::date AS d, count(*)::int AS c
    FROM form_submissions
    GROUP BY 1 ORDER BY 1 DESC LIMIT 30
  `);
  const uniqEmails = await db.execute(sql`SELECT count(DISTINCT email)::int AS c FROM form_submissions`);
  const repeatEmails = await db.execute(sql`
    SELECT email, count(*)::int AS c
    FROM form_submissions
    GROUP BY email HAVING count(*) > 1
    ORDER BY c DESC LIMIT 20
  `);
  const completionStats = await db.execute(sql`
    SELECT
      count(*)::int AS total,
      count(project_description) FILTER (WHERE length(project_description) > 50)::int AS with_desc,
      count(results)::int AS with_results,
      count(pdf_path)::int AS with_pdf
    FROM form_submissions
  `);

  console.log("total:", subsTotal[0]?.c, "paid:", subsPaid[0]?.c, "unique_emails:", (uniqEmails.rows?.[0] as any)?.c);
  console.log("completion:", completionStats.rows?.[0]);
  console.log("last 30d by day:");
  for (const r of subsByDay.rows || []) console.log(" ", (r as any).d, (r as any).c);
  console.log("repeat users:");
  for (const r of repeatEmails.rows || []) console.log(" ", (r as any).email, (r as any).c);

  console.log("\n=== MATCH FEEDBACK ===");
  const mf = await db.execute(sql`
    SELECT rating, count(*)::int AS c FROM match_feedback GROUP BY rating
  `);
  for (const r of mf.rows || []) console.log(" ", (r as any).rating, (r as any).c);
  const mfComments = await db.execute(sql`
    SELECT rating, comment, created_at FROM match_feedback
    WHERE comment IS NOT NULL AND length(comment) > 0
    ORDER BY created_at DESC LIMIT 30
  `);
  console.log("comments (last 30):");
  for (const r of mfComments.rows || []) console.log(" ", (r as any).rating, "|", (r as any).comment);

  console.log("\n=== BETA FEEDBACK ===");
  const bf = await db.select().from(betaFeedback).orderBy(desc(betaFeedback.createdAt)).limit(50);
  console.log("count:", bf.length);
  for (const r of bf) console.log(" ", r.createdAt?.toISOString?.().slice(0, 10), "[" + r.type + "]", r.page || "-", "|", r.message?.slice(0, 200));

  console.log("\n=== WAITLIST ===");
  const wlTotal = await db.select({ c: sql<number>`count(*)::int` }).from(betaWaitlist);
  const wlBySrc = await db.execute(sql`SELECT source, count(*)::int AS c FROM beta_waitlist GROUP BY source ORDER BY c DESC`);
  console.log("total:", wlTotal[0]?.c);
  for (const r of wlBySrc.rows || []) console.log(" ", (r as any).source, (r as any).c);

  console.log("\n=== GRANTS ===");
  const gTotal = await db.select({ c: sql<number>`count(*)::int` }).from(grants);
  const gActive = await db.execute(sql`SELECT count(*)::int AS c FROM grants WHERE status='active'`);
  console.log("total:", gTotal[0]?.c, "active:", (gActive.rows?.[0] as any)?.c);

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
