/**
 * Matrice de couverture : secteur × région × type d'organisme.
 * Identifie les trous dans la DB pour guider les prochaines vagues de seed.
 *
 * Usage: npx tsx scripts/audit/coverage-matrix.ts
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

// Secteurs qu'on veut couvrir, avec les mots-clés qui signalent la présence.
// Un grant est "dans" un secteur si son titre, description, eligibility,
// ou eligibleSectors contient au moins un mot-clé.
const SECTORS = {
  musique: ["musique", "musical", "music", "compositeur", "concert", "disque", "phono", "opera", "chant"],
  theatre: ["théâtre", "theatre", "dramaturge", "spectacle vivant", "mise en scène", "comédien"],
  danse: ["danse", "dance", "chorégraph", "ballet"],
  cirque: ["cirque", "arts de la rue", "arts de la piste"],
  arts_visuels: ["arts visuels", "arts plastiques", "peinture", "sculpture", "dessin", "installation"],
  cinema_audio: ["cinéma", "cinema", "audiovisuel", "film", "documentaire", "court métrage", "long métrage"],
  litterature: ["littérature", "literature", "livre", "édition", "auteur", "écrivain", "traduction", "poésie"],
  patrimoine: ["patrimoine", "monument", "restauration", "archéologie", "archive"],
  jeu_video: ["jeu vidéo", "jeux vidéo", "video game", "FAJV", "FRIJV"],
  arts_numeriques: ["arts numériques", "numérique", "digital", "nouveaux médias", "dispositif numérique"],
  photo: ["photographie", "photograph", "photo"],
  residence: ["résidence", "residency", "resident"],
  international: ["international", "export", "tournée étranger", "diffusion international"],
};

// Régions françaises (métropole + DROM)
const REGIONS = [
  "Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur",
  "Occitanie", "Nouvelle-Aquitaine", "Bretagne", "Pays de la Loire",
  "Normandie", "Hauts-de-France", "Grand Est", "Bourgogne-Franche-Comté",
  "Centre-Val de Loire", "Corse", "Guadeloupe", "Martinique", "Guyane",
  "La Réunion", "Mayotte",
];

// Types d'organismes
type OrgKind = "cnc" | "cnm" | "cnl" | "cnap" | "cnd" | "drac" | "region" | "departement"
  | "commune" | "ministere" | "fondation" | "europe" | "institut_francais" | "autre";

function classifyOrg(org: string): OrgKind {
  const o = org.toLowerCase();
  if (o.includes("cnc")) return "cnc";
  if (o.includes("cnm") || o.includes("centre national de la musique")) return "cnm";
  if (o.includes("cnl") || o.includes("centre national du livre")) return "cnl";
  if (o.includes("cnap") || o.includes("centre national des arts plastiques")) return "cnap";
  if (o.includes("cnd") || o.includes("centre national de la danse")) return "cnd";
  if (o.includes("drac")) return "drac";
  if (o.includes("région")) return "region";
  if (o.includes("conseil départemental") || o.includes("département")) return "departement";
  if (o.includes("ville de") || o.includes("commune") || o.includes("mairie") || o.includes("métropole")) return "commune";
  if (o.includes("ministère")) return "ministere";
  if (o.includes("fondation")) return "fondation";
  if (o.includes("creative europe") || o.includes("commission européenne") || o.includes("europe")) return "europe";
  if (o.includes("institut français")) return "institut_francais";
  return "autre";
}

async function main() {
  const all = await db
    .select({
      id: grants.id,
      title: grants.title,
      organization: grants.organization,
      description: grants.description,
      eligibility: grants.eligibility,
      eligibleSectors: grants.eligibleSectors,
      geographicZone: grants.geographicZone,
    })
    .from(grants)
    .where(eq(grants.status, "active"));

  console.log(`\n=== ${all.length} grants actives ===\n`);

  // Détecte les secteurs présents
  const hit = (g: any, keywords: string[]) => {
    const hay = [
      g.title, g.description, g.eligibility,
      Array.isArray(g.eligibleSectors) ? g.eligibleSectors.join(" ") : "",
    ].filter(Boolean).join(" ").toLowerCase();
    return keywords.some((k) => hay.includes(k.toLowerCase()));
  };

  // 1. Distribution par secteur
  console.log("\n=== Couverture par secteur ===\n");
  const bySector: Record<string, number> = {};
  for (const [sector, kw] of Object.entries(SECTORS)) {
    bySector[sector] = all.filter((g) => hit(g, kw)).length;
  }
  Object.entries(bySector)
    .sort(([, a], [, b]) => b - a)
    .forEach(([s, n]) => {
      const pct = ((n / all.length) * 100).toFixed(0);
      const bar = "█".repeat(Math.round(n / 10));
      console.log(`  ${s.padEnd(20)} ${n.toString().padStart(4)} (${pct.padStart(3)}%) ${bar}`);
    });

  // 2. Distribution par type d'organisme
  console.log("\n=== Par type d'organisme ===\n");
  const byOrgKind: Record<string, number> = {};
  for (const g of all) {
    const kind = classifyOrg(g.organization);
    byOrgKind[kind] = (byOrgKind[kind] || 0) + 1;
  }
  Object.entries(byOrgKind)
    .sort(([, a], [, b]) => b - a)
    .forEach(([k, n]) => {
      const pct = ((n / all.length) * 100).toFixed(0);
      console.log(`  ${k.padEnd(20)} ${n.toString().padStart(4)} (${pct.padStart(3)}%)`);
    });

  // 3. Matrice région × secteur : pour chaque région, combien dans chaque secteur ?
  console.log("\n=== Matrice région × secteur ===");
  console.log("(nb de grants dont l'organisme mentionne la région ET dont le contenu matche le secteur)\n");

  const header = ["région".padEnd(28), ...Object.keys(SECTORS).map((s) => s.slice(0, 6).padEnd(7))].join(" ");
  console.log(header);
  console.log("-".repeat(header.length));

  for (const region of REGIONS) {
    const regionGrants = all.filter((g) =>
      g.organization.toLowerCase().includes(region.toLowerCase()),
    );
    const row = [region.padEnd(28)];
    for (const [, kw] of Object.entries(SECTORS)) {
      const n = regionGrants.filter((g) => hit(g, kw)).length;
      row.push(n.toString().padStart(7));
    }
    console.log(row.join(" "));
  }

  // 4. Organismes nationaux critiques : combien on a ?
  console.log("\n=== Présence des organismes nationaux critiques ===\n");
  const nationals = [
    { name: "CNC", keywords: ["cnc", "centre national du cinema"] },
    { name: "CNM", keywords: ["cnm", "centre national de la musique"] },
    { name: "CNL", keywords: ["cnl", "centre national du livre"] },
    { name: "CNAP", keywords: ["cnap", "centre national des arts plastiques"] },
    { name: "CND", keywords: ["cnd", "centre national de la danse"] },
    { name: "ONDA", keywords: ["onda", "office national de diffusion"] },
    { name: "Institut français", keywords: ["institut français"] },
    { name: "Bureau Export", keywords: ["bureau export", "bureauexport"] },
    { name: "Ministère Culture", keywords: ["ministère de la culture", "ministere de la culture"] },
    { name: "ADAMI", keywords: ["adami"] },
    { name: "SACEM", keywords: ["sacem"] },
    { name: "SPEDIDAM", keywords: ["spedidam"] },
    { name: "FCM", keywords: ["fcm", "fonds pour la création musicale"] },
    { name: "SACD", keywords: ["sacd"] },
    { name: "SGDL", keywords: ["sgdl", "société des gens de lettres"] },
    { name: "Creative Europe", keywords: ["creative europe", "creative-europe"] },
    { name: "Fondation de France", keywords: ["fondation de france"] },
    { name: "Fondation BNP Paribas", keywords: ["bnp paribas"] },
    { name: "Fondation Bettencourt", keywords: ["bettencourt"] },
    { name: "Fondation Hermès", keywords: ["fondation hermès", "fondation hermes"] },
    { name: "Fondation Cartier", keywords: ["fondation cartier", "cartier pour l'art"] },
    { name: "Fondation Roederer", keywords: ["roederer"] },
    { name: "Banque des Territoires", keywords: ["banque des territoires", "caisse des dépôts"] },
    { name: "Bpifrance", keywords: ["bpifrance", "bpi france"] },
  ];

  for (const { name, keywords } of nationals) {
    const matches = all.filter((g) => {
      const o = g.organization.toLowerCase();
      return keywords.some((k) => o.includes(k.toLowerCase()));
    });
    const mark = matches.length === 0 ? "❌" : matches.length < 3 ? "⚠️ " : "✓";
    console.log(`  ${mark} ${name.padEnd(28)} ${matches.length.toString().padStart(3)} grants`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
