/**
 * Vague 13 : dispositifs internationaux (OIF, AFD, British Council, Goethe).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== OIF — FRANCOPHONIE ==========
  {
    title: "Mobilité des artistes et circulation des biens culturels — OIF",
    organization: "OIF — Organisation Internationale de la Francophonie",
    description:
      "Appel à projets OIF qui soutient la mobilité internationale des artistes et la circulation des biens culturels dans l'espace francophone. Mobilité : max 5 000 €/projet. Circulation de biens : max 2 500 €/projet. Durée mobilité entre 5 jours et 3 mois. Budget total 100 000 €.",
    eligibility:
      "Artistes et professionnels de la culture ressortissants ou résidents d'un pays membre/associé/observateur de l'OIF (inclut France, Belgique francophone, Suisse, Québec, pays d'Afrique francophone, etc.). Projet de mobilité (rencontre pro, tournée, coopération) ou circulation de bien culturel.",
    amount: null,
    amountMin: 1000,
    amountMax: 5000,
    deadline: "23 février au 31 août 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://appelsaprojets.francophonie.org/fr/applications/soutien-a-la-circulation-des-biens-et-mobilite-des-artistes",
    grantType: ["Subvention", "Aide à la mobilité", "Appel à projets"],
    eligibleSectors: ["Musique", "Spectacle vivant", "Arts visuels", "Littérature", "Cinéma", "Mobilité", "Francophonie"],
    geographicZone: ["International", "Francophonie"],
    structureSize: ["Association", "TPE", "Individuel"],
    applicationDifficulty: "facile",
    acceptanceRate: 30,
    preparationAdvice:
      "Dispositif plus accessible que les fonds européens. Cible la circulation intra-francophone. Les mobilités Sud-Nord, Nord-Sud et Sud-Sud sont éligibles. Projet de mobilité entre le 25 mars et 31 novembre 2026. Dossier sur le portail appelsaprojets.francophonie.org.",
    status: "active",
  },
  {
    title: "Distribution et découvrabilité des contenus francophones — OIF",
    organization: "OIF — Organisation Internationale de la Francophonie",
    description:
      "Volet du programme « Industries culturelles et découvrabilité » de l'OIF. Finance la distribution et la visibilité numérique des contenus culturels francophones (musique, cinéma, livre, audiovisuel). Aide aux plateformes, festivals, agrégateurs, distributeurs.",
    eligibility:
      "Structures francophones actives dans la distribution ou la mise en visibilité de contenus culturels francophones. Plateforme, festival, agrégateur, service de distribution. Stratégie de découvrabilité formalisée.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "23 février au 31 mars 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.francophonie.org/industries-culturelles-les-appels-a-projets-2026-8384",
    grantType: ["Subvention", "Appel à projets"],
    eligibleSectors: ["Musique", "Cinéma", "Littérature", "Audiovisuel", "Distribution"],
    geographicZone: ["International", "Francophonie"],
    structureSize: ["TPE", "PME", "Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    preparationAdvice:
      "Projet doit avoir un volet NUMÉRIQUE fort (algorithmes, métadonnées, SEO, éditorialisation). L'OIF est sensible aux projets qui donnent de la visibilité aux contenus francophones sur les plateformes dominées par l'anglais.",
    status: "active",
  },

  // ========== AFD — AFRIQUE ==========
  {
    title: "Accès Culture — AFD × Institut français (Afrique)",
    organization: "AFD × Institut français",
    description:
      "Programme conjoint AFD et Institut français qui finance des micro-projets culturels à fort impact social en Afrique. Les lauréats reçoivent un soutien financier de 60 000 à 75 000 € sur 3 ans. Cible les paires France/Afrique en approche de coopération équitable. 30 projets financés par édition.",
    eligibility:
      "Paires de structures (1 française + 1 africaine) en coopération équitable. Associations, fondations, établissements culturels de collectivités, avec au moins 2 ans d'existence. Projet à fort impact social (éducation, égalité, inclusion, développement).",
    amount: null,
    amountMin: 60000,
    amountMax: 75000,
    deadline: "Consulter institutfrancais.com",
    frequency: "Biennal (2023-2026, nouveau cycle à venir)",
    isRecurring: true,
    url: "https://www.institutfrancais.com/fr/programme/aide-projet/acces-culture-edition-2023-2026",
    grantType: ["Subvention", "Aide à la coopération", "Financement pluriannuel", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Patrimoine", "Coopération culturelle"],
    geographicZone: ["International", "Afrique"],
    structureSize: ["Association", "Fondation", "EPCC"],
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    annualBeneficiaries: 30,
    preparationAdvice:
      "Dispositif avec ambition STRUCTURANTE sur 3 ans, pas une aide ponctuelle. La paire France/Afrique doit être construite dans la durée — l'AFD vérifie l'équité de la coopération (pas du « néo-coloniaisme culturel »). Budget conséquent permet un vrai projet de terrain.",
    status: "active",
  },
  {
    title: "Afrique Créative — AFD × Africalia",
    organization: "AFD × Africalia × I&P Conseil",
    description:
      "Programme d'accélération pour les entrepreneurs des industries culturelles et créatives en Afrique, financé par l'AFD. Accompagnement intensif 18 mois + financement amorçage. Cible les structures créatives qui veulent passer à l'échelle (labels, studios, maisons d'édition, agences créatives).",
    eligibility:
      "Entreprises des ICC (industries culturelles et créatives) basées en Afrique, avec au moins 2 ans d'existence, un modèle économique identifié, un potentiel de scale. Phase d'accélération — entre amorçage et maturité.",
    amount: null,
    amountMin: 20000,
    amountMax: 100000,
    deadline: "Consulter afriquecreative.fr",
    frequency: "Cycles pluriannuels",
    isRecurring: true,
    url: "https://afriquecreative.fr/",
    grantType: ["Subvention", "Accompagnement", "Aide à l'accélération"],
    eligibleSectors: ["Industries culturelles", "Entrepreneuriat culturel", "Musique", "Audiovisuel", "Édition", "Design"],
    geographicZone: ["International", "Afrique"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    preparationAdvice:
      "Pour les entreprises culturelles africaines ayant dépassé l'amorçage. Dossier business-plan solide : modèle économique, clients, équipe, ambition d'impact. La structure française partenaire est un plus mais pas obligatoire pour ce programme.",
    status: "active",
  },

  // ========== BRITISH COUNCIL ==========
  {
    title: "Diaphonique — Fonds franco-britannique pour la musique contemporaine",
    organization: "British Council France × Institut français",
    description:
      "Programme Diaphonique soutient les collaborations entre la France, le Royaume-Uni et l'Irlande en musique contemporaine classique. Finance commandes, concerts, tournées, résidences et projets éducatifs. Un des rares fonds transfrontaliers encore actifs pour le classique post-Brexit.",
    eligibility:
      "Structures françaises ou britanniques/irlandaises portant un projet de collaboration en musique contemporaine classique. Partenariat formalisé (au moins 1 partenaire dans chaque pays). Compositeur, interprète ou ensemble identifié.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "13 mars au 17 mai 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.britishcouncil.fr/arts/artistes-emergents/diaphonique",
    contactEmail: "arts@britishcouncil.fr",
    grantType: ["Subvention", "Aide à la coopération", "Appel à projets"],
    eligibleSectors: ["Musique", "Musique contemporaine", "Musique classique", "Composition"],
    geographicZone: ["International", "Royaume-Uni", "Irlande"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    preparationAdvice:
      "Les échanges FR/UK sont devenus plus coûteux post-Brexit (visas, fret) — Diaphonique est précieux. Commandes de compositeurs, résidences en conservatoire, tournées intérieures aux 3 pays sont éligibles. Dossier en anglais ou français.",
    status: "active",
  },
  {
    title: "Fluxus Art Projects — Fonds franco-britannique art contemporain",
    organization: "British Council France × Institut français (Fluxus Art Projects)",
    description:
      "Fonds franco-britannique qui soutient les artistes visuels et commissaires d'exposition émergents dans leurs carrières internationales. Finance expositions et visites curatoriales de part et d'autre de la Manche. Complémentaire de Diaphonique (arts visuels versus musique).",
    eligibility:
      "Artistes visuels et commissaires d'exposition émergents français ou britanniques. Projet d'exposition ou de visite curatoriale croisée FR/UK. Partenariat formalisé avec un lieu d'exposition dans l'autre pays.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "Consulter britishcouncil.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.britishcouncil.fr/arts/artistes-emergents/fluxus",
    grantType: ["Subvention", "Aide à la coopération", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Arts contemporains", "Curation", "Exposition"],
    geographicZone: ["International", "Royaume-Uni"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    preparationAdvice:
      "Le commissaire d'exposition est souvent le demandeur principal. Bien démontrer le caractère INTERNATIONAL du projet (pas juste « on fait une expo à Londres »). Partenariat institutionnel UK solide (gallery, art centre) est un plus fort.",
    status: "active",
  },

  // ========== GOETHE-INSTITUT ==========
  {
    title: "Culture Moves Europe — Résidences (hosts) via Goethe-Institut",
    organization: "Goethe-Institut × Creative Europe",
    description:
      "Volet spécifique de Culture Moves Europe dédié aux STRUCTURES qui accueillent des artistes internationaux en résidence. Financement entre 21 et 90 jours de résidence par artiste accueilli. Complément utile au volet mobilité individuelle (déjà en DB).",
    eligibility:
      "Personnes morales (associations, lieux d'art, festivals) établies dans un pays Creative Europe souhaitant accueillir des artistes internationaux en résidence. Programme de résidence formalisé, durée 21 à 90 jours. Restitution publique.",
    amount: null,
    amountMin: 3000,
    amountMax: 40000,
    deadline: "15 décembre 2025 au 16 mars 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.goethe.de/ins/fr/fr/kul/kur/cme.html",
    grantType: ["Subvention", "Aide à la résidence", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Arts numériques", "Résidence"],
    geographicZone: ["Europe", "International"],
    structureSize: ["Association", "TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Distinction avec le volet individuel : ici la STRUCTURE candidate pour accueillir. Formaliser le programme de résidence (critères de sélection artistes, modalités d'accueil, restitution). Cumul possible avec volet individuel = 2 sources de financement pour 1 résidence.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 13 : ${WAVE.length} grants à insérer.\n`);

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
