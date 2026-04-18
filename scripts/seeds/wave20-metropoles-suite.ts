/**
 * Vague 20 : métropoles suite (MEL Lille, Montpellier, Marseille, Lyon).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== LILLE ==========
  {
    title: "Nature & Art — Saison culturelle Espaces Naturels MEL Lille",
    organization: "Métropole Européenne de Lille (MEL)",
    description:
      "Saison nature/culture de la MEL — programmation ~200 événements entre mars et novembre chaque année. Thématique annuelle (2026 : « Nature & Art »). Appel ouvert à artistes, associations naturalistes, compagnies culturelles, indépendants. Toutes formes artistiques accueillies : balades, performances, ateliers, contes, concerts, land art.",
    eligibility:
      "Artistes, associations, compagnies, indépendants portant un projet en lien avec la nature dans l'un des espaces naturels de la Métropole Européenne de Lille. Forme variée acceptée. Capacité à intervenir en plein air / en milieu naturel.",
    amount: null,
    amountMin: 500,
    amountMax: 5000,
    deadline: "Appels annuels (consulter enm.lillemetropole.fr)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://enm.lillemetropole.fr/",
    grantType: ["Prestation", "Programmation", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Contes", "Land art", "Nature"],
    geographicZone: ["Hauts-de-France", "Nord"],
    structureSize: ["Association", "TPE", "Individuel"],
    applicationDifficulty: "facile",
    acceptanceRate: 40,
    preparationAdvice:
      "Dispositif singulier orientant vers le rapport nature/culture. Parfait pour conteurs, compagnies de théâtre rue, artistes land art, musiciens acoustiques. Impact réel : 200 événements = volume considérable de possibilités. Cachets modestes mais visibilité territoriale intéressante.",
    status: "active",
  },

  // ========== MONTPELLIER ==========
  {
    title: "Fonds d'aide ICC — Montpellier Méditerranée Métropole",
    organization: "Montpellier Méditerranée Métropole",
    description:
      "Fonds d'aide à la création et au développement pour les Industries Culturelles et Créatives (ICC) du territoire de Montpellier. Cible les entreprises créatives (design, mode, jeu vidéo, audiovisuel, musique, édition) en phase de structuration ou d'expansion. Complémentaire des aides artistiques individuelles.",
    eligibility:
      "Entreprises des ICC (TPE/PME) implantées dans la Métropole de Montpellier. Minimum 1 an d'activité. Projet de structuration, développement commercial, innovation produit. Plan de développement démontré.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Consulter montpellier.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.montpellier.fr/vie-quotidienne/vivre-ici/se-cultiver/artistes-et-professionnels-de-la-culture/soutien-creation-filiere-image/fonds-aide-industries-culturelles-et-creatives",
    grantType: ["Subvention", "Aide au développement"],
    eligibleSectors: ["Industries culturelles", "Jeu vidéo", "Design", "Mode", "Audiovisuel", "Musique", "Édition"],
    geographicZone: ["Occitanie", "Montpellier"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Pour les entreprises créatives (pas les artistes-auteurs individuels). Montpellier Métropole a un écosystème ICC actif (French Tech Med, festivals). Dossier avec business plan + prévisionnel + impact territoire.",
    status: "active",
  },
  {
    title: "Résidence littéraire Lattara — Montpellier Méditerranée",
    organization: "Montpellier Méditerranée Métropole × CNL",
    description:
      "Résidence littéraire de 2 mois sur le site archéologique de Lattara (Lattes, sud de Montpellier). Peut être fractionnée. Bourse de résidence 2 000 € brut/mois versée soit par Montpellier Métropole soit par le CNL. Cadre patrimonial exceptionnel (vestiges protohistoriques).",
    eligibility:
      "Auteur.e.s ayant publié au moins 1 livre à compte d'éditeur. Projet d'écriture nouveau. Capacité à résider sur place (logement fourni). Programme public (rencontres, ateliers, restitution) attendu.",
    amount: 4000,
    deadline: "Sessions annuelles (consulter montpellier.fr)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.montpellier.fr/vie-quotidienne/vivre-ici/se-cultiver/artistes-et-professionnels-de-la-culture",
    grantType: ["Résidence", "Bourse"],
    eligibleSectors: ["Littérature", "Édition", "Poésie", "Résidence", "Patrimoine"],
    geographicZone: ["Occitanie", "Montpellier"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 6,
    preparationAdvice:
      "Cadre archéologique inspirant — idéal pour projets en lien avec patrimoine, ruines, mémoire, Méditerranée. Le fractionnement possible permet de continuer à vivre ailleurs en même temps. Cumul implicite avec CNL (l'un ou l'autre paie la bourse).",
    status: "active",
  },

  // ========== MARSEILLE ==========
  {
    title: "Éducation Artistique et Culturelle 2026 — Ville de Marseille",
    organization: "Ville de Marseille",
    description:
      "Appel à projets EAC de la Ville de Marseille pour 2026. Destiné aux associations portant des projets de médiation artistique et culturelle auprès des enfants et jeunes marseillais. Inscrit dans la Charte EAC de la Ville. Politique de généralisation forte.",
    eligibility:
      "Structures associatives portant un projet EAC avec une ou plusieurs écoles/établissements/structures jeunesse à Marseille. Partenariats formalisés. Impact sur le parcours EAC des enfants et jeunes.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "22 mars 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.marseille.fr/appels-a-projets-de-la-ville-de-marseille",
    grantType: ["Subvention", "Aide EAC", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "EAC", "Médiation culturelle"],
    geographicZone: ["Provence-Alpes-Côte d'Azur", "Marseille"],
    structureSize: ["Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Plateforme subventions.marseille.fr. Priorité aux quartiers politique de la ville et aux écoles REP/REP+. Contact technique : politiquedelaville@marseille.fr. Marseille Capitale européenne de la culture en 2013 a laissé un écosystème EAC structuré.",
    status: "active",
  },

  // ========== LYON ==========
  {
    title: "Subvention événements culturels espace public — Ville de Lyon",
    organization: "Ville de Lyon",
    description:
      "Dispositif principal de la Ville de Lyon pour financer les événements culturels se déroulant sur l'espace public lyonnais. Couvre festivals, déambulations artistiques, concerts en plein air, expositions urbaines. Deux sessions par an selon le calendrier de l'événement.",
    eligibility:
      "Associations et structures culturelles portant un projet d'événement culturel sur l'espace public lyonnais. Demandes d'autorisation d'occupation de l'espace public séparées. Plan de sécurité et de médiation avec riverains.",
    amount: null,
    amountMin: 3000,
    amountMax: 30000,
    deadline: "17 novembre 2025 (janv-juil 2026) ; 23 mars 2026 (août-déc 2026)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://subventions-aides.lyon.fr/",
    grantType: ["Subvention", "Aide à l'événement"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Arts visuels", "Arts de la rue", "Festival", "Événement culturel"],
    geographicZone: ["Auvergne-Rhône-Alpes", "Lyon"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 55,
    preparationAdvice:
      "Deadlines STRICTES et précoces — anticiper le dépôt 3 mois avant l'événement. Demande d'autorisation espace public à faire séparément (occupation, voirie, tranquillité). Dossier via subventions-aides.lyon.fr.",
    status: "active",
  },
  {
    title: "Coopération et mobilité internationale artistes — Ville de Lyon × Institut français",
    organization: "Ville de Lyon × Institut français",
    description:
      "Dispositif conjoint Ville de Lyon et Institut français qui finance les projets de coopération et mobilité internationale des artistes lyonnais. Volet bilatéral avec pays partenaires du réseau IF. Diffusion internationale, résidences à l'étranger, projets de coopération.",
    eligibility:
      "Artistes et porteurs de projets artistiques/culturels basés à Lyon ou Métropole. Projet avec dimension internationale forte (partenaire étranger, diffusion, résidence). Lien avec le réseau Institut français appréciable.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "16 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.lyon.fr/",
    contactEmail: "conventionIF.ville@mairie-lyon.fr",
    grantType: ["Subvention", "Aide à la mobilité", "Coopération internationale"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "International", "Mobilité"],
    geographicZone: ["Auvergne-Rhône-Alpes", "Lyon", "International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Envoyer un email à conventionIF.ville@mairie-lyon.fr pour recevoir le formulaire. Projet avec partenaire étranger identifié obligatoire. Cumul possible avec OIF ou Culture Moves Europe pour élargir le périmètre.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 20 : ${WAVE.length} grants à insérer.\n`);

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
