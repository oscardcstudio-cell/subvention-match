/**
 * Scrape les pages "liste des aides" des 7 gros organismes culturels et
 * produit pour chacun un mapping { url canonique, titre } qu'on rapprochera
 * ensuite des grants en DB pour corriger les URLs génériques.
 *
 * Sortie: scripts/scrape-results/<org>.json + scripts/scrape-results/all.json
 *
 * Usage:
 *   node scripts/scrape-big-orgs.mjs              # tous les orgs
 *   node scripts/scrape-big-orgs.mjs --only=cnc   # un seul
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";
import { execSync } from "child_process";

const args = process.argv.slice(2);
const onlyArg = args.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

const OUT_DIR = "scripts/scrape-results";
mkdirSync(OUT_DIR, { recursive: true });

const UA = "Mozilla/5.0 (compatible; MeceneBot/1.0)";

function curl(url, timeoutS = 15) {
  try {
    const out = execSync(
      `curl -sk -L --max-time ${timeoutS} --user-agent "${UA}" "${url}"`,
      { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 }
    );
    return out;
  } catch (e) {
    return e.stdout || "";
  }
}

function getChromiumPath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  return undefined;
}

async function withBrowser(fn) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: getChromiumPath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

// Get <title> from a URL via curl (cheap)
function fetchTitle(url) {
  const html = curl(url, 10);
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!m) return null;
  return m[1].trim().replace(/\s+/g, " ");
}

// Strip "| Org" suffix patterns from titles
function cleanTitle(t, org) {
  if (!t) return t;
  return t
    .replace(/\s*[\|\-–—]\s*(CNC|CNM|CNAP|CNL|SACEM|ADAMI|SPEDIDAM|Centre national.*|Sacem.*).*$/i, "")
    .replace(/\s*-\s*Aide-aux-projets.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

// =======================================
// CNC — multi-level crawl via curl
// =======================================
async function scrapeCNC() {
  const root = "https://www.cnc.fr/professionnels/aides-et-financements";
  const sectors = [
    "cinema",
    "audiovisuel",
    "court-metrage",
    "creation-numerique",
    "jeu-video",
    "industries-techniques",
    "international",
    "nouveaux-medias-et-creation-numerique",
    "patrimoine-cinematographique",
    "video-et-vad",
    "multi-sectoriel",
  ];

  const aids = [];
  const seen = new Set();

  // Discover sub-categories per sector, then aids in each sub-cat
  for (const sector of sectors) {
    const sectorUrl = `${root}/${sector}`;
    const html = curl(sectorUrl);
    if (!html) continue;

    // Extract subcategory pages (no _id in slug = category, with _id = leaf aid)
    const subPaths = new Set();
    const linkRe = /href="(\/professionnels\/aides-et-financements\/[a-z0-9-]+\/[a-z0-9-]+)"/g;
    let m;
    while ((m = linkRe.exec(html)) !== null) {
      const path = m[1];
      // skip the section index page itself
      if (path === `/professionnels/aides-et-financements/${sector}`) continue;
      subPaths.add(path);
    }

    // Also direct leaf aids on the sector page
    const leafRe = /href="(\/professionnels\/aides-et-financements\/[^"]+_\d+)"/g;
    while ((m = leafRe.exec(html)) !== null) {
      const path = m[1];
      const url = `https://www.cnc.fr${path}`;
      if (seen.has(url)) continue;
      seen.add(url);
      aids.push({ url, title: null, sector });
    }

    for (const subPath of subPaths) {
      const subHtml = curl(`https://www.cnc.fr${subPath}`);
      if (!subHtml) continue;
      const r2 = /href="(\/professionnels\/aides-et-financements\/[^"]+_\d+)"/g;
      let mm;
      while ((mm = r2.exec(subHtml)) !== null) {
        const url = `https://www.cnc.fr${mm[1]}`;
        if (seen.has(url)) continue;
        seen.add(url);
        aids.push({ url, title: null, sector });
      }
    }
  }

  console.log(`  CNC: ${aids.length} aid URLs found, fetching titles...`);
  for (let i = 0; i < aids.length; i++) {
    const t = fetchTitle(aids[i].url);
    aids[i].title = cleanTitle(t, "CNC");
    if ((i + 1) % 10 === 0) process.stdout.write(`    ${i + 1}/${aids.length}\r`);
  }
  console.log(`    ${aids.length} titles fetched`);
  return aids;
}

// =======================================
// CNM — famille-aide pages (curl)
// =======================================
async function scrapeCNM() {
  const families = [
    "aides-territoriales",
    "aides-transversales",
    "auteurs-compositeurs",
    "developpement-international",
    "disquaires",
    "editeurs",
    "musique-enregistree",
    "spectacle-vivant",
    "soutien-a-linnovation",
    "soutien-aux-entreprises",
    "structuration-et-developpement-professionnel",
  ];
  const seen = new Set();
  const aids = [];
  for (const fam of families) {
    const html = curl(`https://cnm.fr/famille-aide/${fam}/`);
    const re = /href="(https:\/\/cnm\.fr\/aides-financieres\/[a-z][^"#]+)"/g;
    let m;
    while ((m = re.exec(html)) !== null) {
      const url = m[1].endsWith("/") ? m[1] : m[1] + "/";
      if (url.includes("/feed/") || url.includes("/page/")) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      aids.push({ url, title: null, family: fam });
    }
  }
  console.log(`  CNM: ${aids.length} aid URLs found, fetching titles...`);
  for (let i = 0; i < aids.length; i++) {
    aids[i].title = cleanTitle(fetchTitle(aids[i].url), "CNM");
    if ((i + 1) % 10 === 0) process.stdout.write(`    ${i + 1}/${aids.length}\r`);
  }
  console.log(`    done`);
  return aids;
}

// =======================================
// CNL — /aides-financements (curl, static)
// =======================================
async function scrapeCNL() {
  const html = curl("https://centrenationaldulivre.fr/aides-financements");
  const seen = new Set();
  const aids = [];
  const re = /href="(\/aides-financement\/[a-z][^"#]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = `https://centrenationaldulivre.fr${m[1]}`;
    if (seen.has(url)) continue;
    seen.add(url);
    aids.push({ url, title: null });
  }
  // Also look at /aides
  const html2 = curl("https://centrenationaldulivre.fr/aides");
  while ((m = re.exec(html2)) !== null) {
    const url = `https://centrenationaldulivre.fr${m[1]}`;
    if (seen.has(url)) continue;
    seen.add(url);
    aids.push({ url, title: null });
  }
  console.log(`  CNL: ${aids.length} aid URLs found, fetching titles...`);
  for (let i = 0; i < aids.length; i++) {
    aids[i].title = cleanTitle(fetchTitle(aids[i].url), "CNL");
    if ((i + 1) % 10 === 0) process.stdout.write(`    ${i + 1}/${aids.length}\r`);
  }
  console.log(`    done`);
  return aids;
}

// =======================================
// ADAMI — sub-pages of cherche-financement-projet-artistique (curl)
// =======================================
async function scrapeADAMI() {
  const html = curl("https://www.adami.fr/que-fait-ladami-pour-moi/cherche-financement-projet-artistique/");
  const seen = new Set();
  const aids = [];
  const re = /href="(https:\/\/www\.adami\.fr\/que-fait-ladami-pour-moi\/cherche-financement-projet-artistique\/[a-z][^"#]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].endsWith("/") ? m[1] : m[1] + "/";
    if (seen.has(url)) continue;
    seen.add(url);
    aids.push({ url, title: null });
  }
  console.log(`  ADAMI: ${aids.length} aid URLs found, fetching titles...`);
  for (let i = 0; i < aids.length; i++) {
    aids[i].title = cleanTitle(fetchTitle(aids[i].url), "ADAMI");
  }
  console.log(`    done`);
  return aids;
}

// =======================================
// CNAP — Puppeteer (JS-rendered)
// =======================================
async function scrapeCNAP() {
  return await withBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    const aids = [];
    const seen = new Set();

    const startPages = [
      "https://www.cnap.fr/",
      "https://www.cnap.fr/soutien-creation/projets-artistes/modalites-de-candidature",
      "https://www.cnap.fr/soutien-creation/editeurs",
      "https://www.cnap.fr/soutien-creation/galeries",
      "https://www.cnap.fr/soutien-creation/photographie-documentaire-contemporaine/modalites-de-candidature",
      "https://www.cnap.fr/soutien-creation/maisons-production-image-mouvement/modalites-de-candidature",
      "https://www.cnap.fr/soutien-creation/recherche-theorie-critique-art/modalites-de-candidature",
      "https://www.cnap.fr/soutien-creation/rebond/modalites-candidature",
      "https://www.cnap.fr/soutien-creation/secours-exceptionnel",
    ];

    for (const url of startPages) {
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        const links = await page.$$eval("a", (els) =>
          els
            .map((e) => ({ href: e.href, text: (e.textContent || "").trim() }))
            .filter((l) => l.href && /cnap\.fr\/(soutien-creation|aides-et-commandes)/.test(l.href))
        );
        for (const l of links) {
          // exclude index pages
          if (/\/(soutien-creation|aides-et-commandes)\/?$/.test(l.href)) continue;
          if (seen.has(l.href)) continue;
          seen.add(l.href);
          aids.push({ url: l.href, title: l.text || null });
        }
      } catch (e) {
        console.log(`    CNAP fail ${url}: ${e.message}`);
      }
    }

    // Now resolve titles via fetchTitle for any with empty/short text
    console.log(`  CNAP: ${aids.length} aid URLs found, fetching titles...`);
    for (let i = 0; i < aids.length; i++) {
      if (!aids[i].title || aids[i].title.length < 5) {
        aids[i].title = cleanTitle(fetchTitle(aids[i].url), "CNAP");
      } else {
        aids[i].title = cleanTitle(aids[i].title, "CNAP");
      }
    }
    console.log(`    done`);
    return aids;
  });
}

// =======================================
// SACEM — Puppeteer (JS-rendered)
// =======================================
async function scrapeSACEM() {
  return await withBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    const seen = new Set();
    const aids = [];

    const startPages = [
      "https://aide-aux-projets.sacem.fr/",
      "https://aide-aux-projets.sacem.fr/nos-programmes-aide",
    ];

    for (const url of startPages) {
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        // Try to wait for content to render
        await new Promise((r) => setTimeout(r, 2500));
        const links = await page.$$eval("a", (els) =>
          els
            .map((e) => ({ href: e.href, text: (e.textContent || "").trim() }))
            .filter((l) => l.href.startsWith("https://aide-aux-projets.sacem.fr/"))
        );
        for (const l of links) {
          // Keep only program pages: /nos-programmes-aide/<slug> or /programmes-d-aide/<slug>
          if (!/\/(nos-programmes-aide|programmes-aide|programmes-d-aide|aides|programme)\/[a-z]/i.test(l.href)) continue;
          if (l.href.includes("/comment-") || l.href.includes("/css/") || l.href.includes("#")) continue;
          if (seen.has(l.href)) continue;
          seen.add(l.href);
          aids.push({ url: l.href, title: l.text || null });
        }
      } catch (e) {
        console.log(`    SACEM fail ${url}: ${e.message}`);
      }
    }

    console.log(`  SACEM: ${aids.length} aid URLs found, fetching titles...`);
    for (let i = 0; i < aids.length; i++) {
      if (!aids[i].title || aids[i].title.length < 5) {
        aids[i].title = cleanTitle(fetchTitle(aids[i].url), "SACEM");
      } else {
        aids[i].title = cleanTitle(aids[i].title, "SACEM");
      }
    }
    console.log(`    done`);
    return aids;
  });
}

// =======================================
// SPEDIDAM — Puppeteer
// =======================================
async function scrapeSPEDIDAM() {
  // The /aides-aux-projets/nos-programmes/ page is server-rendered (Next.js SSR)
  const html = curl("https://www.spedidam.fr/aides-aux-projets/nos-programmes/");
  const seen = new Set();
  const aids = [];
  const re = /href="(https:\/\/www\.spedidam\.fr\/aides-aux-projets\/nos-programmes\/[a-z][^"#]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const url = m[1].endsWith("/") ? m[1] : m[1] + "/";
    if (seen.has(url)) continue;
    seen.add(url);
    aids.push({ url, title: null });
  }
  console.log(`  SPEDIDAM: ${aids.length} aid URLs found, fetching titles...`);
  for (let i = 0; i < aids.length; i++) {
    aids[i].title = cleanTitle(fetchTitle(aids[i].url), "SPEDIDAM");
  }
  console.log(`    done`);
  return aids;
}

// =======================================
// Main
// =======================================
const ORGS = {
  cnc: { name: "CNC", fn: scrapeCNC },
  cnm: { name: "CNM", fn: scrapeCNM },
  cnl: { name: "CNL", fn: scrapeCNL },
  adami: { name: "ADAMI", fn: scrapeADAMI },
  cnap: { name: "CNAP", fn: scrapeCNAP },
  sacem: { name: "SACEM", fn: scrapeSACEM },
  spedidam: { name: "SPEDIDAM", fn: scrapeSPEDIDAM },
};

async function main() {
  const all = {};
  const start = Date.now();
  for (const [key, { name, fn }] of Object.entries(ORGS)) {
    if (ONLY && ONLY !== key) continue;
    console.log(`\n[${name}] starting...`);
    try {
      const aids = await fn();
      all[name] = aids;
      writeFileSync(join(OUT_DIR, `${key}.json`), JSON.stringify(aids, null, 2));
      console.log(`  → ${aids.length} aids saved to ${OUT_DIR}/${key}.json`);
    } catch (e) {
      console.error(`  [${name}] CRASH:`, e.message);
      all[name] = { error: e.message };
    }
  }
  writeFileSync(join(OUT_DIR, "all.json"), JSON.stringify(all, null, 2));
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nTotal: ${elapsed}s. Aggregated → ${OUT_DIR}/all.json`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
