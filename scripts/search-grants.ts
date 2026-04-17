import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, or, ilike, and, eq } from "drizzle-orm";

const keywords = process.argv.slice(2);
if (keywords.length === 0) {
  console.error("Usage: tsx scripts/search-grants.ts <kw1> [kw2] ...");
  process.exit(1);
}

const conds = keywords.flatMap((kw) => [
  ilike(grants.title, `%${kw}%`),
  ilike(grants.description, `%${kw}%`),
  ilike(grants.organization, `%${kw}%`),
]);

const rows = await db
  .select({
    id: grants.id,
    title: grants.title,
    organization: grants.organization,
    status: grants.status,
    description: sql<string>`substring(${grants.description}, 1, 200)`,
    grantType: grants.grantType,
  })
  .from(grants)
  .where(and(eq(grants.status, "active"), or(...conds)));

console.log(`${rows.length} grants active trouvées pour [${keywords.join(", ")}] :\n`);
for (const r of rows) {
  console.log(`${r.id}`);
  console.log(`  ${r.title}`);
  console.log(`  ${r.organization}`);
  console.log(`  types: ${JSON.stringify(r.grantType)}`);
  console.log(`  ${r.description?.replace(/<[^>]*>/g, "").substring(0, 180)}`);
  console.log();
}
process.exit(0);
