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
  const { sql } = await import("drizzle-orm");
  const r = await db.execute(sql`DELETE FROM beta_waitlist WHERE email LIKE '%subventionmatch.test' OR email LIKE '%autonomous%' RETURNING email`);
  console.log("Deleted entries:", (r.rows || []).map((x: any) => x.email));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
