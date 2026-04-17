/**
 * Rapproche les aides scrapées (scripts/scrape-results/) avec les grants en DB
 * pour les 7 gros organismes.
 *
 * - Pour chaque grant DB, calcule le meilleur match scraped (Jaccard sur tokens normalisés)
 * - Affiche 5 exemples + un résumé global
 * - Écrit scripts/scrape-results/matches.csv (matches > seuil)
 * - Écrit scripts/scrape-results/unmatched-scraped.csv (aides scrapées non rapprochées
 *   = potentiellement nouvelles subventions absentes de la DB)
 *
 * Pas de mise à jour DB ici. Validation visuelle d'abord.
 *
 * Usage:
 *   node scripts/match-scraped-urls.mjs [--threshold=0.35]
 */
import pg from "pg";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const thrIdx = args.findIndex((a) => a.startsWith("--threshold="));
const THRESHOLD = thrIdx >= 0 ? parseFloat(args[thrIdx].split("=")[1]) : 0.35;

const RESULTS_DIR = "scripts/scrape-results";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// =========================
// Normalisation / tokens
// =========================
const STOP = new Set([
  "de","la","le","les","des","du","et","en","au","aux","a","l","d","s","un","une","pour","par",
  "sur","dans","ou","ce","cette","ces","sont","est","aide","aides","subvention","subventions",
  "soutien","soutiens","fonds","programme","programmes","cnc","cnm","cnap","cnl","sacem","adami",
  "spedidam","drac","ministere","culture","national","france","francais","francaise"
]);

function decodeHtml(s) {
  if (!s) return "";
  return s
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&[#a-zA-Z0-9]+;/g, " ");
}

function normalize(s) {
  if (!s) return "";
  return decodeHtml(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")          // strip accents
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s) {
  return normalize(s).split(" ").filter((t) => t.length >= 3 && !STOP.has(t));
}

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

// =========================
// Org assignment
// =========================
function orgOf(grant) {
  const o = (grant.organization || "") + " " + (grant.url || "") + " " + (grant.improved_url || "");
  const u = o.toLowerCase();
  if (u.includes("cnc.fr") || /\bcnc\b/i.test(grant.organization)) return "CNC";
  if (u.includes("cnm.fr") || /\bcnm\b/i.test(grant.organization)) return "CNM";
  if (u.includes("cnap.fr") || /\bcnap\b/i.test(grant.organization)) return "CNAP";
  if (u.includes("centrenationaldulivre") || /\bcnl\b/i.test(grant.organization)) return "CNL";
  if (u.includes("sacem.fr") || /\bsacem\b/i.test(grant.organization)) return "SACEM";
  if (u.includes("adami.fr") || /\badami\b/i.test(grant.organization)) return "ADAMI";
  if (u.includes("spedidam.fr") || /\bspedidam\b/i.test(grant.organization)) return "SPEDIDAM";
  return null;
}

// =========================
async function main() {
  // Load scraped aids
  const allScraped = {};
  const scrapedFiles = readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json") && f !== "all.json");
  for (const f of scrapedFiles) {
    const key = f.replace(".json", "").toUpperCase();
    const arr = JSON.parse(readFileSync(join(RESULTS_DIR, f), "utf8"));
    // dedupe + clean noise: skip anchors, very short titles
    const seen = new Set();
    const cleaned = [];
    for (const a of arr) {
      if (!a.url) continue;
      const url = a.url.split("#")[0]; // strip anchors
      if (seen.has(url)) continue;
      seen.add(url);
      const title = decodeHtml(a.title || "");
      if (!title || title.length < 4) continue;
      if (/^aller au contenu/i.test(title)) continue;
      cleaned.push({ url, title, _toks: tokens(title) });
    }
    allScraped[key] = cleaned;
  }
  for (const [k, v] of Object.entries(allScraped)) console.log(`Loaded ${v.length} aids for ${k}`);

  // Load DB grants for these orgs
  const { rows: grants } = await pool.query(`
    SELECT id, title, organization, url, improved_url
    FROM grants
    WHERE status='active'
    AND (
      organization ILIKE ANY (ARRAY['%CNC%', '%CNM%', '%CNAP%', '%CNL%', '%SACEM%', '%ADAMI%', '%SPEDIDAM%', '%Centre national%'])
      OR url ILIKE ANY (ARRAY['%cnc.fr%', '%cnm.fr%', '%cnap.fr%', '%centrenationaldulivre.fr%', '%sacem.fr%', '%adami.fr%', '%spedidam.fr%'])
    )
    ORDER BY title
  `);
  console.log(`\nLoaded ${grants.length} DB grants for these orgs (excluding generic Ministère/DRAC)\n`);

  const matches = [];
  const matchedScrapedUrls = new Set();
  const skipped = [];

  for (const g of grants) {
    const org = orgOf(g);
    if (!org || !allScraped[org]) {
      skipped.push({ grant: g, reason: `no scraped data for org=${org}` });
      continue;
    }
    const gToks = tokens(g.title);
    let best = { score: 0, aid: null };
    for (const a of allScraped[org]) {
      const s = jaccard(gToks, a._toks);
      if (s > best.score) best = { score: s, aid: a };
    }
    matches.push({
      grant: g,
      org,
      best_score: best.score,
      best_aid: best.aid,
      current_url: g.improved_url || g.url,
    });
    if (best.score >= THRESHOLD && best.aid) matchedScrapedUrls.add(best.aid.url);
  }

  // ------- Show 5 examples for validation -------
  matches.sort((a, b) => b.best_score - a.best_score);
  console.log("=".repeat(80));
  console.log("  5 EXEMPLES DE MATCHING (top by score)");
  console.log("=".repeat(80));
  for (const m of matches.slice(0, 5)) {
    console.log(`\n  [${m.org}] score=${m.best_score.toFixed(2)}`);
    console.log(`    DB title       : ${m.grant.title}`);
    console.log(`    Scraped title  : ${m.best_aid?.title || "(none)"}`);
    console.log(`    Current URL    : ${m.current_url || "(none)"}`);
    console.log(`    Proposed URL   : ${m.best_aid?.url || "(none)"}`);
  }

  // ------- Show 5 examples just under the threshold -------
  const borderline = matches.filter((m) => m.best_score < THRESHOLD).sort((a, b) => b.best_score - a.best_score).slice(0, 5);
  if (borderline.length) {
    console.log("\n" + "=".repeat(80));
    console.log("  5 EXEMPLES BORDERLINE (juste sous le seuil = à examiner manuellement)");
    console.log("=".repeat(80));
    for (const m of borderline) {
      console.log(`\n  [${m.org}] score=${m.best_score.toFixed(2)}`);
      console.log(`    DB title       : ${m.grant.title}`);
      console.log(`    Scraped title  : ${m.best_aid?.title || "(none)"}`);
      console.log(`    Current URL    : ${m.current_url || "(none)"}`);
      console.log(`    Proposed URL   : ${m.best_aid?.url || "(none)"}`);
    }
  }

  // ------- Stats -------
  const above = matches.filter((m) => m.best_score >= THRESHOLD);
  const below = matches.filter((m) => m.best_score < THRESHOLD);
  console.log("\n" + "=".repeat(80));
  console.log("  RÉSUMÉ");
  console.log("=".repeat(80));
  console.log(`  Grants éligibles au matching            : ${matches.length}`);
  console.log(`  Match >= ${THRESHOLD} (auto-update OK)            : ${above.length}`);
  console.log(`  Match <  ${THRESHOLD} (review manuel)             : ${below.length}`);
  console.log(`  Skipped (org inconnu)                   : ${skipped.length}`);

  // ------- Write CSVs -------
  const csv = ["org,score,grant_id,db_title,db_current_url,scraped_title,scraped_url"];
  for (const m of matches) {
    csv.push([
      m.org,
      m.best_score.toFixed(3),
      m.grant.id,
      JSON.stringify(m.grant.title || ""),
      JSON.stringify(m.current_url || ""),
      JSON.stringify(m.best_aid?.title || ""),
      JSON.stringify(m.best_aid?.url || ""),
    ].join(","));
  }
  writeFileSync(join(RESULTS_DIR, "matches.csv"), csv.join("\n"));
  console.log(`\n  → ${RESULTS_DIR}/matches.csv (${matches.length} lignes)`);

  // Unmatched scraped aids (potential new grants to add)
  const unmatched = [];
  for (const [org, aids] of Object.entries(allScraped)) {
    for (const a of aids) {
      if (matchedScrapedUrls.has(a.url)) continue;
      unmatched.push({ org, title: a.title, url: a.url });
    }
  }
  const ucsv = ["org,title,url"];
  for (const u of unmatched) ucsv.push(`${u.org},${JSON.stringify(u.title)},${JSON.stringify(u.url)}`);
  writeFileSync(join(RESULTS_DIR, "unmatched-scraped.csv"), ucsv.join("\n"));
  console.log(`  → ${RESULTS_DIR}/unmatched-scraped.csv (${unmatched.length} aides scrapées non matchées = candidats nouveaux grants)`);

  // Per-org summary
  console.log("\n  Par org:");
  for (const org of Object.keys(allScraped)) {
    const grantsForOrg = matches.filter((m) => m.org === org);
    const goodMatches = grantsForOrg.filter((m) => m.best_score >= THRESHOLD).length;
    const totalScraped = allScraped[org].length;
    const newCandidates = unmatched.filter((u) => u.org === org).length;
    console.log(`    ${org.padEnd(10)} | ${grantsForOrg.length} grants DB, ${goodMatches} matchent (>${THRESHOLD}), ${totalScraped} scraped (${newCandidates} non matchées)`);
  }

  await pool.end();
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
