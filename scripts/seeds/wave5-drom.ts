/**
 * Vague 5 : dispositifs Outre-mer (Guadeloupe, Martinique, Guyane, Réunion).
 *
 * Avant ce seed : 0 grants pour les DROM sur toutes disciplines. L'audit
 * coverage-matrix montrait des lignes entièrement vides. Cette vague
 * corrige en posant les dispositifs principaux de chaque territoire + le
 * FEAC (Fonds d'aide aux échanges artistiques Outre-mer, Ministère Culture).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== MINISTÈRE CULTURE — FEAC ==========
  {
    title: "FEAC — Fonds d'aide aux échanges artistiques et culturels Outre-mer",
    organization: "Ministère de la Culture",
    description:
      "Fonds transversal qui finance les échanges artistiques et culturels entre les territoires d'Outre-mer et la métropole (ou entre territoires ultramarins). Couvre toutes les disciplines. Dispositif-clé pour sortir de l'enclavement culturel des DROM et créer des circulations de projets, d'artistes, d'œuvres.",
    eligibility:
      "Structures culturelles, compagnies, artistes basés en France (métropole ou Outre-mer) portant un projet d'échange artistique avec ou au sein des territoires d'Outre-mer. Partenariat formalisé avec une structure d'accueil dans le territoire ciblé.",
    amount: null,
    amountMin: 3000,
    amountMax: 30000,
    deadline: "Sessions annuelles — consulter culture.gouv.fr",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/fonds-d-aide-aux-echanges-artistiques-et-culturels-pour-les-outre-mer-feac",
    grantType: ["Subvention", "Aide à la mobilité", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Arts visuels", "Littérature", "Cinéma", "Patrimoine", "Outre-mer"],
    geographicZone: ["Guadeloupe", "Martinique", "Guyane", "La Réunion", "Mayotte", "National"],
    maxFundingRate: 70,
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Dispositif sous-utilisé par rapport à son potentiel. Un artiste métropolitain qui veut créer un pont avec un lieu ultramarin (et inversement) a ici un outil dédié. Accueil + billets + per diem. Partenariat structure locale indispensable.",
    status: "active",
  },

  // ========== GUADELOUPE ==========
  {
    title: "Aide à la création artistique — Région Guadeloupe",
    organization: "Région Guadeloupe",
    description:
      "Dispositif principal de la Région Guadeloupe pour soutenir la création artistique guadeloupéenne. Couvre les arts visuels, le spectacle vivant, la musique. Plafond à 50% du budget total. Examen par la Commission Permanente selon critères de sincérité budgétaire et plan de financement.",
    eligibility:
      "Artistes et structures culturelles basés en Guadeloupe. Projet de création avec budget détaillé et plan de financement. Pièces obligatoires : CV artistique, dossier de projet, devis, attestations partenaires.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "Campagne annuelle 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.regionguadeloupe.fr/les-aides-les-services/guide-des-aides/detail/actualites/aide-a-la-creation-artistique/categorie/culture-sport/",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Danse", "Théâtre"],
    geographicZone: ["Guadeloupe"],
    maxFundingRate: 50,
    coFundingRequired: "Oui - 50% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Portail numérique obligatoire (plus de papier). Le dossier doit démontrer l'ancrage guadeloupéen et l'apport culturel pour le territoire. Cumul possible avec aides Département et DAC Guadeloupe.",
    status: "active",
  },
  {
    title: "Aide à l'accès aux résidences des artistes — Région Guadeloupe",
    organization: "Région Guadeloupe",
    description:
      "Soutient les artistes guadeloupéens pour accéder à des résidences en France ou à l'international. Finance mobilité, hébergement, per diem. Dispositif-clé pour sortir de l'isolement géographique de l'archipel et nouer des liens avec des scènes métropolitaines ou caribéennes.",
    eligibility:
      "Artistes guadeloupéens avec un parcours professionnel démontré. Invitation formalisée d'une résidence d'accueil (France ou international). Budget de séjour détaillé.",
    amount: null,
    amountMin: 2000,
    amountMax: 8000,
    deadline: "Dépôts en continu",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.regionguadeloupe.fr/les-aides-services/guide-des-aides/detail/actualites/aide-a-lacces-aux-residences-des-artistes/",
    grantType: ["Subvention", "Aide à la mobilité", "Aide à la résidence"],
    eligibleSectors: ["Arts visuels", "Musique", "Spectacle vivant", "Littérature", "Résidence"],
    geographicZone: ["Guadeloupe"],
    maxFundingRate: 50,
    applicationDifficulty: "facile",
    acceptanceRate: 60,
    preparationAdvice:
      "Lettre d'invitation officielle de la structure d'accueil obligatoire. Budget billet d'avion + hébergement + per diem sur la durée. Cumulable avec FEAC du Ministère.",
    status: "active",
  },
  {
    title: "Aide à l'édition — Région Guadeloupe",
    organization: "Région Guadeloupe",
    description:
      "Soutient l'émergence d'auteurs guadeloupéens ou la publication d'œuvres en lien avec la Guadeloupe. Dispositif porté par les éditeurs. Un des rares outils dédiés au livre sur le territoire.",
    eligibility:
      "Éditeurs (en Guadeloupe ou en métropole) portant un projet de publication d'un auteur guadeloupéen OU d'une œuvre d'intérêt pour la Guadeloupe. Contrat d'édition, maquette, plan de diffusion.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Campagne annuelle 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.regionguadeloupe.fr/les-aides-les-services/guide-des-aides/",
    grantType: ["Subvention", "Aide à l'édition"],
    eligibleSectors: ["Littérature", "Édition"],
    geographicZone: ["Guadeloupe", "Francophonie", "Caraïbes"],
    structureSize: ["TPE", "PME", "Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    status: "active",
  },

  // ========== MARTINIQUE ==========
  {
    title: "Aide au spectacle vivant — CTM Martinique",
    organization: "Collectivité Territoriale de Martinique (CTM)",
    description:
      "Dispositif principal de la CTM pour soutenir le spectacle vivant martiniquais. Procédure rigoureuse avec comité consultatif d'experts indépendants. Couvre toutes les disciplines SV : théâtre, danse, musique, cirque, arts de la rue.",
    eligibility:
      "Compagnies et structures de spectacle vivant basées en Martinique. Licence entrepreneur ou équivalent. Projet de création ou de diffusion avec calendrier détaillé et plan de financement.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Campagne annuelle 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.collectivitedemartinique.mq/faire-vivre-la-culture/",
    grantType: ["Subvention", "Aide à la création", "Aide à la diffusion"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant"],
    geographicZone: ["Martinique"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Dépôt sur le portail subventions.collectivitedemartinique.mq. Comité d'experts indépendants — insister sur la dimension artistique et professionnelle. Budget 2026 culturel en hausse.",
    status: "active",
  },
  {
    title: "Aide à la production audiovisuelle — CTM Martinique",
    organization: "Collectivité Territoriale de Martinique (CTM)",
    description:
      "La CTM a fait de la production audiovisuelle une priorité. Dispositif qui finance fiction, documentaire, animation, web-série créés par des productions martiniquaises ou avec tournage en Martinique.",
    eligibility:
      "Sociétés de production (Martinique ou métropole) portant un projet avec dimension martiniquaise : producteur local, tournage sur le territoire, sujet lié à la Martinique. Budget et plan de financement détaillés.",
    amount: null,
    amountMin: 10000,
    amountMax: 80000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.collectivitedemartinique.mq/faire-vivre-la-culture/",
    grantType: ["Subvention", "Aide à la production audiovisuelle"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire", "Fiction", "Animation"],
    geographicZone: ["Martinique"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Priorité donnée aux projets avec producteur exécutif local. Dépenses martiniquaises valorisées (techniciens, décors, post-prod). Cumul CNC + CTM possible.",
    status: "active",
  },

  // ========== GUYANE ==========
  {
    title: "Campagne subventions culturelles 2026 — CTG Guyane",
    organization: "Collectivité Territoriale de Guyane (CTG)",
    description:
      "Campagne annuelle de la CTG couvrant toutes les disciplines (spectacle vivant, arts visuels, musique, littérature, patrimoine, cinéma). Soutient la recherche, l'innovation et la création autour de l'identité guyanaise. Caravane des dispositifs culturels pour aller au-devant des porteurs de projets.",
    eligibility:
      "Associations, artistes, producteurs, collectivités, professionnels du livre et institutions publiques actives en Guyane. Projet avec ancrage guyanais (création, diffusion, médiation). Dossier complet avec budget et plan de financement.",
    amount: null,
    amountMin: 3000,
    amountMax: 25000,
    deadline: "15 mars 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.ctguyane.fr/campagne-de-subventions-culturelles-2026-caravane-des-dispositifs-culturels/",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Patrimoine", "Cinéma"],
    geographicZone: ["Guyane"],
    structureSize: ["Association", "TPE", "PME", "Collectivité"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Dépôt exclusif sur subventions.ctguyane.fr. La CTG valorise les projets qui explorent l'identité guyanaise (patrimoine amérindien, bushinengue, créole, créolité, Amazonie). Caravane 2026 tourne sur le territoire — participer aux rencontres pour clarifier les critères.",
    status: "active",
  },
  {
    title: "PEAP — Plan d'Éducation aux Arts et Patrimoines (Guyane)",
    organization: "Collectivité Territoriale de Guyane (CTG)",
    description:
      "Appel à projets éducation artistique et culturelle en milieu scolaire et périscolaire guyanais. Finance les interventions artistiques en classes, ateliers de pratique, parcours patrimoine. Dispositif-clé pour l'EAC en Guyane.",
    eligibility:
      "Artistes, structures artistiques, associations culturelles portant un projet EAC avec un établissement scolaire ou périscolaire guyanais. Partenariat formalisé, calendrier annuel scolaire, restitution publique.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "6 juillet 2026 (ouverture 16 avril 2026)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.ctguyane.fr/aides-culturelles/",
    grantType: ["Subvention", "Appel à projets", "Aide EAC"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Patrimoine", "EAC"],
    geographicZone: ["Guyane"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 55,
    status: "active",
  },

  // ========== LA RÉUNION ==========
  {
    title: "Aide au développement de carrière — Région Réunion (musique et SV)",
    organization: "Région Réunion",
    description:
      "Dispositif d'accompagnement de carrière pour artistes professionnels de la musique et du spectacle vivant réunionnais. Finance la professionnalisation : coaching, formation, enregistrement, tournée, promotion. Cible le passage du niveau régional au niveau national/international.",
    eligibility:
      "Artistes professionnels réunionnais (musique, spectacle vivant) avec trajectoire ascendante démontrée (sorties commerciales, diffusion, chiffres de streaming). Projet de développement cohérent à 12-24 mois.",
    amount: null,
    amountMin: 10000,
    amountMax: 50000,
    deadline: "Sessions annuelles",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://regionreunion.com/aides-services/article/musique-aide-aux-actions-et-programmes-de-professionnalisation",
    grantType: ["Subvention", "Aide au développement d'artiste"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Jazz", "Spectacle vivant"],
    geographicZone: ["La Réunion"],
    structureSize: ["TPE", "Association"],
    maxFundingRate: 60,
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Preuve de trajectoire ascendante indispensable : dates live, streams, presse, partenariats. Plan de carrière à 1-2 ans articulé (ex : sortie album + tournée métropole + showcases). Cumul avec CNM et Bureau Export fortement recommandé.",
    status: "active",
  },
  {
    title: "PART — Projets Artistiques à Rayonnement Territorial (Réunion)",
    organization: "DAC La Réunion",
    description:
      "Appel à projets EAC porté par la DAC Réunion pour l'éducation artistique et culturelle sur le territoire réunionnais. Projets annuels ou biennaux (une ou deux années scolaires consécutives, janvier 2026 - juillet 2027).",
    eligibility:
      "Structures artistiques et culturelles porteuses de projets EAC à La Réunion. Partenariats avec établissements scolaires, collectivités, lieux culturels. Ancrage territorial précis.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Consulter DAC Réunion",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/projets-artistiques-a-rayonnement-territorial-part-a-la-reunion",
    grantType: ["Appel à projets", "Subvention", "Aide EAC"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Patrimoine", "EAC"],
    geographicZone: ["La Réunion"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    status: "active",
  },
  {
    title: "Aide individuelle à la création (AIC) — DAC La Réunion",
    organization: "DAC La Réunion",
    description:
      "Déclinaison réunionnaise de l'AIC nationale : aide directe aux artistes-auteurs pour un projet de création personnel. Plafond 8 000 € par lauréat. Couvre frais de production, documentation et rémunération artistique.",
    eligibility:
      "Artistes-auteurs résidant à La Réunion, affiliés à la Maison des Artistes, Urssaf Artiste-Auteur ou équivalent. Parcours professionnel reconnu. Projet de création personnel.",
    amount: null,
    amountMin: 3000,
    amountMax: 8000,
    deadline: "28 février 2026, 23h59",
    frequency: "Annuel (ouverture 2 janvier)",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/aide-individuelle-a-la-creation-aic",
    contactEmail: "arnauld.martin@culture.gouv.fr",
    grantType: ["Subvention", "Aide individuelle"],
    eligibleSectors: ["Arts visuels", "Littérature", "Musique", "Photographie"],
    geographicZone: ["La Réunion"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Contact conseil arts visuels : Arnauld MARTIN. Ouverture 2 janvier 2026, clôture 28 février. Porter un projet personnel clair, pas un projet commandé.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 5 : ${WAVE.length} grants à insérer.\n`);

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
