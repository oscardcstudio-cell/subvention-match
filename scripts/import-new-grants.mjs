/**
 * Phase 2 — Import des nouveaux grants découverts par le scraping (Couche 4)
 * mais absents de la DB.
 *
 * Source : scripts/scrape-results/<org>.json + matches.csv (pour exclure ceux
 * déjà liés à un grant existant).
 *
 * Filtres appliqués :
 *  - skip "Aller au contenu principal"
 *  - skip CNM regional pages (Département de l'Isère, Bourgogne-Franche-Comté, etc.)
 *  - skip CNAP parents génériques (Galeries, Éditeurs — déjà couverts par leurs sous-pages)
 *  - skip CNL "portail numérique" (page utilitaire, pas une aide)
 *  - skip si URL déjà dans la DB (défensif)
 *
 * Pour chaque insert :
 *  - title nettoyé (HTML entities, suffixes "- Le CNM ...")
 *  - organization complète et standardisée
 *  - url + improved_url = URL spécifique scrapée
 *  - eligibility = placeholder (sera rempli par enrichissement)
 *  - status = 'active'
 *  - enrichment_status = 'pending'
 *
 * Usage :
 *   node scripts/import-new-grants.mjs --dry-run
 *   node scripts/import-new-grants.mjs
 */
import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const DRY = process.argv.includes("--dry-run");
const RESULTS_DIR = "scripts/scrape-results";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// === Config par org ===
const ORG_NAMES = {
  ADAMI: "ADAMI - Societe civile pour l'Administration des Droits des Artistes et Musiciens Interpretes",
  CNAP: "CNAP - Centre National des Arts Plastiques",
  CNC: "CNC - Centre National du Cinema et de l'Image Animee",
  CNL: "CNL - Centre National du Livre",
  CNM: "Centre National de la Musique (CNM)",
  SACEM: "SACEM - Societe des Auteurs Compositeurs et Editeurs de Musique",
  SPEDIDAM: "SPEDIDAM - Societe de Perception et de Distribution des Droits des Artistes-Interpretes",
};

const REGIONAL_CNM_RE = /^(Département de|Métropole de|Bourgogne|Pays de la Loire|Occitanie|Sud Provence|Nouvelle-Aquitaine|Ville de Paris|Bretagne|Hauts-de-France|Auvergne-Rhône|La Réunion|Centre-Val de Loire|Normandie|Fonds Outre-mer)/i;
const CNAP_PARENT_TITLES = new Set(["Galeries", "Éditeurs", "Editeurs"]);
const CNL_NOISE_RE = /portail num[eé]rique/i;

function decodeHtml(s) {
  if (!s) return "";
  return s
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;|&apos;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&[#a-zA-Z0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(rawTitle) {
  let t = decodeHtml(rawTitle);
  // Remove suffixes used by orgs in <title>
  t = t.replace(/\s*[\|\-–—]\s*Le CNM.*$/i, "");
  t = t.replace(/\s*[\|\-–—]\s*Centre National.*$/i, "");
  t = t.replace(/\s*[\|\-–—]\s*Sacem.*$/i, "");
  t = t.replace(/\s*[\|\-–—]\s*CNC.*$/i, "");
  t = t.replace(/\s*[\|\-–—]\s*ADAMI.*$/i, "");
  // Strip ADAMI hashtag prefix like "#Musique " or "#Spectacle "
  t = t.replace(/^#[A-Za-zÀ-ÿ]+\s+/i, "");
  // SPEDIDAM "Diffusion du spectacle vivant / Aide ..." — keep just the second part
  t = t.replace(/^[A-Za-zÀ-ÿ' ]+\/\s*/i, "");
  return t.trim();
}

// CNM regional URLs follow predictable slugs at the root of /aides-financieres/
const CNM_REGIONAL_URL_RE = /\/aides-financieres\/(departement-de|metropole-de|bourgogne-franche-comte|pays-de-la-loire|occitanie-pyrenees-mediterranee|sud-provence-alpes-cote-dazur|nouvelle-aquitaine|ville-de-paris|bretagne|hauts-de-france|auvergne-rhone-alpes|la-reunion|centre-val-de-loire|normandie|fonds-outre-mer)/i;

function shouldSkip(org, rawTitle, cleanedTitle, url, existingUrls) {
  if (!cleanedTitle || cleanedTitle.length < 4) return "title too short";
  if (/^aller au contenu/i.test(cleanedTitle)) return "noise: aller au contenu";
  // Use RAW title (pre-cleaning) for regional detection so cleanTitle's "/" stripping doesn't hide it
  if (org === "CNM" && (REGIONAL_CNM_RE.test(rawTitle) || CNM_REGIONAL_URL_RE.test(url))) return "CNM regional sub-page";
  if (org === "CNAP" && CNAP_PARENT_TITLES.has(cleanedTitle.replace(/&[^;]+;/g, "").trim())) return "CNAP parent category";
  if (org === "CNL" && CNL_NOISE_RE.test(cleanedTitle)) return "CNL portal page";
  if (existingUrls.has(url)) return "already in DB";
  const normalized = url.replace(/[#?].*$/, "").replace(/\/$/, "");
  if (existingUrls.has(normalized) || existingUrls.has(normalized + "/")) return "already in DB (normalized)";
  return null;
}

async function main() {
  console.log(`=== Phase 2 — Import new grants ${DRY ? "(DRY RUN)" : ""} ===\n`);

  // Load all scraped
  const allScraped = {};
  for (const f of readdirSync(RESULTS_DIR)) {
    if (!f.endsWith(".json") || f === "all.json") continue;
    const org = f.replace(".json", "").toUpperCase();
    allScraped[org] = JSON.parse(readFileSync(join(RESULTS_DIR, f), "utf8"));
  }

  // Existing URLs in DB (active + archived)
  const { rows: existing } = await pool.query(
    "SELECT url, improved_url FROM grants WHERE url IS NOT NULL OR improved_url IS NOT NULL"
  );
  const existingUrls = new Set();
  for (const r of existing) {
    for (const u of [r.url, r.improved_url]) {
      if (!u) continue;
      existingUrls.add(u);
      // also normalized
      existingUrls.add(u.replace(/[#?].*$/, "").replace(/\/$/, ""));
    }
  }
  console.log(`Loaded ${existing.length} existing grants (${existingUrls.size} unique URLs)\n`);

  // Build candidates
  const candidates = [];
  const skipped = { count: 0, byReason: {} };
  for (const [org, aids] of Object.entries(allScraped)) {
    const orgFull = ORG_NAMES[org];
    if (!orgFull) continue;
    for (const a of aids) {
      const rawTitle = decodeHtml(a.title || "");
      const title = cleanTitle(a.title || "");
      const url = a.url.replace(/#.*$/, "");
      const reason = shouldSkip(org, rawTitle, title, url, existingUrls);
      if (reason) {
        skipped.count++;
        skipped.byReason[reason] = (skipped.byReason[reason] || 0) + 1;
        continue;
      }
      candidates.push({ org, orgFull, title, url });
    }
  }

  // Dedupe by URL (in case scraping picked the same URL twice across families)
  const dedup = new Map();
  for (const c of candidates) {
    if (!dedup.has(c.url)) dedup.set(c.url, c);
  }
  const finalList = [...dedup.values()];

  console.log(`Candidates total : ${candidates.length}`);
  console.log(`After dedupe     : ${finalList.length}`);
  console.log(`Skipped          : ${skipped.count}`);
  for (const [r, n] of Object.entries(skipped.byReason)) console.log(`  - ${r}: ${n}`);
  console.log("");

  // Sample per org
  console.log("=== Échantillon (3 par org) ===");
  const byOrg = {};
  for (const c of finalList) {
    byOrg[c.org] = byOrg[c.org] || [];
    byOrg[c.org].push(c);
  }
  for (const [org, items] of Object.entries(byOrg)) {
    console.log(`\n[${org}] ${items.length} new grants:`);
    for (const it of items.slice(0, 3)) {
      console.log(`  - ${it.title.substring(0, 70).padEnd(72)} | ${it.url.substring(0, 90)}`);
    }
  }

  if (DRY) {
    console.log("\n[DRY] No DB writes.");
    await pool.end();
    return;
  }

  // Insert
  console.log(`\n=== Inserting ${finalList.length} grants ===`);
  let ok = 0, fail = 0;
  for (const c of finalList) {
    try {
      await pool.query(
        `INSERT INTO grants (
          title, organization, url, improved_url, eligibility,
          status, enrichment_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $3, $4, 'active', 'pending', NOW(), NOW())`,
        [c.title, c.orgFull, c.url, "Voir détails sur le site de l'organisme."]
      );
      ok++;
    } catch (e) {
      console.log(`  ✗ ${c.title.substring(0, 60)} — ${e.message}`);
      fail++;
    }
    if ((ok + fail) % 25 === 0) process.stdout.write(`  ${ok + fail}/${finalList.length}\r`);
  }
  console.log(`\n  Inserted: ${ok}`);
  console.log(`  Failed  : ${fail}`);

  await pool.end();
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
