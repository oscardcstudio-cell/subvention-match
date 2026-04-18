/**
 * Vague 3 : dispositifs régionaux pour les régions sous-couvertes.
 *
 * L'audit coverage-matrix a montré :
 * - Hauts-de-France : 0 grants régionaux (!)
 * - Normandie : 1 grant
 * - Centre-Val de Loire : 0 grants
 * - Bourgogne-Franche-Comté : 1 grant
 * - Pays de la Loire : <10 grants
 * - Bretagne : 20 grants mais peu diversifiés
 *
 * Cette vague ajoute les dispositifs-phares de chaque région, pour les 3
 * grands secteurs transverses : arts visuels, spectacle vivant, littérature.
 *
 * Usage: npx tsx scripts/seeds/wave3-regions-vides.ts
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== HAUTS-DE-FRANCE ==========
  {
    title: "Projets à Rayonnement Artistique et Culturel (PRAC) — Hauts-de-France",
    organization: "Région Hauts-de-France",
    description:
      "Dispositif de soutien aux projets culturels structurants à fort rayonnement régional ou national, dans toutes les disciplines. Finance festivals, créations d'envergure, projets pluriannuels. Pivot central des aides projet de la Région.",
    eligibility:
      "Structures culturelles (associations, SCIC, SAS, EPCC) implantées en Hauts-de-France, avec une existence d'au moins 2 ans. Projet à rayonnement démontré (partenariats hors région, diffusion, mobilisation de publics).",
    amount: null,
    amountMin: 10000,
    amountMax: 100000,
    deadline: "Sessions annuelles (consulter guide des aides)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://guide-aides.hautsdefrance.fr/dispositif777",
    grantType: ["Subvention", "Aide au projet"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Théâtre", "Danse", "Arts visuels", "Cinéma", "Littérature", "Patrimoine"],
    geographicZone: ["Hauts-de-France"],
    structureSize: ["Association", "TPE", "PME", "EPCC"],
    applicationDifficulty: "difficile",
    acceptanceRate: 35,
    preparationAdvice:
      "Démontrer le RAYONNEMENT : partenaires institutionnels hors région, diffusion en festivals nationaux, mobilisation de publics au-delà du territoire. Budget consolidé avec cofinancement DRAC + collectivités locales.",
    status: "active",
  },
  {
    title: "PACI3.0 — Programme d'Actions Culturelles Investissement",
    organization: "Région Hauts-de-France",
    description:
      "Programme d'investissement culturel de la Région : finance les travaux, équipements, réaménagement de lieux culturels, achat de matériel scénique, véhicules, systèmes de diffusion. Complémentaire des aides au fonctionnement.",
    eligibility:
      "Collectivités territoriales, EPCI, EPCC, associations culturelles structurantes en Hauts-de-France. Projet d'investissement (pas de fonctionnement). Plan de financement avec autres partenaires.",
    amount: null,
    amountMin: 20000,
    amountMax: 500000,
    deadline: "23 avril 2026 (projets 2e semestre 2026)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://guide-aides.hautsdefrance.fr/dispositif788",
    grantType: ["Subvention d'investissement"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Arts visuels", "Patrimoine", "Cinéma"],
    geographicZone: ["Hauts-de-France"],
    structureSize: ["Association", "PME", "Collectivité", "EPCC"],
    maxFundingRate: 40,
    coFundingRequired: "Oui",
    applicationDifficulty: "difficile",
    preparationAdvice:
      "Dossier d'investissement : devis détaillés, plan de masse, calendrier travaux. Obligation de visibilité Région sur le lieu. Dépôt entre 20/01/2026 et 23/04/2026 pour les projets du 2e semestre.",
    status: "active",
  },
  {
    title: "Plaines d'été en Hauts-de-France",
    organization: "DRAC Hauts-de-France",
    description:
      "Appel à projets pour la programmation artistique et culturelle estivale dans des lieux de vacances (centres de loisirs, centres sociaux, bases de loisirs, quartiers populaires). Finance les interventions artistiques dans des contextes non-culturels traditionnels. Toutes disciplines.",
    eligibility:
      "Artistes et équipes artistiques basés en France avec un ancrage régulier en Hauts-de-France. Projet mené entre juin et septembre 2026. Partenariat avec un lieu d'accueil non-culturel (centre de loisirs, centre social, etc.).",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "26 avril 2026, 23h59",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/plaines-d-ete-en-hauts-de-france",
    grantType: ["Appel à projets", "Subvention"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Arts visuels", "Littérature", "Médiation culturelle"],
    geographicZone: ["Hauts-de-France"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Le partenaire d'accueil est clé : centre social, MJC, base de loisirs. Démontrer que l'intervention touche un public éloigné du culturel. Budget incluant les défraiements des intervenants.",
    status: "active",
  },

  // ========== NORMANDIE ==========
  {
    title: "Territoires ruraux, territoires de culture — DRAC Normandie",
    organization: "DRAC Normandie",
    description:
      "Appel à projets annuel qui soutient les résidences artistiques en territoire rural normand visant la participation active des habitants à une démarche de création et d'action culturelle. Dispositif d'ancrage artistique en ruralité.",
    eligibility:
      "Artistes et structures artistiques portant un projet de résidence en Normandie rurale. Projet impliquant concrètement les habitants (ateliers, créations partagées, restitution). Durée minimale 1 mois sur place.",
    amount: null,
    amountMin: 10000,
    amountMax: 30000,
    deadline: "4 mai 2026, 23h59",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/appels-a-projets-candidatures/territoires-ruraux-territoires-de-culture-en-normandie",
    grantType: ["Appel à projets", "Aide à la résidence"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Rural", "Résidence"],
    geographicZone: ["Normandie"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "L'implication des habitants n'est pas décorative — la DRAC demande des modalités précises (ateliers, chantiers participatifs, captations). Travailler main dans la main avec une collectivité ou association locale.",
    status: "active",
  },
  {
    title: "Aide individuelle à la création (AIC) — DRAC Normandie",
    organization: "DRAC Normandie",
    description:
      "Aide directe aux artistes-auteurs pour un projet de création personnel (arts visuels, écriture, musique, etc.). Dispositif DRAC national décliné en Normandie. Finance une période dédiée à la création.",
    eligibility:
      "Artistes-auteurs résidant en Normandie, affiliés à la Maison des artistes, URSSAF Artiste-Auteur ou équivalent. Parcours professionnel reconnu (expositions, éditions, concerts, créations). Projet de création personnel étayé.",
    amount: null,
    amountMin: 3000,
    amountMax: 12000,
    deadline: "28 février 2026, 23h59",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/aide-individuelle-a-la-creation-aic",
    grantType: ["Subvention", "Aide individuelle"],
    eligibleSectors: ["Arts visuels", "Littérature", "Musique", "Photographie", "Vidéo"],
    geographicZone: ["Normandie"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    annualBeneficiaries: 30,
    preparationAdvice:
      "Ouverture du dépôt le 2 janvier 2026, clôture 28 février. Commission en mai. Porter un projet personnel bien distinct du travail commandé. La DRAC valorise la cohérence parcours-projet.",
    status: "active",
  },
  {
    title: "Aide aux compagnies spectacle vivant — Normandie",
    organization: "Région Normandie",
    description:
      "Aide aux compagnies professionnelles de théâtre, danse, cirque, marionnette, arts de la rue et ensembles musicaux basées en Normandie. Soutient la création et la diffusion des œuvres. Dispositif annuel.",
    eligibility:
      "Compagnies professionnelles (licence entrepreneur spectacles cat. 2) basées en Normandie. Au moins 1 création diffusée précédemment. Projet artistique avec budget détaillé et calendrier.",
    amount: null,
    amountMin: 10000,
    amountMax: 40000,
    deadline: "Dépôts à partir du 8 octobre 2025 (pour 2026)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.normandie.fr/aide-aux-compagnies-de-theatre-danse-cirque-marionnette-arts-de-la-rue-et-ensembles-musicaux",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Marionnette", "Arts de la rue", "Musique"],
    geographicZone: ["Normandie"],
    structureSize: ["Association", "TPE"],
    maxFundingRate: 50,
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Démontrer la structuration : licence, contrats récents, plan de diffusion. Aide cumulable avec DRAC. La Région Normandie est l'une des plus actives en spectacle vivant par habitant.",
    status: "active",
  },
  {
    title: "Aide résidences et projets recherche arts plastiques — Normandie",
    organization: "Région Normandie",
    description:
      "Dispositif qui finance les résidences d'artistes et les projets de recherche en arts plastiques. Vise à créer des liens durables entre artistes et populations, favorise la présence artistique dans les territoires peu pourvus.",
    eligibility:
      "Artistes ET associations dont la résidence principale ou le siège social est en Normandie. Projet de résidence ou de recherche avec volet public (restitution, médiation). Partenariats locaux.",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Consulter normandie.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.normandie.fr/aide-aux-residences-et-aux-projets-de-recherche-arts-plastiques",
    grantType: ["Subvention", "Aide à la résidence", "Aide à la recherche"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Photographie", "Résidence"],
    geographicZone: ["Normandie"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    status: "active",
  },

  // ========== CENTRE-VAL DE LOIRE ==========
  {
    title: "PACT-Coopération — Projets Artistiques et Culturels de Territoire",
    organization: "Région Centre-Val de Loire",
    description:
      "Dispositif qui finance les projets culturels fondés sur la coopération entre acteurs (collectivités, associations, compagnies, lieux). Pivot de la politique « territoires de culture » de la Région. Soutient la structuration de projets pluriannuels.",
    eligibility:
      "Structures culturelles et collectivités en Centre-Val de Loire portant un projet coopératif multi-partenaires. Convention pluriannuelle possible. Budget consolidé avec partenaires.",
    amount: null,
    amountMin: 15000,
    amountMax: 100000,
    deadline: "Consulter le portail aides région",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.centre-valdeloire.fr/le-guide-des-aides-de-la-region-centre-val-de-loire/soutien-aux-projets-artistiques-et-culturels-de",
    grantType: ["Subvention", "Aide pluriannuelle"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Arts visuels", "Littérature", "Patrimoine"],
    geographicZone: ["Centre-Val de Loire"],
    structureSize: ["Association", "Collectivité", "EPCC"],
    applicationDifficulty: "difficile",
    preparationAdvice:
      "Le mot-clé est COOPÉRATION — montrer au moins 3 partenaires engagés dès le montage du projet. La Région valorise la logique « bassin de vie », pas les projets mono-acteur.",
    status: "active",
  },
  {
    title: "Soutien à la production d'œuvres en arts visuels — Centre-Val de Loire",
    organization: "Région Centre-Val de Loire",
    description:
      "Aide individuelle à la production d'œuvres en arts visuels pour artistes plasticiens professionnels. Couvre les matériaux, location d'espace de production, sous-traitance technique. Dispositif clé pour les artistes visuels de la région.",
    eligibility:
      "Artistes plasticiens professionnels résidant en Centre-Val de Loire. Parcours artistique démontré. Projet de production avec budget détaillé.",
    amount: null,
    amountMin: 3000,
    amountMax: 12000,
    deadline: "17 mai 2026 (dépôt du 6 avril au 17 mai 2026)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.centre-valdeloire.fr/le-guide-des-aides-de-la-region-centre-val-de-loire/soutien-la-production-doeuvres-dans-les-arts",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Photographie", "Sculpture", "Installation"],
    geographicZone: ["Centre-Val de Loire"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    status: "active",
  },
  {
    title: "Soutien création et production artistique — Centre-Val de Loire",
    organization: "Région Centre-Val de Loire",
    description:
      "Dispositif qui soutient la création et la production artistiques (toutes disciplines spectacle vivant) pour les équipes artistiques de la région. Fait aussi office d'aide à la reprise pour les spectacles interrompus. Encourage l'innovation et la diversité.",
    eligibility:
      "Équipes artistiques (compagnies, ensembles) professionnelles basées en Centre-Val de Loire. Licence entrepreneur. Projet de création avec engagement de diffusion.",
    amount: null,
    amountMin: 10000,
    amountMax: 50000,
    deadline: "Consulter le portail aides région",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.centre-valdeloire.fr/le-guide-des-aides-de-la-region-centre-val-de-loire/soutien-creation-production-artistiques",
    grantType: ["Subvention", "Aide à la création", "Aide à la production"],
    eligibleSectors: ["Spectacle vivant", "Théâtre", "Danse", "Cirque", "Musique"],
    geographicZone: ["Centre-Val de Loire"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    status: "active",
  },

  // ========== BOURGOGNE-FRANCHE-COMTÉ ==========
  {
    title: "Aide à la création en arts visuels — Bourgogne-Franche-Comté",
    organization: "Région Bourgogne-Franche-Comté",
    description:
      "Aide annuelle aux artistes plasticiens professionnels de la région pour soutenir la recherche et la création artistique. Plafond 4 000 €. Évalué dans le cadre de l'enveloppe annuelle dédiée.",
    eligibility:
      "Artistes plasticiens professionnels justifiant d'un statut reconnu (Maison des Artistes, Urssaf AA), d'une expérience significative et d'une diffusion régulière de leur travail. Résidant et déclarant leur activité en Bourgogne-Franche-Comté depuis au moins 1 an.",
    amount: 4000,
    deadline: "20 mai 2026 (dépôts du 20 avril au 20 mai)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bourgognefranchecomte.fr/node/3438",
    grantType: ["Subvention", "Aide individuelle"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Photographie"],
    geographicZone: ["Bourgogne-Franche-Comté"],
    applicationDifficulty: "facile",
    acceptanceRate: 50,
    preparationAdvice:
      "Plafond bas (4K€) mais dispositif très accessible. Candidatures ouvertes 1 mois seulement (20/04-20/05). Dossier simple — portfolio + CV + note de projet 2-3 pages.",
    status: "active",
  },
  {
    title: "Aide à la production des compagnies — Bourgogne-Franche-Comté",
    organization: "Région Bourgogne-Franche-Comté",
    description:
      "Aide aux compagnies professionnelles de spectacle vivant pour la production de spectacles. Plafond régional : 20 000 €. Soutient la création dans les disciplines théâtre, danse, cirque, musiques actuelles, musiques classiques.",
    eligibility:
      "Compagnies professionnelles basées en Bourgogne-Franche-Comté. Licence entrepreneur. Au moins 1 création diffusée. Projet de création avec calendrier et diffusion prévus.",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Consulter bourgognefranchecomte.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bourgognefranchecomte.fr/node/276",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant"],
    geographicZone: ["Bourgogne-Franche-Comté"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    status: "active",
  },
  {
    title: "Aide à l'émergence des compagnies — Bourgogne-Franche-Comté",
    organization: "Région Bourgogne-Franche-Comté",
    description:
      "Dispositif dédié aux compagnies émergentes pour favoriser leur insertion dans les réseaux professionnels régionaux et nationaux. Soutient la professionnalisation et la structuration des jeunes compagnies.",
    eligibility:
      "Compagnies émergentes (moins de 5 ans d'activité) basées en Bourgogne-Franche-Comté. Première ou deuxième création professionnelle. Objectif de structuration démontré (accompagnement, formation, diffusion).",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "Consulter bourgognefranchecomte.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bourgognefranchecomte.fr/node/261",
    grantType: ["Subvention", "Aide émergence"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant"],
    geographicZone: ["Bourgogne-Franche-Comté"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "facile",
    acceptanceRate: 55,
    preparationAdvice:
      "Porte d'entrée idéale pour les primo-compagnies. La commission valorise le potentiel plus que le CV. Articuler le projet à un plan de professionnalisation (accompagnement par un lieu, mentorat, formation).",
    status: "active",
  },
  {
    title: "Aide au parcours de résidence — Bourgogne-Franche-Comté",
    organization: "Région Bourgogne-Franche-Comté",
    description:
      "Aide aux parcours de résidences en spectacle vivant. Minimum 10 jours ouvrables dans un ou plusieurs lieux en Bourgogne-Franche-Comté ET/OU Centre-Val de Loire (dispositif inter-régional). Intégration dans le réseau régional.",
    eligibility:
      "Compagnies professionnelles basées en Bourgogne-Franche-Comté. Parcours de résidence conventionné avec au moins 1 lieu partenaire. Durée minimale 10 jours ouvrables.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Consulter bourgognefranchecomte.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bourgognefranchecomte.fr/node/282",
    grantType: ["Subvention", "Aide à la résidence"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant", "Résidence"],
    geographicZone: ["Bourgogne-Franche-Comté", "Centre-Val de Loire"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    status: "active",
  },

  // ========== PAYS DE LA LOIRE ==========
  {
    title: "Aide à la création spectacle vivant — Pays de la Loire",
    organization: "Région Pays de la Loire",
    description:
      "Aide aux équipes artistiques professionnelles pour la création de spectacles dans toutes les disciplines du spectacle vivant. Soutient jeunes créations et renouvellement artistique. Forfait plafonné à 30% du budget total.",
    eligibility:
      "Équipes artistiques basées en Pays de la Loire, licence entrepreneur spectacle cat. 2 ou récépissé de déclaration. Rémunération des artistes sur minimum 5 jours de répétition. Projet de création nouvelle.",
    amount: null,
    amountMin: 5000,
    amountMax: 40000,
    deadline: "Sessions annuelles",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.paysdelaloire.fr/les-aides/aide-la-creation-spectacle-vivant",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant", "Arts de la rue"],
    geographicZone: ["Pays de la Loire"],
    structureSize: ["Association", "TPE"],
    maxFundingRate: 30,
    coFundingRequired: "Oui - 70% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Versement en 2 tranches : 50% à la notification, solde sur présentation des bilans technique et financier. Prévoir la trésorerie.",
    status: "active",
  },
  {
    title: "Aide au fonctionnement équipes artistiques — Pays de la Loire",
    organization: "Région Pays de la Loire",
    description:
      "Soutien au fonctionnement des équipes artistiques ligériennes à rayonnement régional ou national qui mènent des activités de création, diffusion et action culturelle. Subvention annuelle pour les structures reconnues.",
    eligibility:
      "Équipes artistiques professionnelles basées en Pays de la Loire, avec reconnaissance régionale ou nationale démontrée (conventionnement, diffusion nationale). Activités croisées : création + diffusion + action culturelle.",
    amount: null,
    amountMin: 20000,
    amountMax: 150000,
    deadline: "Annuel",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.paysdelaloire.fr/les-aides/aide-au-fonctionnement-des-equipes-artistiques-du-spectacle-vivant",
    grantType: ["Subvention", "Aide au fonctionnement"],
    eligibleSectors: ["Spectacle vivant", "Théâtre", "Danse", "Cirque", "Musique"],
    geographicZone: ["Pays de la Loire"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    status: "active",
  },

  // ========== BRETAGNE ==========
  {
    title: "Aide à la résidence d'auteurs et autrices — Bretagne",
    organization: "Région Bretagne",
    description:
      "Soutient les résidences d'auteurs et autrices en Bretagne : minimum 1 mois, espace de travail et hébergement fournis. Finance jusqu'à 70% du coût total de la résidence, plafonné à 10 000 €. Un des rares dispositifs région dédiés à l'écrit.",
    eligibility:
      "Structures culturelles bretonnes (bibliothèques, médiathèques, maisons d'écrivain, associations) accueillant un auteur ou autrice en résidence. Durée minimale 1 mois sur le territoire. Restitution publique (rencontre, lecture, atelier).",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "3 sessions par an (pour projets à partir du 1er janvier 2026)",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.bretagne.bzh/aides/fiches/residence-auteur/",
    grantType: ["Subvention", "Aide à la résidence"],
    eligibleSectors: ["Littérature", "Édition", "Résidence", "Poésie", "Bande dessinée"],
    geographicZone: ["Bretagne"],
    structureSize: ["Association", "Bibliothèque", "Collectivité"],
    maxFundingRate: 70,
    coFundingRequired: "Oui - 30% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 60,
    preparationAdvice:
      "La structure bretonne est demandeuse, pas l'auteur. Contrat de résidence obligatoire. Prévoir un programme public étoffé (3-5 rencontres minimum). Cumul possible avec bourse CNL de l'auteur.",
    status: "active",
  },
  {
    title: "Aide à la création spectacle vivant — Bretagne (CREA)",
    organization: "Région Bretagne",
    description:
      "Aide aux équipes artistiques bretonnes pour la création de spectacles vivants, toutes disciplines (théâtre, danse, cirque, marionnette, arts de la rue, musiques actuelles/classiques). Pivot de la politique de soutien à la création bretonne.",
    eligibility:
      "Équipes artistiques professionnelles basées en Bretagne, licence entrepreneur spectacle. Création nouvelle avec calendrier et plan de diffusion. Cofinancement attendu.",
    amount: null,
    amountMin: 10000,
    amountMax: 40000,
    deadline: "Sessions annuelles",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.bretagne.bzh/aides/fiches/spectacle-vivant-equipes-artistiques-aide-a-la-creation/",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Marionnette", "Musique", "Spectacle vivant", "Arts de la rue"],
    geographicZone: ["Bretagne"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    status: "active",
  },
];

async function main() {
  console.log(`Wave 3 : ${WAVE.length} grants à insérer.\n`);

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
