/**
 * Vague 25 : design, architecture, journalisme, art et environnement.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== VILLA NOAILLES — DESIGN / MODE ==========
  {
    title: "Design Parade — Concours Design d'objet (Villa Noailles)",
    organization: "Villa Noailles (Hyères)",
    description:
      "Concours international de design d'objet organisé par la Villa Noailles à Hyères, un des événements de référence en design. Exposition des projets sélectionnés au Festival Design Parade (25-28 juin 2026), rencontres avec industriels et galeries, prix + contrat de production potentiel.",
    eligibility:
      "Designers émergents de toutes nationalités. Projet d'objet design abouti (prototype ou présérie). Pas de limite d'âge stricte mais orientation émergence. Frais de dépôt 15 €.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "1er février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://villanoailles.com/pages/appel-a-candidatures-design-parade-2026/concours-design",
    grantType: ["Prix", "Concours", "Appel à candidatures"],
    eligibleSectors: ["Design", "Design d'objet", "Design produit"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 5,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Concours visible du monde du design (médias, industriels, éditeurs de mobilier). Exposition à Hyères = vitrine prestigieuse. Prévoir un prototype présentable, pas juste des rendus 3D.",
    status: "active",
  },
  {
    title: "Design Parade — Concours Architecture d'intérieur (Villa Noailles)",
    organization: "Villa Noailles (Hyères)",
    description:
      "10e Festival International d'Architecture d'intérieur à Hyères (25-28 juin 2026). Volet Architecture d'intérieur du Design Parade. Cible les architectes d'intérieur, scénographes, designers d'espace émergents.",
    eligibility:
      "Architectes d'intérieur émergents, scénographes, designers d'espace. Projet récent ou en cours. Présentation portfolio + projet spécifique. Frais de dépôt 15 €.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "1er février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://villanoailles.com/pages/appel-a-candidatures-design-parade-2026/concours-architecture-interieur",
    grantType: ["Prix", "Concours", "Appel à candidatures"],
    eligibleSectors: ["Architecture d'intérieur", "Design", "Scénographie"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 5,
    annualBeneficiaries: 10,
    status: "active",
  },
  {
    title: "Festival International de Mode, Photographie et Accessoires — Hyères",
    organization: "Villa Noailles (Hyères)",
    description:
      "41e édition du Festival International de Mode, Photographie et Accessoires de Hyères (15-18 octobre 2026). Concours prestigieux dans le monde de la mode jeune : les lauréats ont souvent un contrat avec une maison de luxe. Volet photographie = tremplin pour photographes de mode émergents.",
    eligibility:
      "Créateurs de mode émergents (collection capsule min 10 pièces), photographes de mode (série de 10+ images), designers d'accessoires. Portfolio + note de création. International.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "31 janvier 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://villanoailles.com/pages/appel-a-candidatures-festival-international-de-mode-de-photographie-et-d-accessoires-hyeres-2026",
    grantType: ["Prix", "Concours", "Appel à candidatures"],
    eligibleSectors: ["Mode", "Photographie", "Design", "Accessoires"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 3,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Festival ultra-visible dans le monde de la mode. Les lauréats jeunes créateurs sont systématiquement repérés par les maisons (Chanel, Louis Vuitton, Hermès). Volet photo de mode plus spécialisé.",
    status: "active",
  },

  // ========== AJAP ARCHITECTURE ==========
  {
    title: "AJAP — Albums des Jeunes Architectes et Paysagistes",
    organization: "Ministère de la Culture × Cité de l'architecture et du patrimoine",
    description:
      "Concours biennal du Ministère de la Culture (créé 1980) qui distingue la nouvelle génération d'architectes et paysagistes. Depuis 2023, ouvert aussi aux diplômés explorant d'autres voies (scénographie, direction de travaux, médiation, critique). ~20-25 lauréats par édition. Campagne de promotion pendant 2 ans avec Ministère, Cité de l'architecture, Institut français.",
    eligibility:
      "Architectes, paysagistes, diplômés en architecture. Moins de 10 ans d'exercice (généralement <40 ans). Français ou résidant en France. Portfolio de réalisations OU de projets pour les profils « autres voies ».",
    amount: null,
    amountMin: 0,
    amountMax: 10000,
    deadline: "Sessions biennales (prochaine 2026/2027 à confirmer)",
    frequency: "Biennal",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/thematiques/architecture/architecture-et-cadre-de-vie/palmares-d-architecture/les-albums-des-jeunes-architectes-et-paysagistes",
    grantType: ["Prix", "Reconnaissance institutionnelle", "Promotion internationale"],
    eligibleSectors: ["Architecture", "Paysagisme", "Scénographie"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 23,
    preparationAdvice:
      "Pas une grosse dotation cash — le VRAI bénéfice est la campagne de promotion 2 ans (expositions internationales, catalogue, tour étranger IF). Lauréats AJAP reçoivent systématiquement des commandes post-sélection. Portfolio très soigné obligatoire.",
    status: "active",
  },

  // ========== JOURNALISME - BOURSES ALBERT LONDRES ==========
  {
    title: "Bourse Albert Londres — Web vidéo",
    organization: "Association du Prix Albert Londres × SCAM",
    description:
      "Bourse dédiée aux nouvelles formes de journalisme : web-reportage vidéo adapté aux usages contemporains. 16 000 € pour développer un projet en ligne. Complémentaire du Prix Albert Londres classique (presse écrite et radio).",
    eligibility:
      "Journalistes francophones de 40 ans ou moins, non permanents d'une entreprise de presse (freelance, indépendants). Projet unitaire de web-reportage vidéo, en réflexion ou en cours de production.",
    amount: 16000,
    deadline: "23 mars au 27 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://prix-albert-londres.scam.fr/bourses/lappel-a-projets/",
    grantType: ["Bourse", "Aide à la production"],
    eligibleSectors: ["Journalisme", "Web journalisme", "Vidéo", "Documentaire"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 3,
    preparationAdvice:
      "Critère -40 ans strict. Projet VIDÉO EN LIGNE (pas TV traditionnelle). Angle original, méthodo documentaire solide, plan de diffusion digital. Association du Prix Albert Londres = légitimité forte pour un jeune journaliste.",
    status: "active",
  },
  {
    title: "Bourse Albert Londres — Podcast (reportage sonore)",
    organization: "Association du Prix Albert Londres × SCAM",
    description:
      "Volet PODCAST des Bourses Albert Londres. 8 000 € pour un projet de reportage sonore / podcast journalistique. Dispositif qui accompagne l'essor du podcast natif en journalisme.",
    eligibility:
      "Journalistes francophones de 40 ans ou moins, non permanents. Projet de podcast / reportage sonore unitaire. Trame narrative, sources, méthodologie.",
    amount: 8000,
    deadline: "23 mars au 27 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://prix-albert-londres.scam.fr/bourses/lappel-a-projets/",
    grantType: ["Bourse", "Aide à la production"],
    eligibleSectors: ["Journalisme", "Podcast", "Reportage sonore", "Radio"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 3,
    status: "active",
  },

  // ========== COAL — ART ET ENVIRONNEMENT ==========
  {
    title: "Prix COAL 2026 — Art et Environnement (thème : La Nuit)",
    organization: "COAL — Coalition pour une écologie culturelle",
    description:
      "Prix annuel COAL dédié à l'Art et l'Environnement (créé 2010). Thème 2026 : « La Nuit » (bien commun menacé, enjeu écologique). Lauréat : 12 000 € + résidence de création au Domaine de Belval (Fondation François Sommer). Prix spécial : 3 000 €. Mention Ateliers Médicis : résidence à Clichy-sous-Bois / Montfermeil.",
    eligibility:
      "Artistes toutes disciplines (arts visuels, spectacle vivant, arts numériques) portant un projet en lien avec le thème de l'année. Dimension écologique substantielle (pas décorative). Dossier PDF unique < 30 Mo.",
    amount: 12000,
    deadline: "28 avril 2026, 23h59",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://projetcoal.org/prix/prix-coal/appel-a-projets-prix-coal-2026-la-nuit/",
    grantType: ["Prix", "Bourse", "Résidence", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Arts numériques", "Spectacle vivant", "Écologie", "Art environnemental"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 10,
    annualBeneficiaries: 3,
    preparationAdvice:
      "Dossier exigeant : projet artistique + démarche écologique articulée + budget + CV. Le thème « Nuit » est riche (pollution lumineuse, sommeil, rites nocturnes, bio-luminescence, photographie astronomique). Résidence Belval (Ardennes) = cadre exceptionnel de création liée au vivant.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 25 : ${WAVE.length} grants à insérer.\n`);

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
