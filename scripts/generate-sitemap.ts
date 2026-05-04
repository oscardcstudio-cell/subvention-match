/**
 * Génère client/public/sitemap.xml avec toutes les URLs SEO.
 * Lancer : npx tsx scripts/generate-sitemap.ts
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = "https://subvention-match-production.up.railway.app";
const TODAY = new Date().toISOString().slice(0, 10);

const DOMAINS = [
  "musique", "spectacle-vivant", "audiovisuel", "arts-plastiques",
  "ecriture", "arts-numeriques", "patrimoine", "metiers-art", "transversal",
];

const REGION_SLUGS = [
  "auvergne-rhone-alpes", "bourgogne-franche-comte", "bretagne",
  "centre-val-de-loire", "corse", "grand-est", "hauts-de-france",
  "ile-de-france", "normandie", "nouvelle-aquitaine", "occitanie",
  "pays-de-la-loire", "provence-alpes-cote-d-azur", "outre-mer",
];

const urls: { loc: string; changefreq: string; priority: string; lastmod?: string }[] = [
  { loc: `${BASE}/`,                    changefreq: "weekly",   priority: "1.0", lastmod: TODAY },
  { loc: `${BASE}/form`,               changefreq: "monthly",  priority: "0.9" },
  { loc: `${BASE}/mentions-legales`,   changefreq: "yearly",   priority: "0.2" },
];

// Pages index domaine
for (const domain of DOMAINS) {
  urls.push({ loc: `${BASE}/subventions/${domain}`, changefreq: "weekly", priority: "0.8", lastmod: TODAY });
}

// Pages domaine × région
for (const domain of DOMAINS) {
  for (const region of REGION_SLUGS) {
    urls.push({ loc: `${BASE}/subventions/${domain}/${region}`, changefreq: "weekly", priority: "0.7", lastmod: TODAY });
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

const outPath = join(__dirname, "../client/public/sitemap.xml");
writeFileSync(outPath, xml, "utf-8");
console.log(`✅ Sitemap généré : ${urls.length} URLs → ${outPath}`);
