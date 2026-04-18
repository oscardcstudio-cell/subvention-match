/**
 * Normalise les noms d'organismes en DB pour fusionner les variantes d'écriture.
 * Règle générale : canonicalise vers la forme la plus complète/récente.
 *
 * Usage: npx tsx scripts/audit/normalize-orgs.ts [--dry-run]
 */
import { db } from "../../server/db";
import { grants } from "../../shared/schema";
import { eq, sql } from "drizzle-orm";

// Map canonique — construit depuis les variantes détectées par find-org-variants.ts
const CANONICAL: Record<string, string> = {
  // Régions (forme officielle : "Région X" avec accents/trait d'union)
  "conseil regional d'ile de france": "Région Île-de-France",
  "conseil regional d'île-de-france": "Région Île-de-France",
  "conseil regional île-de-france": "Région Île-de-France",
  "conseil régional d'ile de france": "Région Île-de-France",
  "conseil régional d'île-de-france": "Région Île-de-France",
  "conseil régional île-de-france": "Région Île-de-France",
  "region ile-de-france": "Région Île-de-France",
  "région ile-de-france": "Région Île-de-France",
  "région île-de-france": "Région Île-de-France",

  "conseil régional d'occitanie": "Région Occitanie",
  "conseil régional occitanie": "Région Occitanie",
  "conseil régional occitanie / pyrénées-méditerranée": "Région Occitanie",

  "conseil régional du grand est": "Région Grand Est",
  "conseil régional grand est": "Région Grand Est",

  "conseil régional auvergne-rhône-alpes": "Région Auvergne-Rhône-Alpes",
  "région auvergne-rhône-alpes": "Région Auvergne-Rhône-Alpes",

  "conseil régional de nouvelle-aquitaine": "Région Nouvelle-Aquitaine",
  "conseil régional nouvelle-aquitaine": "Région Nouvelle-Aquitaine",

  "conseil régional de provence-alpes-côte d'azur": "Région Provence-Alpes-Côte d'Azur",
  "conseil régional provence-alpes-côte d'azur": "Région Provence-Alpes-Côte d'Azur",

  // Autres
  "ademe (agence de la transition écologique)": "ADEME (Agence de la transition écologique)",
  "agence départementale aveyron ingénierie": "Agence Départementale Aveyron Ingénierie",
  "agence de l'eau": "Agence de l'Eau",
  "la banque des territoires": "Banque des Territoires",
  "drac - direction regionale des affaires culturelles": "DRAC (Direction Régionale des Affaires Culturelles)",

  // Variantes foirées (ex: AI a répondu avec markdown)
  "l'organisme qui finance cette subvention est :  \n**union régionale des caue (urcaue)**":
    "Union régionale des CAUE (URCAUE)",
};

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const rows = await db.execute(sql`SELECT DISTINCT organization FROM grants WHERE status='active'`);

  const updates: { from: string; to: string }[] = [];
  for (const r of rows.rows as any[]) {
    const key = r.organization.toLowerCase().trim();
    if (CANONICAL[key] && CANONICAL[key] !== r.organization) {
      updates.push({ from: r.organization, to: CANONICAL[key] });
    }
  }

  console.log(`=== ${updates.length} organismes à renommer ===`);
  for (const u of updates) console.log(`  "${u.from}" → "${u.to}"`);

  if (dryRun) {
    console.log("\n(dry-run — aucune modification appliquée)");
    process.exit(0);
  }

  let total = 0;
  for (const u of updates) {
    const res = await db
      .update(grants)
      .set({ organization: u.to, updatedAt: new Date() })
      .where(eq(grants.organization, u.from));
    const count = (res as any).rowCount ?? 0;
    total += count;
    console.log(`  ${count.toString().padStart(4)} rows → "${u.to}"`);
  }
  console.log(`\n✅ ${total} grants mises à jour.`);
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
