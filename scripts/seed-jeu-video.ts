/**
 * Seed des subventions jeu vidéo françaises et européennes.
 *
 * Sources : sites officiels des régions, Pictanovo, CNC, Bpifrance, Creative
 * Europe (vérifiées avril 2026). Voir check-jeu-video.ts pour l'audit de ce
 * qui manquait avant ce seed.
 *
 * Avant insert on skippe les titres déjà présents (matching case-insensitive)
 * pour rendre le script idempotent — tu peux le relancer sans créer de
 * doublons si on re-tune les montants ou les descriptions plus tard.
 *
 * Usage: npx tsx scripts/seed-jeu-video.ts
 */

import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import type { InsertGrant } from "../shared/schema.js";
// (no drizzle-orm helpers needed — on filtre côté JS pour l'idempotence)

const VIDEO_GAME_GRANTS: InsertGrant[] = [
  // ========== FONDS RÉGIONAUX ==========
  {
    title: "Fonds d'aide à la création de jeu vidéo (FRIJV) — Île-de-France",
    organization: "Région Île-de-France",
    description:
      "Le FRIJV soutient la création de jeux vidéo originaux portés par des studios franciliens. Aide en subvention d'investissement (sans clause de remboursement depuis 2025) destinée au prototypage et à la production de jeux vidéo à fort potentiel artistique et commercial. L'Île-de-France est la première région française en nombre de studios — le FRIJV est le dispositif régional phare.",
    eligibility:
      "Studios de jeu vidéo constitués en société commerciale (TPE/PME), siège social en Île-de-France, indépendants et non contrôlés par des capitaux extra-européens. Projet de jeu vidéo original avec véritable ambition artistique. Cofinancement requis. Respect du plafond de minimis (300 000 € sur 3 exercices fiscaux glissants, règlement UE 2023/2831).",
    amount: null,
    amountMin: 6000,
    amountMax: 150000,
    deadline: "29 mai 2026",
    frequency: "2 sessions par an (printemps, automne)",
    isRecurring: true,
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets/fonds-daide-la-creation-de-jeu-video",
    grantType: ["Subvention d'investissement", "Aide à la création"],
    eligibleSectors: ["Jeu vidéo", "Arts numériques"],
    geographicZone: ["Île-de-France"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui",
    cumulativeAllowed:
      "Cumulable avec FAJV, crédit d'impôt jeu vidéo et Creative Europe MEDIA, dans la limite du plafond de minimis",
    processingTime: "3 à 4 mois après dépôt",
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    annualBeneficiaries: 20,
    preparationAdvice:
      "Un prototype jouable et un pitch deck soigné sont quasi obligatoires. Le jury évalue l'originalité du gameplay, la vision artistique et la solidité de l'équipe (profils seniors valorisés). Budget détaillé poste par poste avec devis réels. Montrer un plan de financement crédible : FRIJV + FAJV + crédit d'impôt + investisseur privé est un combo classique.",
    status: "active",
  },
  {
    title: "Fonds Jeu Vidéo — Pictanovo (Hauts-de-France)",
    organization: "Pictanovo",
    description:
      "Premier fonds régional dédié au jeu vidéo en France (pré-date même le FRIJV). Pictanovo soutient l'écosystème JV des Hauts-de-France avec deux volets : prototypage (aide à la conception de maquettes jouables) et production (développement complet jusqu'à la sortie). Couvre les dépenses de personnel, sous-traitance et prestations techniques.",
    eligibility:
      "Studios de jeu vidéo établis en Hauts-de-France ou s'engageant à y réaliser au moins 50% des dépenses éligibles. Société commerciale avec expérience dans le domaine. Projet avec ambition artistique ou technique, cible commerciale identifiée. Équipe identifiée et budget détaillé.",
    amount: null,
    amountMin: 10000,
    amountMax: 200000,
    deadline: "5 février 2026",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.pictanovo.com/financer-un-projet/jeu-video/",
    grantType: ["Subvention", "Aide au prototypage", "Aide à la production"],
    eligibleSectors: ["Jeu vidéo", "Arts numériques", "Expériences immersives"],
    geographicZone: ["Hauts-de-France"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui - 50% minimum",
    processingTime: "Décision environ 2 mois après dépôt",
    applicationDifficulty: "difficile",
    acceptanceRate: 35,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Prototype : jusqu'à 50K€ (exceptionnellement 100K€ sur projets à haut potentiel). Production : jusqu'à 200K€. Important : démontrer l'ancrage régional — dépenses locales, sous-traitance avec studios/prestataires Hauts-de-France, recrutement local. Pictanovo est très attaché au développement de la filière sur le territoire.",
    status: "active",
  },
  {
    title: "Fonds d'aide au jeu vidéo — Auvergne-Rhône-Alpes",
    organization: "Région Auvergne-Rhône-Alpes",
    description:
      "La Région AURA soutient la création de jeux vidéo via deux aides distinctes : aide au prototypage (maquette jouable) et aide à la production (développement complet). Enveloppe annuelle autour de 800K€. S'appuie sur l'écosystème local structuré par Game Only (pôle de référence régional).",
    eligibility:
      "Studios de développement de jeu vidéo en société commerciale, siège en Auvergne-Rhône-Alpes, indépendants et non contrôlés par des capitaux extra-européens. Projet avec ambition créative, équipe professionnelle identifiée, budget prévisionnel détaillé.",
    amount: null,
    amountMin: 10000,
    amountMax: 150000,
    deadline: "10 avril 2026",
    frequency:
      "6 sessions en 2026 : 10 avril, 8 mai, 3 juillet, 7 août, 4 septembre, 2 octobre",
    isRecurring: true,
    url: "https://www.auvergnerhonealpes.fr/aides/financer-le-prototype-ou-la-production-dun-jeu-video",
    grantType: ["Subvention", "Aide au prototypage", "Aide à la production"],
    eligibleSectors: ["Jeu vidéo", "Arts numériques"],
    geographicZone: ["Auvergne-Rhône-Alpes"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui - 50% du budget",
    processingTime: "2 à 3 mois",
    applicationDifficulty: "difficile",
    acceptanceRate: 40,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Prototype : jusqu'à 80K€ (50% du budget). Production : jusqu'à 150K€ (50%). Rythme de 6 commissions par an permet d'être stratégique sur la date de dépôt. Passer d'abord par Game Only pour sécuriser un retour préalable avant la candidature officielle — leur accompagnement est gratuit et précieux.",
    status: "active",
  },
  {
    title: "Aide à la production de jeux vidéo — Nouvelle-Aquitaine",
    organization: "Région Nouvelle-Aquitaine",
    description:
      "Aide en subvention destinée aux studios de jeu vidéo néo-aquitains pour financer la phase de production d'un jeu avec perspective de commercialisation. Couvre les dépenses opérationnelles et d'investissement liées à la fabrication du jeu (salaires, sous-traitance, moteur, outils, marketing). La Nouvelle-Aquitaine a soutenu des studios comme Bulwark Studios (Ixion, 100K€).",
    eligibility:
      "Entreprises de toute taille (auto-entrepreneurs, PME, grandes entreprises) détenant les droits sur le projet. Priorité aux studios de développement, éditeurs et distributeurs de jeu vidéo. Siège ou établissement en Nouvelle-Aquitaine. Contact obligatoire avec la Région avant dépôt du dossier.",
    amount: null,
    amountMin: 15000,
    amountMax: 150000,
    deadline: "Dépôt en continu (contact préalable obligatoire)",
    frequency: "Commissions régulières",
    isRecurring: true,
    url: "https://les-aides.nouvelle-aquitaine.fr/economie-et-emploi/production-de-jeux-video-0",
    contactPhone: "05 45 94 37 86",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Jeu vidéo", "Arts numériques", "Multimédia"],
    geographicZone: ["Nouvelle-Aquitaine"],
    structureSize: ["TPE", "PME", "ETI"],
    maxFundingRate: 50,
    coFundingRequired: "Oui",
    processingTime: "2 à 4 mois",
    applicationDifficulty: "difficile",
    acceptanceRate: 40,
    preparationAdvice:
      "Contact téléphonique obligatoire AVANT de déposer (05 45 94 37 86). La Région évalue les aspects artistiques ET la faisabilité économique — prévoir un business plan solide et un plan de distribution. Les projets à vocation culturelle ou éducative sont bien reçus.",
    status: "active",
  },
  {
    title: "Aide au prototypage de jeu vidéo — Occitanie",
    organization: "Région Occitanie",
    description:
      "Dispositif d'aide au prototypage destiné aux sociétés de production ou d'édition de jeu vidéo en Occitanie. Finance la phase amont — écriture, études techniques, réalisation d'une maquette jouable pouvant servir de support à la recherche de partenaires financiers. L'Occitanie est la 3e région de France en nombre de structures JV.",
    eligibility:
      "Sociétés de production ou d'édition de jeu vidéo établies en Occitanie. Projet de prototype avec intention artistique et potentiel commercial. Équipe identifiée. Contact recommandé avec l'équipe jeu vidéo de la Région avant dépôt.",
    amount: null,
    amountMin: 10000,
    amountMax: 80000,
    deadline: "Calendrier 2026 à confirmer",
    frequency: "2 à 3 commissions par an",
    isRecurring: true,
    url: "https://www.laregion.fr/Dispositif-d-aide-au-prototypage-de-jeu-video",
    contactEmail: "jeuvideo@laregion.fr",
    grantType: ["Subvention", "Aide au prototypage"],
    eligibleSectors: ["Jeu vidéo", "Arts numériques"],
    geographicZone: ["Occitanie"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui",
    processingTime: "2 à 3 mois",
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Ecrire à jeuvideo@laregion.fr pour sécuriser un entretien avant dépôt. L'Occitanie valorise les projets ancrés localement (recrutement, sous-traitance). Le prototype doit être jouable, pas juste un concept — prévoir au moins 6 mois de dev avant de le soumettre.",
    status: "active",
  },

  // ========== NATIONAL / BPIFRANCE ==========
  {
    title: "Accélérateur Jeux Vidéo — Bpifrance",
    organization: "Bpifrance",
    description:
      "Programme d'accompagnement intensif de 18 mois pour les studios de jeu vidéo en phase de croissance. Combine conseil stratégique (dirigeants), formations dédiées (business model, internationalisation, levée de fonds), mise en réseau (investisseurs, éditeurs, grands comptes) et communauté de pairs. Ce n'est pas une subvention cash mais un accompagnement à forte valeur pour structurer un studio qui veut passer à l'échelle.",
    eligibility:
      "Studios de jeu vidéo constitués en société, avec au moins un jeu sorti ou en production avancée, CA supérieur à 200K€ ou levée de fonds déjà réalisée. Équipe de direction engagée dans la démarche (au moins 2 dirigeants participants).",
    amount: null,
    amountMin: 8000,
    amountMax: 15000,
    deadline: "Appel à candidatures annuel",
    frequency: "1 promotion par an",
    isRecurring: true,
    url: "https://www.bpifrance.fr/nos-appels-a-projets-concours/candidatez-a-la-2e-promotion-de-laccelerateur-jeux-video",
    grantType: ["Programme d'accompagnement", "Formation"],
    eligibleSectors: ["Jeu vidéo"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui - contribution du studio à l'accélérateur",
    processingTime: "Sélection en 2 étapes : dossier puis entretien",
    applicationDifficulty: "difficile",
    acceptanceRate: 20,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Ce n'est PAS un financement cash — c'est un programme payant (reste à charge ~10K€) mais avec un ROI important pour qui veut structurer son studio. Présenter une trajectoire claire (où en est le studio, où il veut aller, pourquoi maintenant). Les 15 studios sélectionnés par promotion sont choisis pour leur potentiel de scale, pas pour aider à démarrer.",
    status: "active",
  },
  {
    title: "Aide au Développement Innovation (ADI) — Bpifrance",
    organization: "Bpifrance",
    description:
      "Subvention ou avance remboursable pour financer les projets de développement expérimental — notamment pour les studios qui développent des technologies propriétaires (moteur de jeu, outils internes, IA, VR/AR, tech graphique innovante). Couvre les dépenses de R&D amont qui ne rentrent pas dans les dispositifs JV classiques.",
    eligibility:
      "Entreprises françaises (tous secteurs, y compris jeu vidéo). Projet de R&D démontrant un caractère innovant et un risque technique. Budget R&D identifiable et distinct du développement commercial. Documentation technique détaillée.",
    amount: null,
    amountMin: 30000,
    amountMax: 500000,
    deadline: "Dépôt en continu",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.bpifrance.fr/catalogue-offres/financement-de-linnovation",
    grantType: ["Subvention", "Avance remboursable", "Aide à l'innovation"],
    eligibleSectors: ["Jeu vidéo", "Technologies", "R&D"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME", "ETI"],
    maxFundingRate: 65,
    coFundingRequired: "Oui - 35% à 75% selon taille et nature du projet",
    cumulativeAllowed:
      "Compatible avec CIR, CII. Non cumulable avec une autre aide à l'innovation sur les mêmes dépenses.",
    processingTime: "3 à 6 mois",
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Réservé aux projets avec une VRAIE dimension R&D — pas juste un jeu. Le moteur maison, un système d'IA original, une tech VR innovante : OK. Un jeu classique en Unity : non. Taux d'aide : 25% à 65% selon projet et taille. Passer par un consultant spécialisé (type AREAD, Sogedev) augmente fortement le taux de succès — ils connaissent la rédaction technique attendue.",
    status: "active",
  },

  // ========== EUROPÉEN ==========
  {
    title: "Video Games and Immersive Content Development — Creative Europe MEDIA",
    organization: "Creative Europe MEDIA (Commission européenne)",
    description:
      "Aide au développement de jeux vidéo et de contenus immersifs avec un fort potentiel narratif, créatif et commercial à l'échelle européenne et internationale. Finance la phase de développement (pré-production, prototypes jouables) de jeux à narration interactive ou à gameplay innovant destinés à PC, consoles, mobile, VR/AR. Budget total du call 2026 : 10M€.",
    eligibility:
      "Sociétés de production de jeux vidéo ou de contenus immersifs établies dans un pays éligible Creative Europe (UE-27 + quelques pays associés). Au moins 1 œuvre produite précédemment (œuvre avec exploitation commerciale démontrée). Projet avec dimension européenne et potentiel cross-border. Candidature possible en solo ou en consortium de 2+ partenaires.",
    amount: null,
    amountMin: 50000,
    amountMax: 200000,
    deadline: "11 février 2026",
    frequency: "Appel annuel",
    isRecurring: true,
    url: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/crea-media-2026-devvgim",
    grantType: ["Subvention européenne", "Aide au développement", "Lump sum"],
    eligibleSectors: ["Jeu vidéo", "Contenus immersifs", "VR/AR", "Narration interactive"],
    geographicZone: ["Europe", "International"],
    structureSize: ["TPE", "PME", "ETI"],
    maxFundingRate: 60,
    coFundingRequired: "Oui - 40% minimum",
    cumulativeAllowed:
      "Cumulable avec FAJV, FRIJV, fonds régionaux français dans la limite de 100% du budget et des règles de minimis",
    processingTime: "5 à 6 mois après dépôt (évaluation + décision)",
    applicationDifficulty: "difficile",
    acceptanceRate: 25,
    annualBeneficiaries: 50,
    preparationAdvice:
      "La dimension européenne est centrale : montrer la portée cross-border dès le pitch. Consortium de 2+ pays augmente les chances. Preuve de track-record obligatoire (jeu précédemment sorti avec chiffres). Anglais requis pour le dossier. Monter le dossier demande 2-3 mois de travail — s'y prendre tôt. Lump sum : l'aide est forfaitaire calée sur un budget prévisionnel, donc pas besoin de justifier des factures a posteriori comme pour d'autres aides UE.",
    status: "active",
  },
];

async function main() {
  console.log(`Seed jeu vidéo : ${VIDEO_GAME_GRANTS.length} grants à insérer.\n`);

  // Récupère TOUS les titres existants puis filtre côté JS (match
  // case-insensitive). On a ~600 grants, pas un souci de perf.
  const all = await db.select({ title: grants.title }).from(grants);
  const existingSet = new Set(all.map((g) => g.title.toLowerCase()));

  const toInsert = VIDEO_GAME_GRANTS.filter(
    (g) => !existingSet.has(g.title.toLowerCase()),
  );

  console.log(`- ${VIDEO_GAME_GRANTS.length - toInsert.length} déjà présents (skippés)`);
  console.log(`- ${toInsert.length} nouveaux à insérer\n`);

  if (toInsert.length === 0) {
    console.log("Rien à faire. ✓");
    process.exit(0);
  }

  const inserted = await db.insert(grants).values(toInsert).returning({
    id: grants.id,
    title: grants.title,
  });

  console.log(`✓ ${inserted.length} grants insérés :\n`);
  inserted.forEach((g) => console.log(`  · ${g.title}  (${g.id})`));

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
