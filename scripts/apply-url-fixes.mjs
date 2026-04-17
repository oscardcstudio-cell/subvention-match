/**
 * Phase 1 — Applique les corrections d'URLs validées par l'utilisateur sur les
 * grants des 7 gros organismes. Aucun matching auto : les mappings sont en dur,
 * issus du rapport scripts/scrape-results/matches.csv après validation manuelle.
 *
 * Usage:
 *   node scripts/apply-url-fixes.mjs --dry-run   # preview
 *   node scripts/apply-url-fixes.mjs             # applique
 */
import pg from "pg";

const DRY = process.argv.includes("--dry-run");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Updates : { matchTitle: { url, reason } }
// matchTitle est utilisé pour identifier le grant en DB (ILIKE)
const UPDATES = [
  // === Bloc A ===
  {
    where: "title ILIKE '%Aide a l''ecriture de scenario%' AND organization ILIKE '%CNC%'",
    url: "https://www.cnc.fr/professionnels/aides-et-financements/cinema/scenario/soutien-au-scenario-aide-a-lecriture_191516",
    reason: "A1 - CNC scenario écriture (match exact 1.00)",
  },
  {
    where: "title ILIKE '%Avance sur recettes avant realisation%' AND organization ILIKE '%CNC%'",
    url: "https://www.cnc.fr/professionnels/aides-et-financements/cinema/production/avance-sur-recettes-avant-realisation_191260",
    reason: "A2 - CNC avance sur recettes (match exact 1.00)",
  },
  {
    where: "title ILIKE '%Bourse de residence d''ecriture%' AND organization ILIKE '%CNL%'",
    url: "https://centrenationaldulivre.fr/aides-financement/bourse-de-residence",
    reason: "A3 - CNL bourse résidence",
  },
  // === Bloc B (manual) ===
  {
    where: "title ILIKE '%Bourse de creation litteraire%' AND organization ILIKE '%CNL%'",
    url: "https://centrenationaldulivre.fr/aides-financement/bourse-aux-auteurs-autrices",
    reason: "B4 - CNL bourse création littéraire = bourse aux auteurs/autrices",
  },
  {
    where: "title ILIKE '%Aide a la creation musicale%' AND organization ILIKE '%CNM%'",
    url: "https://cnm.fr/aides-financieres/ecriture-et-composition-d-oeuvres-musicales/",
    reason: "B5 - CNM création musicale = écriture/composition d'œuvres musicales (was ma-source.info BROKEN)",
  },
  {
    where: "title ILIKE '%Aide au developpement d''artiste%' AND organization ILIKE '%CNM%'",
    url: "https://cnm.fr/aides-financieres/aide-au-parcours-des-auteurs-autrices-et-compositeurs-compositrices/",
    reason: "B7 - CNM dév artiste = aide au parcours auteurs/compositeurs",
  },
  {
    where: "title ILIKE '%Aide individuelle a la creation%' AND organization ILIKE '%CNAP%'",
    url: "https://www.cnap.fr/soutien-creation/projets-artistes/modalites-de-candidature",
    reason: "B8 - CNAP aide individuelle = projets-artistes",
  },
  {
    where: "title ILIKE '%Aide au premier catalogue%' AND organization ILIKE '%CNAP%'",
    url: "https://www.cnap.fr/soutien-creation/galeries/publications/modalites-de-candidature",
    reason: "B9 - CNAP premier catalogue = soutien à la publication (galeries)",
  },
  {
    where: "title ILIKE '%Bourse de creation SACEM%'",
    url: "https://aide-aux-projets.sacem.fr/nos-programmes-aide",
    reason: "B10 - SACEM listing programmes (pas de bourse unique)",
  },
  {
    where: "title ILIKE '%Aide aux projets%' AND organization ILIKE '%SPEDIDAM%'",
    url: "https://www.spedidam.fr/aides-aux-projets/nos-programmes/",
    reason: "B11 - SPEDIDAM listing nos-programmes (7 aides spécifiques)",
  },
];

// Suppressions : grants qui ne correspondent à aucune aide réelle
const DELETIONS = [
  {
    where: "title ILIKE '%Aide a la diffusion de spectacle vivant musical%' AND organization ILIKE '%CNM%'",
    reason: "B6 - CNM n'a aucune 'aide à la diffusion spectacle vivant' (seulement crédit d'impôt + droit de tirage). Grant fictif/obsolète.",
  },
];

async function main() {
  console.log(`=== Phase 1 — Apply URL fixes ${DRY ? "(DRY RUN)" : ""} ===\n`);

  // 1) Updates
  let updated = 0;
  for (const u of UPDATES) {
    const sel = await pool.query(`SELECT id, title, organization, url, improved_url FROM grants WHERE ${u.where} AND status='active'`);
    if (sel.rows.length === 0) {
      console.log(`  ⚠ NOT FOUND: ${u.reason}`);
      continue;
    }
    if (sel.rows.length > 1) {
      console.log(`  ⚠ MULTIPLE (${sel.rows.length}): ${u.reason}`);
      for (const r of sel.rows) console.log(`     - ${r.title} (${r.organization})`);
      continue;
    }
    const g = sel.rows[0];
    const before = g.improved_url || g.url || "(null)";
    console.log(`  ✓ ${u.reason}`);
    console.log(`    Grant: ${g.title}`);
    console.log(`    Before: ${before}`);
    console.log(`    After : ${u.url}`);
    if (!DRY) {
      await pool.query("UPDATE grants SET improved_url = $1, updated_at = NOW() WHERE id = $2", [u.url, g.id]);
    }
    updated++;
  }

  // 2) Deletions (soft = status='archived')
  let deleted = 0;
  for (const d of DELETIONS) {
    const sel = await pool.query(`SELECT id, title FROM grants WHERE ${d.where} AND status='active'`);
    if (sel.rows.length === 0) {
      console.log(`\n  ⚠ NOT FOUND: ${d.reason}`);
      continue;
    }
    for (const g of sel.rows) {
      console.log(`\n  🗑 ARCHIVE: ${g.title}`);
      console.log(`     Reason: ${d.reason}`);
      if (!DRY) {
        await pool.query("UPDATE grants SET status='archived', updated_at = NOW() WHERE id = $1", [g.id]);
      }
      deleted++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`  ${DRY ? "[DRY] " : ""}Updates: ${updated}/${UPDATES.length}`);
  console.log(`  ${DRY ? "[DRY] " : ""}Archives: ${deleted}/${DELETIONS.length}`);
  console.log("=".repeat(60));

  await pool.end();
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
