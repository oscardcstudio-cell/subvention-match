/**
 * Combien de grants couvrent le jeu vidéo ?
 * On cherche les mentions explicites dans title/description/eligibility/tags.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import { sql, eq } from "drizzle-orm";

const PATTERNS = [
  "jeu vidéo",
  "jeux vidéo",
  "jeu video",
  "jeux video",
  "video game",
  "videogame",
  "gaming",
  "game design",
  "CNC.*jeu",
  "FAJV",  // Fonds d'Aide au Jeu Vidéo (CNC)
  "esport",
  "e-sport",
];

async function main() {
  const all = await db
    .select({
      id: grants.id,
      title: grants.title,
      organization: grants.organization,
      status: grants.status,
      description: grants.description,
      eligibility: grants.eligibility,
      requirements: grants.requirements,
      grantType: grants.grantType,
      eligibleSectors: grants.eligibleSectors,
    })
    .from(grants)
    .where(eq(grants.status, "active"));

  console.log(`Scan de ${all.length} grants actives pour le jeu vidéo…\n`);

  const matchesById = new Map<string, { grant: any; hits: string[] }>();

  for (const g of all) {
    const haystack = [
      g.title,
      g.description,
      g.eligibility,
      g.requirements,
      Array.isArray(g.grantType) ? g.grantType.join(" ") : "",
      Array.isArray(g.eligibleSectors) ? g.eligibleSectors.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" \n ")
      .toLowerCase();

    const hits: string[] = [];
    for (const p of PATTERNS) {
      const re = new RegExp(p.toLowerCase(), "i");
      if (re.test(haystack)) hits.push(p);
    }

    if (hits.length > 0) {
      matchesById.set(g.id, { grant: g, hits });
    }
  }

  console.log(`\n=== ${matchesById.size} grants mentionnent le jeu vidéo ===\n`);

  // Breakdown par organisme
  const byOrg: Record<string, number> = {};
  for (const { grant } of matchesById.values()) {
    byOrg[grant.organization] = (byOrg[grant.organization] || 0) + 1;
  }
  console.log("Par organisme :");
  Object.entries(byOrg)
    .sort(([, a], [, b]) => b - a)
    .forEach(([org, n]) => console.log(`  ${n.toString().padStart(3)} × ${org}`));

  console.log("\n\n=== Liste complète ===\n");
  const list = Array.from(matchesById.values());
  list.forEach(({ grant, hits }, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. ${grant.title}`);
    console.log(`    org: ${grant.organization}`);
    console.log(`    matches: ${hits.join(", ")}`);
    const sectors = Array.isArray(grant.eligibleSectors) ? grant.eligibleSectors.join(" · ") : "—";
    console.log(`    secteurs: ${sectors}`);
  });

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
