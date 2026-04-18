/**
 * Récupère les slugs manquants des grants qui pointent vers la homepage
 * Aides-Territoires, en recherchant par titre via l'API AT.
 *
 * Usage: npx tsx scripts/fix-aides-territoires-urls.ts [--apply]
 */
import { db } from "../server/db";
import { grants } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function searchAT(title: string): Promise<string | null> {
  const params = new URLSearchParams({ text: title.substring(0, 80) });
  const url = `https://aides-territoires.beta.gouv.fr/api/aids/?${params}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data: any = await res.json();
    const results: any[] = data.results || [];
    if (results.length === 0) return null;

    // Pick the best title match
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const target = norm(title);
    results.sort((a, b) => {
      const na = norm(a.name || "");
      const nb = norm(b.name || "");
      const overlapA = target.split(" ").filter((w) => w.length > 3 && na.includes(w)).length;
      const overlapB = target.split(" ").filter((w) => w.length > 3 && nb.includes(w)).length;
      return overlapB - overlapA;
    });
    const best = results[0];
    if (!best?.slug) return null;
    return `https://aides-territoires.beta.gouv.fr/aides/${best.slug}/`;
  } catch {
    return null;
  }
}

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await db.execute(sql`
    SELECT id, title, organization, url
    FROM grants
    WHERE status='active' AND url = 'https://aides-territoires.beta.gouv.fr/'
  `);

  console.log(`${rows.rows.length} grants à corriger (URL = homepage AT)`);
  let fixed = 0;

  for (const r of rows.rows as any[]) {
    const slug = await searchAT(r.title);
    console.log(`\n${r.title.substring(0, 60)}`);
    console.log(`  → ${slug ?? "(pas trouvé)"}`);
    if (slug && apply) {
      await db.update(grants).set({ url: slug, improvedUrl: slug, updatedAt: new Date() }).where(eq(grants.id, r.id));
      fixed++;
    }
    await new Promise((res) => setTimeout(res, 500));
  }

  console.log(`\n${apply ? `✅ ${fixed} corrigées.` : "(dry-run — --apply pour exécuter)"}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
