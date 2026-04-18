/**
 * Vague 2 : fondations privées + ADAGP + CNAP + Fondation de France.
 *
 * Focus sur les dispositifs RÉELLEMENT candidatables (appels à projets
 * ouverts), pas les mécénats par cooptation (Cartier, Hermès, BNP Paribas,
 * Bettencourt — ces quatre fonctionnent sur invitation curatoriale, donc
 * un artiste ne peut pas y postuler).
 *
 * Usage: npx tsx scripts/seeds/wave2-fondations-et-adagp.ts
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== FONDATION LOUIS ROEDERER — PHOTO ==========
  {
    title: "Prix Découverte Fondation Louis Roederer — Rencontres d'Arles",
    organization: "Fondation Louis Roederer",
    description:
      "Prix de photographie doté de 20 000 € (15 000 € jury + 5 000 € prix du public) récompensant 7 projets photographiques présentés aux Rencontres d'Arles. Un des prix photo les plus visibles en France — exposition de 3 mois à Arles (6 juillet au 4 octobre 2026), diffusion presse internationale garantie.",
    eligibility:
      "Artistes émergents dans le champ de la photographie, toutes nationalités. Candidatures passant par des organismes supports (communautés, lieux indépendants, espaces d'artistes, galeries, institutions, fondations) qui présentent les artistes qu'ils soutiennent. Projet inédit ou peu exposé.",
    amount: 20000,
    deadline: "1er décembre 2025 (pour édition 2026)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.rencontres-arles.com/fr/prix-decouverte-appel-a-candidatures/",
    grantType: ["Prix", "Subvention"],
    eligibleSectors: ["Photographie", "Arts visuels"],
    geographicZone: ["National", "International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 2,
    annualBeneficiaries: 7,
    preparationAdvice:
      "Depuis 2021 la candidature passe par une structure prescriptrice (pas directe). Solliciter en amont un lieu qui a exposé votre travail. 300+ candidatures pour 7 places — rareté extrême. Impact média gigantesque pour les 7 sélectionnés.",
    status: "active",
  },

  // ========== FONDATION CARASSO — ART CITOYEN ==========
  {
    title: "Art Citoyen — Médiations et démocratie culturelle 2026",
    organization: "Fondation Daniel et Nina Carasso",
    description:
      "Appel à projets soutenant les initiatives artistiques et culturelles portées par un écosystème d'acteurs (associations, artistes, travailleurs sociaux, éducateurs, élus) avec pour objectif de lancer des initiatives citoyennes à fort potentiel de transformation en milieu rural. 4e édition. Financement pluriannuel.",
    eligibility:
      "Structures françaises (associations, coopératives culturelles, collectifs) portant un projet ancré en territoire rural. Projet co-construit avec les habitants. Partenariats locaux démontrés. Première étape : lettre d'intention.",
    amount: null,
    amountMin: 20000,
    amountMax: 80000,
    deadline: "27 février 2026 (lettre d'intention)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationcarasso.org/appels-a-projets/nos-appels-a-projets/",
    grantType: ["Subvention", "Financement pluriannuel"],
    eligibleSectors: ["Médiation culturelle", "Art citoyen", "Spectacle vivant", "Arts visuels", "Rural"],
    geographicZone: ["National", "Milieu rural"],
    structureSize: ["Association", "TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Webinaire d'info le 21 janvier (12h-13h) fortement recommandé. La Fondation Carasso est très exigeante sur la co-construction avec les habitants — pas juste « on amène de l'art aux ruraux ». Projets portés par des ECOSYSTÈMES d'acteurs, pas par un artiste seul. Financement sur 2-3 ans possible.",
    status: "active",
  },
  {
    title: "Résidences vertes — Fondation Carasso",
    organization: "Fondation Daniel et Nina Carasso",
    description:
      "Programme qui finance des résidences d'artistes conçues selon une démarche écoresponsable : réduction de l'empreinte carbone, circuits courts, écoconception, ancrage territorial. Cible la création artistique à l'aune des enjeux environnementaux.",
    eligibility:
      "Structures culturelles (centres d'art, friches, festivals, associations) porteuses d'un programme de résidence écoresponsable. Au moins 1 résidence artiste accueillie dans l'année. Démarche environnementale formalisée (charte, bilan, plan d'action).",
    amount: null,
    amountMin: 10000,
    amountMax: 40000,
    deadline: "Consulter fondationcarasso.org",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationcarasso.org/art-citoyen/residences-vertes-2025-2026-un-nouvel-elan-pour-la-creation-artistique-ecoresponsable/",
    grantType: ["Subvention", "Aide à la résidence"],
    eligibleSectors: ["Résidence", "Arts visuels", "Spectacle vivant", "Écologie", "Éco-création"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 25,
    preparationAdvice:
      "La démarche écoresponsable doit être démontrable : bilan carbone, procédures, choix des matériaux. Pas du greenwashing — la Fondation fait auditer. Projet cohérent avec le territoire, privilégiant les artistes accessibles en train/vélo.",
    status: "active",
  },

  // ========== ARTAGON — ÉMERGENCE ==========
  {
    title: "Fonds de production artistique Enowe-Artagon",
    organization: "Artagon",
    description:
      "Fonds de production pour artistes émergents plaçant les enjeux écologiques au cœur de leur démarche. 6 projets soutenus par an avec 5 000 € de production + mentorat professionnel et artistique sur un an minimum. Ouvert aux artistes, auteurs, créateurs, collectifs et compagnies en début de carrière, toutes disciplines.",
    eligibility:
      "Artistes, auteurs, créateurs, collectifs, compagnies en début de carrière (moins de 5 ans d'activité professionnelle). Projet artistique avec dimension écologique centrale. Toutes disciplines : arts visuels, spectacle vivant, littérature, design, musique, arts numériques. Résidence en France (métropole ou Outre-mer).",
    amount: 5000,
    deadline: "12 avril 2026",
    frequency: "Annuel (ouverture 6 mars 2026)",
    isRecurring: true,
    url: "https://www.artagon.org/actions/fonds-de-production-artistique-enowe-artagon-2026/",
    grantType: ["Subvention", "Mentorat", "Aide à la production"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Littérature", "Design", "Musique", "Arts numériques", "Écologie"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 8,
    annualBeneficiaries: 6,
    preparationAdvice:
      "Pluridisciplinarité accueillie — ne pas s'autocensurer. Le jury valorise le RAPPORT écologique (démarche, questionnement, matériau), pas juste le thème « nature ». Mentorat de qualité — vrai accélérateur de carrière. Préselection en avril, commission en mai, annonce en juin.",
    status: "active",
  },
  {
    title: "Résidence Artagon Marseille",
    organization: "Artagon",
    description:
      "Programme de résidence de 22 mois pour 30 artistes/créateurs émergents à Marseille (3e promotion : janvier 2026 - octobre 2027). Atelier ou bureau partagé, accompagnement professionnel, programmation publique, réseau. Un des plus gros programmes d'émergence artistique en France.",
    eligibility:
      "Artistes, auteurs, créateurs, collectifs en début de carrière (moins de 5 ans de pratique professionnelle). Toutes disciplines. Engagement à être présent à Marseille pendant la durée de la résidence. Pas de critère d'âge ni de nationalité.",
    amount: null,
    amountMin: 0,
    amountMax: 5000,
    deadline: "Appel à candidatures clos pour promo 3 (2026-2027)",
    frequency: "Tous les 22 mois",
    isRecurring: true,
    url: "https://www.artagon.org/lieux/artagon-marseille/",
    grantType: ["Résidence", "Accompagnement professionnel"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Littérature", "Design", "Musique", "Arts numériques", "Émergence", "Résidence"],
    geographicZone: ["Provence-Alpes-Côte d'Azur", "National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 30,
    preparationAdvice:
      "Pas d'aide financière directe significative, mais valeur énorme : atelier gratuit sur 22 mois, visibilité, réseau, expo collective. Compatible cumul avec autres aides production. Marseille est l'un des écosystèmes émergence les plus actifs en France.",
    status: "active",
  },
  {
    title: "Résidence Artagon Pantin",
    organization: "Artagon",
    description:
      "Programme de résidence à Pantin (Grand Paris) pour artistes émergents. Sélection des résidents en avril 2026, résultats communiqués en mai 2026. Atelier + accompagnement. Écosystème lié à Paris intra-muros (proximité galeries, institutions).",
    eligibility:
      "Artistes émergents, toutes disciplines, en début de carrière. Capacité à être présent.e régulièrement à Pantin. Pas de critère d'âge ni de nationalité.",
    amount: null,
    amountMin: 0,
    amountMax: 5000,
    deadline: "Avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.artagon.org/lieux/artagon-pantin/",
    grantType: ["Résidence", "Accompagnement"],
    eligibleSectors: ["Arts visuels", "Émergence", "Résidence"],
    geographicZone: ["Île-de-France"],
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    preparationAdvice:
      "Très demandé, concentration galeries/institutions dans le Grand Paris. Porter un projet qui bénéficie du réseau parisien (collaborations, visites d'atelier).",
    status: "active",
  },

  // ========== FONDATION DES ARTISTES ==========
  {
    title: "Aide à la production d'œuvres d'art — Fondation des Artistes",
    organization: "Fondation des Artistes",
    description:
      "Aide directe aux plasticiens travaillant en France pour financer la phase de préparation et de recherche d'un projet ambitieux et innovant (résidence, production amont, recherche matérielle). 500 000 € / an distribués. Intervient au PREMIER stade du projet — pas en post-production ni en diffusion.",
    eligibility:
      "Plasticiens travaillant en France ou ayant un projet de longue durée en France. Aucun critère d'âge, de nationalité ou de pratique. Projet en phase de préparation ou de recherche. Pas de financement des frais de post-production ni de diffusion/exposition.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Mars 2026 (dépôt des dossiers)",
    frequency: "1 commission par an au printemps",
    isRecurring: true,
    url: "https://www.fondationdesartistes.fr/missions/aider-a-la-production-doeuvres-dart/",
    grantType: ["Subvention", "Aide à la production", "Aide à la recherche"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Sculpture", "Installation", "Photographie"],
    geographicZone: ["National"],
    maxFundingRate: 80,
    applicationDifficulty: "difficile",
    acceptanceRate: 20,
    annualBeneficiaries: 25,
    preparationAdvice:
      "Dispositif RARE : aide à l'amont du projet (recherche, résidence prépa), alors que 90% des aides sont en production ou diffusion. Idéal pour projets ambitieux qui ont besoin de « temps de chauffe ». Commission composée de la directrice, 2 représentants Ministère Culture, 4 personnalités qualifiées.",
    status: "active",
  },

  // ========== CNAP — ADDITIONS ==========
  {
    title: "Soutien à un projet artistique — CNAP",
    organization: "CNAP — Centre National des Arts Plastiques",
    description:
      "Aide individuelle aux artistes-auteurs pour soutenir un projet artistique en cours. 3 tranches fixes : 5 000 €, 10 000 € ou 15 000 €. Couvre 14 disciplines : arts décoratifs, création sonore, design, design graphique, dessin, gravure, film, installation, nouveaux médias, peinture, performance, photographie, sculpture, vidéo.",
    eligibility:
      "Artistes-auteurs (ou collectifs d'artistes individuels) dont le travail est reconnu via expositions individuelles en galerie, lieu d'art contemporain, ou publications. Études terminées depuis au moins 5 ans (à décembre 2021 pour édition 2026). Nationalité française ou résidence permanente en France.",
    amount: null,
    amountMin: 5000,
    amountMax: 15000,
    deadline: "27 janvier 2026, 13h",
    frequency: "Annuel (ouverture novembre)",
    isRecurring: true,
    url: "https://www.cnap.fr/soutien-creation/projets-artistes/modalites-de-candidature",
    grantType: ["Subvention", "Aide individuelle"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Design", "Photographie", "Vidéo", "Installation", "Performance", "Sculpture"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 60,
    preparationAdvice:
      "5 visuels légendés .jpg obligatoires. La commission de mai 2026 étudie les dossiers déposés entre le 25/11/2025 et le 27/01/2026. Cohérence DOSSIER + PROJET essentielle — montrer que le parcours mène logiquement au projet soumis. Dispositif très demandé, mais avec un taux d'acceptation relativement haut (~20%).",
    status: "active",
  },

  // ========== ADAGP — BOURSES ==========
  {
    title: "Bourse Collection Monographie — ADAGP",
    organization: "ADAGP — Société des auteurs dans les arts graphiques et plastiques",
    description:
      "Dispositif qui finance la publication d'une monographie ou d'un catalogue raisonné consacré à un artiste. 10 bourses de 15 000 € par an. Instrument-clé pour institutionnaliser le travail d'un artiste de mi-carrière via un ouvrage de référence.",
    eligibility:
      "Éditeurs ou artistes porteurs d'un projet d'ouvrage monographique ou catalogue raisonné. Contrat d'édition ou engagement éditorial formalisé. Maquette avancée. Plan de diffusion réaliste.",
    amount: 15000,
    deadline: "30 avril 2026, 14h",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adagp.fr/fr/soutien-la-creation-artistique/aides-directes-aux-artistes/les-bourses/bourse-collection-monographie",
    grantType: ["Bourse", "Aide à l'édition"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Édition d'art"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Partenariat éditeur-artiste obligatoire. Soigner la maquette (10-20 pages types), le CV de l'auteur du texte critique, et le plan de diffusion (librairies, foires, expos). La monographie doit s'articuler à un moment stratégique de la carrière (rétro-prospective, sortie expo majeure).",
    status: "active",
  },
  {
    title: "Bourse Création vidéo — ADAGP",
    organization: "ADAGP — Société des auteurs dans les arts graphiques et plastiques",
    description:
      "Bourse destinée aux artistes en milieu de carrière qui travaillent l'image en mouvement (vidéo d'artiste, installation vidéo, films expérimentaux). 3e édition 2026. Soutient la production d'une nouvelle œuvre vidéo ambitieuse.",
    eligibility:
      "Artistes en milieu de carrière (au moins 10 ans de pratique professionnelle). Membres ADAGP prioritaires mais non-membres éligibles. Projet de création vidéo avec budget détaillé et calendrier de production. Au moins 2 expositions institutionnelles précédentes.",
    amount: null,
    amountMin: 10000,
    amountMax: 25000,
    deadline: "23 avril 2026, 14h",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adagp.fr/fr/actualites/appel-candidature-bourse-creation-video-2026",
    grantType: ["Bourse", "Aide à la création"],
    eligibleSectors: ["Arts visuels", "Vidéo d'artiste", "Film expérimental", "Installation vidéo"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 3,
    preparationAdvice:
      "Ciblé mi-carrière — les artistes émergents doivent viser d'autres aides. Fournir portfolio vidéo (liens Vimeo privés), traitement détaillé, budget production, fiche technique. Les projets avec diffuseur/institution déjà engagé(e) passent mieux.",
    status: "active",
  },
  {
    title: "Bourse Fanzine — ADAGP",
    organization: "ADAGP — Société des auteurs dans les arts graphiques et plastiques",
    description:
      "Aide à la micro-édition : 1 000 € pour 20 artistes ou collectifs par an pour des projets de fanzine, petite revue, auto-édition. Dispositif accessible qui valorise la culture DIY et les formes d'édition marginale.",
    eligibility:
      "Artistes individuels ou collectifs. Projet de fanzine, revue indépendante, micro-édition. Maquette avancée ou publication récente. Ouvert aux arts visuels, illustration, dessin, bande dessinée.",
    amount: 1000,
    deadline: "Consulter adagp.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adagp.fr/fr/soutien-la-creation-artistique/aides-directes-aux-artistes/bourses",
    grantType: ["Bourse", "Aide à l'édition"],
    eligibleSectors: ["Arts visuels", "Illustration", "Dessin", "Bande dessinée", "Micro-édition"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 25,
    annualBeneficiaries: 20,
    preparationAdvice:
      "Dispositif accessible — 1K € mais volume décent (20 lauréats). Parfait pour tester un premier projet d'édition indépendante. Maquette soignée prime sur CV.",
    status: "active",
  },

  // ========== FONDATION DE FRANCE ==========
  {
    title: "Cultivons l'art en milieu rural — Fondation de France",
    organization: "Fondation de France",
    description:
      "Appel à projets pour développer les capacités artistiques des territoires ruraux via des permanences artistiques. Cible 5 départements pilotes en 2026 : Loire, Rhône, Haute-Savoie, Côte d'Or, Saône-et-Loire. Soutient environ 10 projets par an avec une ambition d'ancrage territorial long.",
    eligibility:
      "Artistes ou structures artistiques démontrant un rapport réel, documenté et sensible avec un territoire rural des 5 départements cibles (Loire, Rhône, Haute-Savoie, Côte d'Or, Saône-et-Loire, classés catégories 4-5-6-7 INSEE 2025). Projet d'implantation artistique sur plusieurs années.",
    amount: null,
    amountMin: 15000,
    amountMax: 80000,
    deadline: "14 avril 2026 (lettre d'intention) — 5 juin 2026 (dossier complet)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationdefrance.org/fr/appels-a-projets/cultivons-l-art-en-milieu-rural-vers-des-permanences-artistiques-de-territoires",
    grantType: ["Subvention", "Financement pluriannuel", "Aide à l'ancrage territorial"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Médiation culturelle", "Rural", "Résidence"],
    geographicZone: ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté"],
    structureSize: ["Association", "TPE", "PME", "SCIC"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Géographie restrictive : 5 départements. Le MOT CLÉ est « permanence » — pas une résidence ponctuelle, mais un ancrage de 3+ ans. Démontrer le rapport au territoire : habiter, travailler, enseigner, avoir co-construit avec des acteurs locaux. Lettre d'intention courte (3-4 pages) — ne pas sur-écrire.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 2 : ${WAVE.length} grants à insérer.\n`);

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
