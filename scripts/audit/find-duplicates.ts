/**
 * Détecte et propose des fusions de doublons sur (title normalisé, organization normalisée).
 *
 * Stratégie : on garde la grant la plus "riche" (score qualité le plus haut),
 * on archive les autres. On logue pour review avant d'appliquer.
 *
 * Usage: npx tsx scripts/audit/find-duplicates.ts [--apply]
 */
import { db } from "../../server/db";
import { grants } from "../../shared/schema";
import { sql, eq, inArray } from "drizzle-orm";
import { calculateQualityScore } from "../../server/quality-gate";

function normTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normOrg(o: string): string {
  return o
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const rows = await db.select().from(grants).where(eq(grants.status, "active"));

  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = `${normTitle(r.title)}||${normOrg(r.organization)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const dupes = [...groups.entries()].filter(([_, arr]) => arr.length > 1);
  console.log(`=== ${dupes.length} groupes de doublons (${dupes.reduce((s, [_, a]) => s + a.length, 0)} lignes) ===\n`);

  let toArchive: string[] = [];

  for (const [key, arr] of dupes) {
    // Classer par score qualité décroissant, puis par date de création (plus récent gagne)
    arr.sort((a, b) => {
      const sa = calculateQualityScore(a as any).score;
      const sb = calculateQualityScore(b as any).score;
      if (sa !== sb) return sb - sa;
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
    const winner = arr[0];
    const losers = arr.slice(1);

    console.log(`[${arr[0].title.substring(0, 60)}...]`);
    console.log(`  ✅ GARDE ${winner.id.substring(0, 8)} (score ${calculateQualityScore(winner as any).score})`);
    for (const l of losers) {
      console.log(`  🗑️  ARCHIVE ${l.id.substring(0, 8)} (score ${calculateQualityScore(l as any).score})`);
      toArchive.push(l.id);
    }
    console.log();
  }

  console.log(`\n${toArchive.length} grants à archiver.`);

  if (!apply) {
    console.log("(dry-run — utilise --apply pour exécuter)");
    process.exit(0);
  }

  if (toArchive.length > 0) {
    await db
      .update(grants)
      .set({ status: "archived", updatedAt: new Date() })
      .where(inArray(grants.id, toArchive));
    console.log(`✅ ${toArchive.length} grants archivées.`);
  }
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
