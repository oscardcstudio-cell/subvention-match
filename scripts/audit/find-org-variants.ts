import { db } from "../../server/db";
import { sql } from "drizzle-orm";

// Normalise un nom d'organisme pour identifier les variantes
function normalize(org: string): string {
  return org
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[''’`]/g, "'")
    .replace(/^(conseil |region |region of )/i, "")
    .replace(/^region(al|ale|)\s+/, "")
    .replace(/\bd['']?/, "")
    .replace(/\b(de|du|des|la|le|les|l')\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function main() {
  const rows = await db.execute(sql`SELECT DISTINCT organization FROM grants WHERE status='active' ORDER BY organization`);
  const groups = new Map<string, string[]>();
  for (const r of rows.rows as any[]) {
    const n = normalize(r.organization);
    if (!groups.has(n)) groups.set(n, []);
    groups.get(n)!.push(r.organization);
  }
  console.log("=== DOUBLONS D'ORGANISMES (même normalisation) ===");
  let nbVariants = 0;
  for (const [k, v] of groups) {
    if (v.length > 1) {
      nbVariants += v.length;
      console.log(`\n[${k}]`);
      for (const o of v) console.log(`  - "${o}"`);
    }
  }
  console.log(`\n${nbVariants} noms dans ${[...groups.values()].filter(g=>g.length>1).length} groupes à fusionner`);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
