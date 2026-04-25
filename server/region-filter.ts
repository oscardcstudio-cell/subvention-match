/**
 * Pré-filtre géographique pour les grants.
 *
 * Rejette les grants dont l'organisme appartient clairement à une région ou
 * un département français différent de celui de l'utilisateur. Laisse passer
 * les grants nationales, européennes, ou sans indication régionale claire.
 *
 * But : éviter que le matcher IA propose une aide du Conseil départemental
 * des Landes à un utilisateur breton.
 */

// Régions françaises et leurs départements principaux (noms et codes)
// Utilisé pour détecter les mismatches évidents entre org et région user.
const REGION_DEPARTMENTS: Record<string, string[]> = {
  "île-de-france": [
    "paris", "seine-et-marne", "yvelines", "essonne", "hauts-de-seine",
    "seine-saint-denis", "val-de-marne", "val-d'oise", "iledefrance",
  ],
  "auvergne-rhône-alpes": [
    "ain", "allier", "ardèche", "cantal", "drôme", "isère", "loire",
    "haute-loire", "puy-de-dôme", "rhône", "savoie", "haute-savoie",
    "auvergne", "rhône-alpes",
  ],
  "bretagne": [
    "côtes-d'armor", "finistère", "ille-et-vilaine", "morbihan",
  ],
  "normandie": [
    "calvados", "eure", "manche", "orne", "seine-maritime",
  ],
  "nouvelle-aquitaine": [
    "charente", "charente-maritime", "corrèze", "creuse", "dordogne",
    "gironde", "landes", "lot-et-garonne", "pyrénées-atlantiques",
    "deux-sèvres", "vienne", "haute-vienne", "aquitaine", "poitou-charentes",
    "limousin",
  ],
  "occitanie": [
    "ariège", "aude", "aveyron", "gard", "haute-garonne", "gers",
    "hérault", "lot", "lozère", "hautes-pyrénées", "pyrénées-orientales",
    "tarn", "tarn-et-garonne", "languedoc-roussillon", "midi-pyrénées",
  ],
  "hauts-de-france": [
    "aisne", "nord", "oise", "pas-de-calais", "somme",
    "nord-pas-de-calais", "picardie",
  ],
  "grand est": [
    "ardennes", "aube", "marne", "haute-marne", "meurthe-et-moselle",
    "meuse", "moselle", "bas-rhin", "haut-rhin", "vosges",
    "alsace", "champagne-ardenne", "lorraine",
  ],
  "pays de la loire": [
    "loire-atlantique", "maine-et-loire", "mayenne", "sarthe", "vendée",
  ],
  "provence-alpes-côte d'azur": [
    "alpes-de-haute-provence", "hautes-alpes", "alpes-maritimes",
    "bouches-du-rhône", "var", "vaucluse", "paca",
  ],
  "centre-val de loire": [
    "cher", "eure-et-loir", "indre", "indre-et-loire", "loir-et-cher",
    "loiret",
  ],
  "bourgogne-franche-comté": [
    "côte-d'or", "doubs", "jura", "nièvre", "haute-saône", "saône-et-loire",
    "yonne", "territoire de belfort", "bourgogne", "franche-comté",
  ],
  "corse": ["corse-du-sud", "haute-corse", "corse"],
};

function normalize(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/['\u2019]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Détecte la région française mentionnée dans un nom d'organisme.
 * Retourne null si pas de région identifiable (→ aide nationale/UE/inconnue).
 */
export function detectRegionFromOrg(org: string | null | undefined): string | null {
  if (!org) return null;
  const orgNorm = normalize(org);

  // Exclure les orgs nationales/UE/ministères
  const nationalKeywords = [
    "ministere de la culture", "ministry of culture",
    "commission europeenne", "european commission", "creative europe",
    "cnc", "cnm", "cnl", "cnap", "sacem", "spedidam", "adami", "sofia",
    "fondation de france", "onda",
  ];
  if (nationalKeywords.some((k) => orgNorm.includes(k))) return null;

  for (const [region, departments] of Object.entries(REGION_DEPARTMENTS)) {
    const regionNorm = normalize(region);
    if (orgNorm.includes(regionNorm)) return region;
    for (const dept of departments) {
      const deptNorm = normalize(dept);
      if (orgNorm.includes(deptNorm)) return region;
    }
  }
  return null;
}

const UNIVERSAL_GEO_KEYWORDS = [
  "national", "international", "france", "europe", "union europeenne", "outre-mer", "perimetre du gal",
];

/**
 * Vérifie si une grant est compatible avec la région de l'utilisateur.
 * - true : compatible (même région, nationale, ou région non identifiable)
 * - false : mismatch clair (ex: grant Landes pour user breton)
 *
 * Si geographicZones est fourni (champ DB explicite), il est utilisé en priorité
 * sur la détection heuristique par nom d'organisme.
 */
export function isRegionCompatible(
  grantOrg: string | null | undefined,
  userRegion: string | null | undefined,
  geographicZones?: string[] | null
): boolean {
  if (!userRegion) return true;

  // Utiliser geographicZone en priorité si disponible
  if (geographicZones && geographicZones.length > 0) {
    const zonesNorm = geographicZones.map(normalize);

    // Aide nationale/internationale → passe toujours
    if (zonesNorm.some((z) => UNIVERSAL_GEO_KEYWORDS.some((k) => z.includes(k)))) return true;

    const userRegionNorm = normalize(userRegion);

    // Match direct région (ex: "Île-de-France" === "Île-de-France")
    if (zonesNorm.some((z) => z === userRegionNorm || z.includes(userRegionNorm))) return true;

    // Match département → région (ex: "Drôme" appartient à "Auvergne-Rhône-Alpes")
    const userRegionDepts = REGION_DEPARTMENTS[userRegion.toLowerCase()] ?? [];
    if (userRegionDepts.length > 0) {
      for (const dept of userRegionDepts) {
        const deptNorm = normalize(dept);
        if (zonesNorm.some((z) => z.includes(deptNorm))) return true;
      }
    }

    // geographicZone présent mais ne match pas → rejeter
    return false;
  }

  // Fallback : détection heuristique par nom d'organisme
  const grantRegion = detectRegionFromOrg(grantOrg);
  if (!grantRegion) return true; // aide nationale ou ambiguë → laisser passer

  return normalize(userRegion) === normalize(grantRegion);
}
