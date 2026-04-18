/**
 * Vague 1 : organismes nationaux sectoriels manquants.
 *
 * Avant ce seed, la DB contenait 0 grant pour : CND, SACD, SGDL,
 * Institut français. Cette vague corrige ces trous avec les
 * dispositifs-phares de chaque organisme (sources vérifiées avril 2026).
 *
 * Usage: npx tsx scripts/seeds/wave1-organismes-nationaux.ts
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== CND — DANSE ==========
  {
    title: "Aide à la recherche et au patrimoine en danse — CND",
    organization: "Centre national de la danse (CND)",
    description:
      "Programme d'aide qui soutient la conception, le développement et la diffusion de ressources en danse créées par des professionnels de la danse. Objectif : créer des outils dans le domaine de la danse et du mouvement (partitions, recherches, archives, captations). Principal dispositif d'aide à la recherche chorégraphique en France.",
    eligibility:
      "Professionnels de la danse : chorégraphes, interprètes, chercheurs, notateurs, dramaturges. Projet de recherche ou de constitution de ressource patrimoniale lié à la danse. Les lauréats doivent présenter publiquement leur travail lors des journées de février 2028.",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "10 février 2026",
    frequency: "Annuel (commission en avril)",
    isRecurring: true,
    url: "https://www.cnd.fr/fr/page/303-aide-a-la-recherche-et-au-patrimoine-en-danse",
    contactEmail: "aide-recherche-patrimoine@cnd.fr",
    contactPhone: "01 41 83 43 96",
    grantType: ["Subvention", "Aide à la recherche", "Aide patrimoine"],
    eligibleSectors: ["Danse", "Recherche chorégraphique", "Patrimoine chorégraphique"],
    geographicZone: ["National"],
    maxFundingRate: 80,
    processingTime: "2 mois après la commission d'avril",
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Inscriptions en ligne dès novembre 2025, clôture 10 février 2026. Articuler clairement l'objet de recherche et le livrable (partition, outil pédagogique, captation patrimoniale). Un CV professionnel démontrant l'ancrage dans le champ chorégraphique est indispensable.",
    status: "active",
  },
  {
    title: "Danse en amateur et répertoire — CND",
    organization: "Centre national de la danse (CND)",
    description:
      "Dispositif qui soutient la transmission et la diffusion du répertoire chorégraphique auprès des pratiquants amateurs. Finance des projets qui font dialoguer compagnies professionnelles et groupes amateurs autour de la reprise d'œuvres du répertoire.",
    eligibility:
      "Structures associatives ou culturelles portant un projet de transmission du répertoire chorégraphique à des danseurs amateurs. Projet impliquant une compagnie ou un chorégraphe professionnel. Restitution publique prévue.",
    amount: null,
    amountMin: 3000,
    amountMax: 12000,
    deadline: "Consulter le site CND",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.cnd.fr/fr/page/323-appels-a-projets-danse-en-amateur-et-repertoire",
    grantType: ["Subvention", "Aide à la transmission"],
    eligibleSectors: ["Danse", "Pratique amateur", "Répertoire chorégraphique"],
    geographicZone: ["National"],
    maxFundingRate: 60,
    coFundingRequired: "Oui",
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    annualBeneficiaries: 20,
    status: "active",
  },

  // ========== SACD — SPECTACLE VIVANT ==========
  {
    title: "Fonds SACD Théâtre",
    organization: "SACD — Société des Auteurs et Compositeurs Dramatiques",
    description:
      "Soutien aux projets théâtraux (secteur privé et public) combinant une prime d'écriture pour l'auteur (2 500 €) et une enveloppe de production (10 000 €, ou 5 000 € si cumul avec aide Beaumarchais-SACD). Un des rares dispositifs qui rémunère spécifiquement l'auteur.e dramatique au-delà des droits.",
    eligibility:
      "Œuvre dramatique d'expression française, inédite, jamais jouée en professionnel. Auteur membre ou non de la SACD. Projet porté par une structure de production (compagnie, théâtre) engagée à créer le spectacle dans les 18 mois. Circuit privé ou public accepté.",
    amount: 12500,
    deadline: "Sessions régulières — consulter portail SACD",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.artcena.fr/fil-vie-pro/solliciter-le-fonds-sacd-theatre",
    grantType: ["Subvention", "Aide à l'écriture", "Aide à la production"],
    eligibleSectors: ["Théâtre", "Spectacle vivant", "Écriture dramatique"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 20,
    preparationAdvice:
      "Le dossier doit inclure le texte intégral (inédit), une note d'intention de mise en scène, un budget prévisionnel et un plan de diffusion. L'enveloppe production (10K) n'est débloquée qu'à l'engagement de création — prévoir le timing en conséquence.",
    status: "active",
  },
  {
    title: "Fonds SACD Musique de scène",
    organization: "SACD — Société des Auteurs et Compositeurs Dramatiques",
    description:
      "Aide dédiée aux compositeurs de musique de scène (théâtre, danse, cirque, arts de la rue). Rémunère spécifiquement le travail de composition pour un spectacle vivant. Complémentaire des aides CNM qui ciblent plutôt la production musicale autonome.",
    eligibility:
      "Compositeurs et compositrices auteurs d'une musique originale créée pour un spectacle vivant. Œuvre inédite. Projet porté par une compagnie ou structure de production avec calendrier de création confirmé.",
    amount: null,
    amountMin: 2000,
    amountMax: 8000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://aidesmusiquesactuelles.fr/events/fonds-sacd-musique-de-scene/",
    grantType: ["Subvention", "Aide à la composition"],
    eligibleSectors: ["Musique", "Musique de scène", "Spectacle vivant", "Théâtre", "Danse", "Cirque"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Fournir des extraits audio ou maquettes des compositions prévues. La commande par la compagnie doit être formalisée (contrat ou lettre d'engagement). Bien articuler le lien dramaturgique entre la musique et l'œuvre scénique.",
    status: "active",
  },
  {
    title: "Bourses d'écriture théâtre — Beaumarchais-SACD",
    organization: "Association Beaumarchais — SACD",
    description:
      "Bourses destinées à des auteurs dramatiques émergents pour soutenir l'écriture d'une œuvre théâtrale originale. Une dizaine de disciplines couvertes (théâtre, humour, jeunesse, création radiophonique, création numérique, cinéma, animation…). Référence historique pour les primo-auteurs.",
    eligibility:
      "Auteur.rice.s émergent.e.s : pas plus d'une œuvre déjà créée en conditions professionnelles. Projet d'œuvre originale en cours d'écriture, d'expression française. Dossier avec synopsis, note d'intention, extraits et CV.",
    amount: null,
    amountMin: 3000,
    amountMax: 8000,
    deadline: "Sessions régulières — consulter beaumarchais.asso.fr",
    frequency: "2 à 3 sessions par an",
    isRecurring: true,
    url: "https://beaumarchais.asso.fr/theatre/",
    grantType: ["Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Théâtre", "Écriture dramatique", "Jeunesse", "Humour"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 25,
    annualBeneficiaries: 30,
    preparationAdvice:
      "Porte d'entrée idéale pour les primo-auteurs : la sélection valorise le potentiel plus que le CV. Présenter une dizaine de pages bien écrites vaut mieux qu'un synopsis trop ambitieux. Les commissions sont composées d'auteur.rice.s pairs.",
    status: "active",
  },

  // ========== SGDL — LITTÉRATURE ==========
  {
    title: "Bourse de création Sarane Alexandrian — SGDL",
    organization: "SGDL — Société des Gens de Lettres",
    description:
      "Bourse annuelle de 10 000 € destinée à soutenir un projet de création littéraire d'avant-garde, tous genres confondus. Issue du legs de Sarane Alexandrian, historien du surréalisme. Une des rares bourses individuelles substantielles pour les auteurs en France.",
    eligibility:
      "Auteur.rice.s ayant déjà publié au moins un ouvrage à compte d'éditeur. Projet d'œuvre littéraire novatrice en cours d'écriture. Dossier avec manuscrit partiel (20-50 pages), note d'intention et CV bibliographique.",
    amount: 10000,
    deadline: "31 mars 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.sgdl.org/sgdl-accueil/le-guide-pratique/les-aides-aux-auteurs",
    grantType: ["Bourse", "Aide à la création"],
    eligibleSectors: ["Littérature", "Édition", "Avant-garde", "Poésie", "Fiction"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 10,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Bourse très sélective — 1 seul.e lauréat.e par an. Le mot-clé du legs est « avant-garde » : la commission valorise l'audace formelle, pas le classicisme. Soigner la note d'intention pour articuler la prise de risque.",
    status: "active",
  },
  {
    title: "Bourse de poésie Gina Chenouard — SGDL",
    organization: "SGDL — Société des Gens de Lettres",
    description:
      "Bourse de poésie issue du legs de Gina Chenouard (1924-2010), poétesse. Soutient un projet d'écriture poétique original. Un des rares dispositifs dédiés spécifiquement à la poésie contemporaine.",
    eligibility:
      "Poète ayant déjà publié au moins un recueil à compte d'éditeur. Projet de recueil en cours d'écriture. Dossier avec poèmes du projet (15-30 pages) et CV bibliographique.",
    amount: null,
    amountMin: 3000,
    amountMax: 8000,
    deadline: "Consulter sgdl.org",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.sgdl.org/sgdl-accueil/le-guide-pratique/les-aides-aux-auteurs",
    grantType: ["Bourse"],
    eligibleSectors: ["Littérature", "Poésie"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 1,
    status: "active",
  },

  // ========== INSTITUT FRANÇAIS — MOBILITÉ INTERNATIONALE ==========
  {
    title: "PAIR — Program for International Artists in Residence",
    organization: "Institut français",
    description:
      "Dispositif destiné aux structures culturelles en France (métropole et Outre-mer) qui accueillent des artistes étrangers en résidence. L'Institut français co-finance la résidence : mobilité de l'artiste, per diem, bourse de production, frais administratifs. 20 à 30 projets soutenus par an.",
    eligibility:
      "Structures culturelles en France (associations, centres d'art, lieux labellisés, festivals) accueillant un ou plusieurs artistes étrangers en résidence de création. Résidence d'au moins 1 mois entre juin 2026 et juin 2027. Projet avec volet public (restitution, diffusion).",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Consulter institutfrancais.com",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.institutfrancais.com/fr/programme/aide-projet/pair-program-international-artists-residence",
    grantType: ["Subvention", "Aide à la résidence"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Arts numériques", "Résidence"],
    geographicZone: ["National", "International"],
    structureSize: ["TPE", "Association", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui",
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    annualBeneficiaries: 25,
    preparationAdvice:
      "La structure française est le demandeur, pas l'artiste étranger. Démontrer la pertinence stratégique de l'accueil (ancrage territoire, diffusion de la résidence, inscription dans un programme cohérent). Lettre d'invitation à l'artiste en annexe obligatoire.",
    status: "active",
  },
  {
    title: "Résidences Institut français × Cité internationale des arts",
    organization: "Institut français",
    description:
      "Programme de résidences à la Cité internationale des arts (Paris, Marais ou Montmartre) pour artistes et professionnels de la culture vivant à l'étranger. Durée 3, 6 ou 9 mois entre avril 2026 et avril 2027. Bourse mensuelle, atelier-logement, accompagnement professionnel. Un des dispositifs-phares de la mobilité entrante en France.",
    eligibility:
      "Artistes et professionnels de la culture résidant en permanence à l'étranger depuis au moins 5 ans. Toutes disciplines. Projet de création ou de recherche à mener à Paris. Dossier en français ou en anglais.",
    amount: null,
    amountMin: 4500,
    amountMax: 15000,
    deadline: "Appel annuel — consulter ifprog.emundus.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.institutfrancais.com/fr/programme/residence-mobilite-professionnelle/residences-institut-francais-x-cite-internationale",
    grantType: ["Bourse", "Aide à la résidence", "Mobilité"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Arts numériques", "Cinéma", "Résidence"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    annualBeneficiaries: 30,
    preparationAdvice:
      "Attention : réservé aux artistes résidant à l'ÉTRANGER depuis 5+ ans (pas les artistes français basés en France). Pour un artiste français à l'étranger, vérifier l'éligibilité avec l'équipe IF. Dossier évalué par un jury de pairs — soigner la note de projet spécifique Paris/France.",
    status: "active",
  },
  {
    title: "La Fabrique des résidences — Institut français",
    organization: "Institut français",
    description:
      "Dispositif qui finance la participation d'artistes et professionnels français à des résidences organisées par le réseau culturel français à l'étranger (Instituts français, Alliances françaises). 18 appels lancés en mars-avril 2026, de la Colombie à la Corée du Sud. 50+ programmes de résidences dans le monde.",
    eligibility:
      "Artistes et professionnels de la culture résidant en France (ou binationaux). Toutes disciplines. Projet cohérent avec le programme de résidence choisi à l'étranger. Capacité à communiquer en français et/ou en anglais (selon pays).",
    amount: null,
    amountMin: 2000,
    amountMax: 10000,
    deadline: "Mars-avril 2026 (18 appels distincts)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.institutfrancais.com/fr/programme/aide-projet/fabrique-residences",
    grantType: ["Bourse", "Aide à la mobilité", "Aide à la résidence"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Arts numériques", "Cinéma", "Résidence"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    annualBeneficiaries: 80,
    preparationAdvice:
      "Chaque pays a son propre appel avec ses propres critères — ne PAS candidater à plusieurs simultanément sans adapter. Étudier le pays cible (contexte culturel, institutions locales). Un projet qui s'ancre dans le contexte local du pays hôte passe mieux qu'un projet français « transplanté ».",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 1 : ${WAVE.length} grants à insérer.\n`);

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
