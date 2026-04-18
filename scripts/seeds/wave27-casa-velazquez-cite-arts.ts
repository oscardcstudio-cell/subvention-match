/**
 * Vague 27 : Casa de Velázquez Madrid + Cité internationale des arts (multiples
 * programmes) + Fondation Daniel Langlois.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== CASA DE VELÁZQUEZ ==========
  {
    title: "Résidence artistes — Casa de Velázquez (Académie de France à Madrid)",
    organization: "Casa de Velázquez — Académie de France à Madrid",
    description:
      "Équivalent Villa Médicis mais à Madrid. 12 artistes accueillis par an en résidence de 11 mois (septembre à juillet). Toutes disciplines : dessin, gravure, sculpture, peinture, architecture, composition musicale, chorégraphie, photographie, cinéma, vidéo. Logement + atelier + bourse + bourse mission.",
    eligibility:
      "Artistes sans critère de nationalité ni d'âge (majorité légale). Projet de création ou de recherche en lien avec le contexte espagnol/ibérique OU à mener dans les conditions offertes par la Casa. Dossier complet (CV, portfolio, note de projet détaillée) + audition en français à Paris.",
    amount: null,
    amountMin: 20000,
    amountMax: 40000,
    deadline: "28 novembre 2025 (pour 2026-2027)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.casadevelazquez.org/la-casa/candidatures-artistes",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Musique", "Architecture", "Photographie", "Cinéma", "Danse", "Dessin", "Peinture", "Sculpture"],
    geographicZone: ["International", "Espagne"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 12,
    preparationAdvice:
      "Sélectivité similaire à Villa Médicis. La Casa valorise les projets ANCRÉS dans le contexte ibérique ou qui nécessitent la Péninsule (archives, collaborations, matériaux). Audition obligatoire en français. 11 mois sur place = engagement long, incompatible avec autres activités professionnelles.",
    status: "active",
  },

  // ========== CITÉ INTERNATIONALE DES ARTS ==========
  {
    title: "Trame — Cité internationale des arts (francophonie)",
    organization: "Cité internationale des arts (Paris)",
    description:
      "Programme de résidences 3 mois (avril-juin 2026) réservé aux artistes francophones de tous pays. 10 lauréats. Toutes disciplines : arts visuels, spectacle vivant, littérature, cinéma, musique, architecture, design, curation. Atelier-logement + bourse + programme d'événements professionnels.",
    eligibility:
      "Artistes francophones professionnels avec au moins 5 ans de pratique. Capacité à s'exprimer et écrire en français. Disponibilité complète sur 3 mois (2 avril - 26 juin 2026). Participation aux rencontres pro organisées.",
    amount: null,
    amountMin: 4500,
    amountMax: 12000,
    deadline: "Consulter citedesartsparis.net (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.citedesartsparis.net/fr/trame-2026",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Littérature", "Cinéma", "Musique", "Architecture", "Design", "Francophonie"],
    geographicZone: ["International", "Francophonie"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Programme unique : résidence dédiée à la francophonie artistique. Pour un artiste d'Afrique francophone, Belgique, Québec, Suisse, Maghreb = accès au cœur de Paris avec accompagnement pro. Cumul avec OIF Mobilité envisageable.",
    status: "active",
  },
  {
    title: "Résidence 2-12 — Cité internationale des arts",
    organization: "Cité internationale des arts (Paris)",
    description:
      "Programme de résidences flexibles à la Cité internationale des arts : durées variables de 2 à 12 mois entre septembre 2026 et août 2027. Deux sites : Le Marais (historique) et Montmartre. Toutes disciplines. Candidature individuelle ou collective.",
    eligibility:
      "Artistes et professionnels de la culture de toutes nationalités. Projet de création ou de recherche à mener à Paris. Capacité de communication en français ou anglais. Durée souhaitée 2-12 mois.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Sessions régulières",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.citeinternationaledesarts.fr/en/appels-a-candidature/2-12/",
    grantType: ["Résidence", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Cinéma", "Arts numériques"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    preparationAdvice:
      "Très flexible : la durée 2-12 mois permet d'adapter à un agenda pro. L'atelier-logement au Marais ou Montmartre = cadre parisien central. Les bourses varient beaucoup selon la structure financeuse (chaque résidence a un partenaire).",
    status: "active",
  },
  {
    title: "Résidence Art Explora × Cité internationale des arts",
    organization: "Fondation Art Explora × Cité internationale des arts",
    description:
      "Programme de résidences mis en place en 2021 par la Fondation Art Explora et la Cité internationale des arts. 80+ résidents de toutes disciplines et nationalités accueillis à ce jour. Accent sur l'ouverture culturelle et le dialogue entre pratiques.",
    eligibility:
      "Artistes, professionnels de la culture, curateurs portant un projet à Paris avec dimension d'ouverture culturelle. Toutes disciplines. Dossier avec présentation du projet, portfolio, CV.",
    amount: null,
    amountMin: 5000,
    amountMax: 18000,
    deadline: "Consulter artexplora.org (appel 2026/2027 ouvert)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.artexplora.org/residences-dartistes-presentation-du-programme",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Curation", "Arts numériques"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    preparationAdvice:
      "Fondation Art Explora très active dans l'ouverture culturelle — projets qui questionnent l'accessibilité de l'art, le dialogue interculturel, l'innovation pédagogique valorisés. Résidence de 3-6 mois typiquement.",
    status: "active",
  },
  {
    title: "Résidence ADAGP × Cité internationale des arts",
    organization: "ADAGP × Cité internationale des arts",
    description:
      "Résidence à la Cité internationale des arts réservée aux auteurs des arts visuels membres ADAGP. Dispositif conjoint qui permet à un artiste ADAGP de bénéficier d'un atelier-logement + bourse à Paris. Complément des autres bourses ADAGP (monographie, vidéo, fanzine).",
    eligibility:
      "Auteurs des arts visuels membres ADAGP. Projet de création ou de recherche à mener à Paris à la Cité internationale des arts. Durée et modalités précisées dans l'appel annuel.",
    amount: null,
    amountMin: 4000,
    amountMax: 12000,
    deadline: "Consulter adagp.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adagp.fr/en/support-artistic-creation/direct-aid-artists/residencies/adagp-and-cite-internationale-des-arts-residency",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Résidence"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 3,
    preparationAdvice:
      "Adhésion ADAGP préalable obligatoire (gratuite pour les auteurs arts visuels). Cumul possible avec d'autres aides ADAGP non résidentielles.",
    status: "active",
  },

  // ========== FONDATION DANIEL LANGLOIS ==========
  {
    title: "Fondation Daniel Langlois — Arts, Sciences, Technologies",
    organization: "Fondation Daniel Langlois (Montréal, Canada)",
    description:
      "Fondation canadienne créée en 1997 au rayonnement international. Soutient la recherche artistique, scientifique et technologique à la convergence art/science/technologie. Finance projets, expositions, publications. Une des rares fondations en francophonie spécifiquement dédiées à l'art numérique et aux arts médiatiques.",
    eligibility:
      "Artistes, chercheurs, structures culturelles portant un projet à la croisée art/science/technologie. Arts numériques, arts médiatiques, bio-art, sound art, robotics art. Projet international apprécié (pas seulement Québec/Canada).",
    amount: null,
    amountMin: 10000,
    amountMax: 100000,
    deadline: "Dépôts en continu (consulter fondation-langlois.org)",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.fondation-langlois.org/",
    grantType: ["Subvention", "Aide à la recherche"],
    eligibleSectors: ["Arts numériques", "Arts médiatiques", "Sound art", "Bio-art", "Recherche artistique", "Art et science"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    preparationAdvice:
      "Dossier solide sur l'articulation art/science. Collaboration avec scientifique/ingénieur idéale. La Fondation Langlois a soutenu des artistes majeurs de l'art numérique (Stelarc, ORLAN, etc.). Dossier en français ou anglais. Orientation canadienne mais ouverture internationale.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 27 : ${WAVE.length} grants à insérer.\n`);

  const all = await db.select({ title: grants.title }).from(grants);
  const existingSet = new Set(all.map((g) => g.title.toLowerCase()));
  const toInsert = WAVE.filter((g) => !existingSet.has(g.title.toLowerCase()));

  console.log(`- ${WAVE.length - toInsert.length} déjà présents (skippés)`);
  console.log(`- ${toInsert.length} nouveaux à insérer\n`);

  if (toInsert.length === 0) {
    console.log("Rien à faire. ✓");
    process.exit(0);
  }

  const inserted = await db.insert(grants).values(toInsert).returning({
    id: grants.id,
    title: grants.title,
    organization: grants.organization,
  });

  console.log(`✓ ${inserted.length} grants insérés :\n`);
  inserted.forEach((g) => console.log(`  · [${g.organization}] ${g.title}`));

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
