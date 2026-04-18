import { db } from "../../server/db";
import { grants } from "../../shared/schema";
import { eq, sql } from "drizzle-orm";
const r = await db.execute(sql`SELECT id, title, url FROM grants WHERE status='active' AND url = 'https://www.fnagp.fr/'`);
for (const x of r.rows as any[]) {
  await db.update(grants).set({ 
    url: 'https://fnagp.fr/prix-et-bourses/',
    improvedUrl: 'https://fnagp.fr/prix-et-bourses/',
    updatedAt: new Date()
  }).where(eq(grants.id, x.id));
  console.log("patched", x.title);
}
process.exit(0);
