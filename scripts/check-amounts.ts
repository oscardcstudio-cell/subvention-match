import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql } from "drizzle-orm";

const [s] = await db.select({
  total: sql<number>`count(*)::int`,
  withAmount: sql<number>`count(*) filter (where amount is not null)::int`,
  withMin: sql<number>`count(*) filter (where amount_min is not null)::int`,
  withMax: sql<number>`count(*) filter (where amount_max is not null)::int`,
  withAny: sql<number>`count(*) filter (where amount is not null or amount_min is not null or amount_max is not null)::int`,
}).from(grants).where(sql`status = 'active'`);

console.log(`Montants: ${s.withAny}/${s.total} ont un montant (${((s.withAny/s.total)*100).toFixed(0)}%)`);
console.log(`  amount: ${s.withAmount}, amountMin: ${s.withMin}, amountMax: ${s.withMax}`);
console.log(`  SANS montant: ${s.total - s.withAny} (${((1 - s.withAny/s.total)*100).toFixed(0)}%)`);
process.exit(0);
