/**
 * Audit : cherche dans la DB les grants dont le contenu semble tronqué —
 * finissant par "...", "…", ou s'arrêtant mid-phrase sans ponctuation finale.
 *
 * Usage: tsx scripts/audit/find-truncated.ts
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import { sql, eq } from "drizzle-orm";

const FIELDS = ["title", "description", "eligibility", "requirements"] as const;

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
    })
    .from(grants)
    .where(eq(grants.status, "active"));

  console.log(`Scanning ${all.length} active grants for truncation markers...\n`);

  const hits: Record<string, Array<{ id: string; title: string; org: string; snippet: string; kind: string }>> = {
    ellipsis_triple: [],
    ellipsis_char: [],
    truncated_no_punct: [],
  };

  for (const g of all) {
    for (const f of FIELDS) {
      const raw = (g as any)[f] as string | null;
      if (!raw) continue;
      // Strip HTML tags pour l'analyse
      const text = raw.replace(/<[^>]*>/g, "").trim();
      if (!text) continue;

      const last40 = text.slice(-40);

      // "..." triple-dot
      if (/\.{3}\s*$/.test(text)) {
        hits.ellipsis_triple.push({
          id: g.id, title: g.title, org: g.organization, snippet: last40, kind: f,
        });
        continue;
      }
      // "…" Unicode ellipsis
      if (/…\s*$/.test(text)) {
        hits.ellipsis_char.push({
          id: g.id, title: g.title, org: g.organization, snippet: last40, kind: f,
        });
        continue;
      }
      // Texte long (>100 chars) qui ne finit pas par ponctuation → probablement tronqué
      // On skip les bullets/listes (finissant par ":") et les URLs.
      if (text.length > 100) {
        const lastChar = text[text.length - 1];
        const endsWithPunct = /[.!?:)\]»"']/.test(lastChar);
        if (!endsWithPunct) {
          hits.truncated_no_punct.push({
            id: g.id, title: g.title, org: g.organization, snippet: last40, kind: f,
          });
        }
      }
    }
  }

  const report = (label: string, arr: Array<{ id: string; title: string; org: string; snippet: string; kind: string }>) => {
    console.log(`\n=== ${label}: ${arr.length} hits ===`);
    if (arr.length === 0) return;
    // Groupe par organisme pour voir si c'est systémique
    const byOrg: Record<string, number> = {};
    for (const h of arr) byOrg[h.org] = (byOrg[h.org] || 0) + 1;
    console.log("Top organismes:");
    Object.entries(byOrg)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([org, n]) => console.log(`  ${n.toString().padStart(3)} × ${org}`));

    console.log("\nExemples (10 premiers):");
    arr.slice(0, 10).forEach((h) => {
      console.log(`  [${h.kind}] ${h.title.slice(0, 60)}`);
      console.log(`    org: ${h.org}`);
      console.log(`    fin: "...${h.snippet}"`);
      console.log(`    id: ${h.id}`);
    });
  };

  report("Finissent par '...'", hits.ellipsis_triple);
  report("Finissent par '…'", hits.ellipsis_char);
  report("Tronqués sans ponctuation (>100 chars)", hits.truncated_no_punct);

  const total = hits.ellipsis_triple.length + hits.ellipsis_char.length + hits.truncated_no_punct.length;
  console.log(`\n\nTOTAL: ${total} champs potentiellement tronqués sur ${all.length} grants actives.`);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
