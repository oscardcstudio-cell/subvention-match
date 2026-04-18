import { db } from "../../server/db";
import { sql } from "drizzle-orm";
const r = await db.execute(sql`SELECT url, COUNT(*) FROM grants WHERE status='active' AND url LIKE '%aides-territoires%' AND url NOT LIKE '%/aides/%' GROUP BY url`);
console.log(r.rows);
process.exit(0);
