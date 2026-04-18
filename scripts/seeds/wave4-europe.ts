/**
 * Vague 4 : programmes européens (Creative Europe Culture + mobilité).
 *
 * Avant ce seed, la DB avait 4 grants "europe" (dont Creative Europe MEDIA
 * DEVVGIM jeu vidéo de la vague 0). Cette vague étend avec les dispositifs
 * Creative Europe Culture (pas MEDIA), qui couvrent spectacle vivant,
 * arts visuels, littérature, patrimoine, musique.
 *
 * Usage: npx tsx scripts/seeds/wave4-europe.ts
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== CREATIVE EUROPE CULTURE — COOPERATION PROJECTS ==========
  {
    title: "Creative Europe — European Cooperation Projects SMALL SCALE",
    organization: "Creative Europe Culture (Commission européenne)",
    description:
      "Soutient les projets de coopération culturelle transnationale entre structures européennes. Petite échelle : consortium d'au moins 3 organisations de 3 pays différents. Couvre TOUTES les disciplines culturelles et créatives — arts visuels, spectacle vivant, musique, littérature, patrimoine, design, architecture. Budget annuel enveloppe : ~60M€ pour ~150 projets (toutes tailles).",
    eligibility:
      "Consortium d'au moins 3 organisations issues de 3 pays éligibles Creative Europe différents (UE-27 + pays associés). Structures culturelles établies (associations, centres d'art, théâtres, festivals, éditeurs). Projet avec dimension européenne et circulation d'artistes/œuvres entre partenaires.",
    amount: null,
    amountMin: 50000,
    amountMax: 200000,
    deadline: "5 mai 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://culture.ec.europa.eu/funding/calls",
    grantType: ["Subvention européenne", "Aide à la coopération", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Patrimoine", "Design", "Architecture", "Coopération européenne"],
    geographicZone: ["Europe", "International"],
    structureSize: ["Association", "PME", "ETI"],
    maxFundingRate: 80,
    coFundingRequired: "Oui - 20% minimum",
    processingTime: "6 mois après dépôt",
    applicationDifficulty: "difficile",
    acceptanceRate: 20,
    annualBeneficiaries: 80,
    preparationAdvice:
      "Consortium multi-pays obligatoire — ne pas attendre la dernière minute pour recruter les partenaires. Anglais requis pour le dossier (souvent 60-80 pages). Budget en lump sum depuis 2023 : plus besoin de justifier les dépenses poste par poste, simplification bienvenue. Prévoir 3-4 mois de montage.",
    status: "active",
  },
  {
    title: "Creative Europe — European Cooperation Projects MEDIUM SCALE",
    organization: "Creative Europe Culture (Commission européenne)",
    description:
      "Version grande échelle de Cooperation Projects : consortium d'au moins 5 organisations de 5 pays. Subvention pouvant atteindre 1M€. Destiné aux projets structurants de coopération culturelle transnationale avec dimension de circulation, formation, innovation.",
    eligibility:
      "Consortium d'au moins 5 organisations issues de 5 pays éligibles Creative Europe différents. Structures culturelles ayant une expérience de coopération européenne. Projet à forte ambition structurante.",
    amount: null,
    amountMin: 200000,
    amountMax: 1000000,
    deadline: "5 mai 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://culture.ec.europa.eu/funding/calls",
    grantType: ["Subvention européenne", "Aide à la coopération", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Patrimoine", "Design", "Architecture", "Coopération européenne"],
    geographicZone: ["Europe", "International"],
    structureSize: ["Association", "PME", "ETI"],
    maxFundingRate: 70,
    coFundingRequired: "Oui - 30% minimum",
    processingTime: "6 mois après dépôt",
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    annualBeneficiaries: 50,
    preparationAdvice:
      "Format pour les structures déjà aguerries à l'Europe. Le jury attend un impact structurel (nouveaux réseaux, outils pérennes, transformation du secteur). Monter une proposition à 1M€ demande 4-6 mois de travail avec un consortium engagé. Bureau Europe Créative France accompagne gratuitement.",
    status: "active",
  },

  // ========== CREATIVE EUROPE — LITERATURE ==========
  {
    title: "Creative Europe — Circulation of European Literary Works 2026",
    organization: "Creative Europe Culture (Commission européenne)",
    description:
      "Soutient la traduction, publication, distribution et promotion d'œuvres littéraires européennes de fiction. 3 échelles selon nombre de traductions : Small (5+), Medium (11+), Large (21+). Focus particulier sur les langues moins traduites. Budget annuel : 5M€ pour ~40 projets.",
    eligibility:
      "Éditeurs ou maisons d'édition établis dans un pays Creative Europe (UE-27 + pays associés). Statut de personne morale (individuels non éligibles). Au moins 5 œuvres de fiction d'auteurs européens à traduire. Stratégie éditoriale, de distribution et de promotion détaillée.",
    amount: null,
    amountMin: 50000,
    amountMax: 300000,
    deadline: "29 janvier 2026, 17h CET",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://culture.ec.europa.eu/node/3721",
    grantType: ["Subvention européenne", "Aide à la traduction", "Appel à projets"],
    eligibleSectors: ["Littérature", "Édition", "Traduction", "Fiction"],
    geographicZone: ["Europe", "International"],
    structureSize: ["Association", "TPE", "PME", "ETI"],
    maxFundingRate: 60,
    processingTime: "5 à 6 mois",
    applicationDifficulty: "difficile",
    acceptanceRate: 40,
    annualBeneficiaries: 40,
    preparationAdvice:
      "Échelles : 100K (5+ titres), 200K (11+), 300K (21+ en consortium). Les langues sources moins traduites (bulgare, grec, letton, etc.) sont favorisées : un éditeur français qui traduit depuis ces langues a un vrai avantage. Stratégie de promotion détaillée obligatoire : foires, libraires, presse, rencontres auteurs.",
    status: "active",
  },

  // ========== CULTURE MOVES EUROPE — MOBILITÉ INDIVIDUELLE ==========
  {
    title: "Culture Moves Europe — Mobilité individuelle artistes",
    organization: "Creative Europe Culture (via Goethe-Institut)",
    description:
      "Successeur d'i-Portunus. Finance les mobilités individuelles d'artistes et professionnels culturels entre pays Creative Europe (40 pays). Couvre 7 secteurs : architecture, patrimoine, design & mode, littérature, musique, spectacle vivant, arts visuels. Séjours de 7 à 60 jours. Bourse incluant voyage + per diem.",
    eligibility:
      "Artistes et professionnels culturels résidant légalement dans un des 40 pays Creative Europe (UE + pays tiers et DROM inclus). Minimum 18 ans. Projet de mobilité avec partenaire d'accueil identifié dans un autre pays Creative Europe. Durée 7-60 jours.",
    amount: null,
    amountMin: 350,
    amountMax: 5000,
    deadline: "Appels récurrents tout au long de l'année",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://culture.ec.europa.eu/node/3679",
    grantType: ["Bourse", "Aide à la mobilité", "Appel à projets"],
    eligibleSectors: ["Architecture", "Patrimoine", "Design", "Mode", "Littérature", "Musique", "Spectacle vivant", "Arts visuels", "Mobilité"],
    geographicZone: ["Europe", "International"],
    applicationDifficulty: "facile",
    acceptanceRate: 30,
    annualBeneficiaries: 500,
    preparationAdvice:
      "DISPOSITIF LE PLUS ACCESSIBLE de l'UE pour un artiste individuel. Pas de co-financement requis, dossier simple (5-10 pages), décision rapide (2-3 mois). Montants : 350€/semaine pour voyage + per diem ajusté au pays cible. Partenaire d'accueil OBLIGATOIRE — pas juste « je veux partir 2 mois ».",
    status: "active",
  },
  {
    title: "Culture Moves Europe — Résidences (host structures)",
    organization: "Creative Europe Culture (via Goethe-Institut)",
    description:
      "Volet complémentaire de Culture Moves Europe destiné aux STRUCTURES qui accueillent des artistes étrangers en résidence. Finance 1 à 5 résidences par structure d'accueil. Format flexible : résidences courtes (5-7 jours) à longues (60 jours).",
    eligibility:
      "Structures culturelles établies dans un pays Creative Europe (association, lieu d'art, festival, centre culturel). Capacité à accueillir physiquement les artistes (studio, logement). Programme de résidence formalisé avec restitution publique.",
    amount: null,
    amountMin: 3000,
    amountMax: 40000,
    deadline: "Appels récurrents",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://culture.ec.europa.eu/funding-creative-europe/culture-strand/i-portunus-mobility-artists-and-professionals",
    grantType: ["Subvention", "Aide à la résidence", "Appel à projets"],
    eligibleSectors: ["Architecture", "Patrimoine", "Design", "Littérature", "Musique", "Spectacle vivant", "Arts visuels", "Résidence"],
    geographicZone: ["Europe", "International"],
    structureSize: ["Association", "TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    annualBeneficiaries: 200,
    preparationAdvice:
      "Pour les structures : moins concurrencé que le volet individuel. Formaliser un programme de résidence avec critères de sélection des artistes, partenariats locaux, valorisation publique. Déclinable en cycle (ex : 4 artistes × 1 mois sur 1 an).",
    status: "active",
  },

  // ========== PERFORM EUROPE — SPECTACLE VIVANT ==========
  {
    title: "Perform Europe — Performing arts cross-border tours",
    organization: "Creative Europe Culture (Perform Europe consortium)",
    description:
      "Dispositif dédié à la circulation transfrontalière de spectacles vivants en Europe. Finance les tournées de spectacles (théâtre, danse, cirque, arts de la rue) entre pays Creative Europe. Approche éco-responsable explicite : limitation avion, mutualisation des déplacements.",
    eligibility:
      "Structures de spectacle vivant (compagnies, producteurs, festivals, salles) établies en pays Creative Europe. Projet de tournée ou de circulation impliquant au moins 2 pays Creative Europe. Engagement écoresponsable (limitation empreinte carbone).",
    amount: null,
    amountMin: 15000,
    amountMax: 60000,
    deadline: "Appels récurrents",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://performeurope.eu/",
    grantType: ["Subvention européenne", "Aide à la diffusion", "Appel à projets"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Arts de la rue", "Spectacle vivant", "Diffusion internationale"],
    geographicZone: ["Europe", "International"],
    structureSize: ["Association", "TPE", "PME"],
    maxFundingRate: 80,
    coFundingRequired: "Oui - 20% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Volet éco-responsable crucial : voyages en train valorisés, mutualisation décors, charte carbone. Partenaires co-producteurs européens à identifier en amont. Les agents de diffusion européens (réseau IETM) peuvent aider à monter les consortia.",
    status: "active",
  },

  // ========== MUSIC MOVES EUROPE ==========
  {
    title: "Music Moves Europe — Music Export and Co-creation",
    organization: "Creative Europe Culture (Music Moves Europe)",
    description:
      "Volet musique du programme Creative Europe. Soutient l'export musical et les projets de co-création entre artistes/structures de pays différents. Adressé tant aux artistes émergents qu'aux structures organisant showcases, tournées, résidences musicales.",
    eligibility:
      "Artistes, groupes, labels, managers, booking agents, festivals musicaux établis en pays Creative Europe. Projet avec dimension européenne : tournée, résidence, co-création, showcase. Focus musiques actuelles (mais classique/jazz éligibles).",
    amount: null,
    amountMin: 5000,
    amountMax: 50000,
    deadline: "Appels récurrents",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://culture.ec.europa.eu/funding-creative-europe/culture-strand/music-moves-europe",
    grantType: ["Subvention européenne", "Aide à l'export", "Appel à projets"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Jazz", "Classique", "Export"],
    geographicZone: ["Europe", "International"],
    structureSize: ["TPE", "PME", "Association"],
    maxFundingRate: 70,
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    preparationAdvice:
      "Plus accessible que les gros Cooperation Projects. Adapté pour labels indé qui veulent structurer leur export. Les projets de co-création (artistes de 2+ pays créant ensemble) sont particulièrement valorisés.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 4 : ${WAVE.length} grants à insérer.\n`);

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
