import { db } from "../../server/db";
import { grants } from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

const JUNK = new Set([
  "Réflexion / conception",
  "Mise en œuvre / réalisation",
  "Usage / valorisation",
  "réflexion / conception",
  "mise en œuvre / réalisation",
  "usage / valorisation",
]);

const rows = await db.select().from(grants).where(eq(grants.status, "active"));
let cleaned = 0, nulled = 0;
for (const g of rows) {
  const docs = g.obligatoryDocuments;
  if (!docs) continue;
  const filtered = docs.filter((d) => !JUNK.has(d));
  if (filtered.length !== docs.length) {
    if (filtered.length === 0) {
      await db.update(grants).set({ obligatoryDocuments: null, updatedAt: new Date() }).where(eq(grants.id, g.id));
      nulled++;
    } else {
      await db.update(grants).set({ obligatoryDocuments: filtered, updatedAt: new Date() }).where(eq(grants.id, g.id));
      cleaned++;
    }
  }
}
console.log(`${cleaned} nettoyées, ${nulled} mises à null`);
process.exit(0);
