/**
 * Vague 29 : fonds cinéma/audiovisuel régions Bretagne, Nouvelle-Aquitaine,
 * Grand Est.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== BRETAGNE — FACCA ==========
  {
    title: "FACCA — Écriture et développement cinéma/audiovisuel (Bretagne)",
    organization: "Région Bretagne × CNC",
    description:
      "Volet AMONT du Fonds d'Aide à la Création Cinématographique et Audiovisuelle (FACCA) de la Région Bretagne. Finance l'écriture et le développement de projets fiction, documentaire, animation pour le cinéma ou la TV. Jusqu'à 20 000 € pour le développement d'un long-métrage ou d'un projet audiovisuel de fiction/animation > 52 min.",
    eligibility:
      "Auteurs, réalisateurs, scénaristes basés en Bretagne OU projets à tournage breton significatif. Œuvres fiction, documentaire, animation. Phase d'écriture ou développement (pas encore en production).",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "10 avril, 3 juillet, 9 octobre 2026",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.bretagne.bzh/aides/fiches/cinema-audiovisuel-facca-ecriture-et-developpement/",
    grantType: ["Subvention", "Aide à l'écriture", "Aide au développement"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Documentaire", "Animation", "Écriture"],
    geographicZone: ["Bretagne"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Films en Bretagne (réseau pro) accompagne le montage. La Bretagne valorise les histoires bretonnes (langue, territoire, mythes) mais accueille aussi toutes productions. Écriture = entrée sans agrément CNC nécessaire.",
    status: "active",
  },
  {
    title: "FACCA — Production court métrage (Bretagne)",
    organization: "Région Bretagne × CNC",
    description:
      "Soutien production court métrage du FACCA Bretagne. Jusqu'à 40 000 € avec bonus pour création musicale originale. Dispositif-clé pour les primo-réalisateurs (le CM est souvent le premier pas avant le long).",
    eligibility:
      "Sociétés de production avec projet de court-métrage fiction, documentaire ou animation. Tournage significatif en Bretagne. Conventionnement CNC apprécié.",
    amount: null,
    amountMin: 10000,
    amountMax: 40000,
    deadline: "10 avril, 3 juillet, 9 octobre 2026",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.bretagne.bzh/aides/fiches/cinema-facca-production-court-metrage/",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Court-métrage", "Fiction", "Documentaire", "Animation"],
    geographicZone: ["Bretagne"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Bonus si composition musicale originale (à détailler dans le dossier). Cumul avec CNC court-métrage + aide Films en Bretagne. Bretagne = tremplin fréquent pour primo-réalisateurs.",
    status: "active",
  },
  {
    title: "FACCA — Documentaire (Bretagne)",
    organization: "Région Bretagne × CNC",
    description:
      "Volet documentaire du FACCA Bretagne. Soutient les documentaires de création pour le cinéma et l'audiovisuel. La Bretagne a une tradition forte du documentaire (Jean-Marie Barbe, Pays de la Loire voisine, etc.).",
    eligibility:
      "Producteurs documentaires avec projet breton (tournage ou sujet). Documentaire unitaire ou série. Diffuseur engagé pour projets TV. Dossier avec traitement détaillé + budget.",
    amount: null,
    amountMin: 10000,
    amountMax: 60000,
    deadline: "10 avril, 3 juillet, 9 octobre 2026",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.bretagne.bzh/aides/fiches/cinema-facca-documentaire/",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire"],
    geographicZone: ["Bretagne"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    status: "active",
  },
  {
    title: "FACCA — Fonds audiovisuel de Bretagne",
    organization: "Région Bretagne × CNC",
    description:
      "Volet AUDIOVISUEL du FACCA Bretagne. Soutient fictions TV, séries, documentaires TV (unitaire ou série), magazines culturels. Jusqu'à 300 000 € pour les long-métrages et séries audiovisuelles.",
    eligibility:
      "Sociétés de production audiovisuelle conventionnées. Projet TV avec diffuseur engagé (préachat). Dépenses bretonnes significatives (tournage, post-prod).",
    amount: null,
    amountMin: 30000,
    amountMax: 300000,
    deadline: "10 avril, 3 juillet, 9 octobre 2026",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.bretagne.bzh/aides/fiches/cinema-facca-fonds-audiovisuel-de-bretagne/",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Audiovisuel", "Série", "Téléfilm", "Documentaire TV"],
    geographicZone: ["Bretagne"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Budget 300K max = niveau structurant. Pour les séries, les dépenses bretonnes doivent représenter une part significative. Breizh Films et autres partenaires bretons accompagnent.",
    status: "active",
  },

  // ========== NOUVELLE-AQUITAINE — ALCA ==========
  {
    title: "Aide au concept 2026 — ALCA Nouvelle-Aquitaine",
    organization: "ALCA Nouvelle-Aquitaine × Région Nouvelle-Aquitaine",
    description:
      "Aide AMONT d'ALCA (Agence Livre Cinéma Audiovisuel Nouvelle-Aquitaine) : soutien au concept, en phase très amont du projet audiovisuel ou cinéma. Permet aux auteurs/producteurs de consolider une idée en intention artistique argumentée avant de passer au développement. Dispositif rare dédié à cette phase.",
    eligibility:
      "Auteurs, scénaristes, réalisateurs, producteurs avec projet cinéma ou audiovisuel en phase de concept (idée originale, pas encore structurée). Sans obligation de tournage en Nouvelle-Aquitaine à ce stade (mais projet avec perspective régionale bien vu).",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "Consulter alca-nouvelle-aquitaine.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://alca-nouvelle-aquitaine.fr/fr/actualites/cinema-et-audiovisuel-aide-au-concept-2026",
    grantType: ["Subvention", "Aide au concept"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Documentaire", "Animation", "Écriture"],
    geographicZone: ["Nouvelle-Aquitaine"],
    applicationDifficulty: "facile",
    acceptanceRate: 40,
    preparationAdvice:
      "Dossier court : pitch 1 page + note d'intention 2-3 pages + CV. Pas besoin de traitement détaillé. Dispositif SUBTIL — parfait pour tester une idée. Enchaîner sur Aide au développement ALCA après l'aide au concept.",
    status: "active",
  },
  {
    title: "Aide au développement — ALCA Nouvelle-Aquitaine",
    organization: "ALCA Nouvelle-Aquitaine × Région Nouvelle-Aquitaine",
    description:
      "Aide au développement de projets cinéma et audiovisuel par ALCA Nouvelle-Aquitaine. Finance scénarios détaillés, traitements, recherches documentaires, maquettes, repérages. Entre « aide au concept » (amont) et « aide à la production » (aval).",
    eligibility:
      "Sociétés de production avec projet cinéma ou audiovisuel en phase de développement. Préférence Nouvelle-Aquitaine ou projet avec tournage prévu en région. Dossier avec scénario version V1 ou V2, plan de financement, calendrier.",
    amount: null,
    amountMin: 8000,
    amountMax: 40000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://alca-nouvelle-aquitaine.fr/fr/cinema-audiovisuel/fonds-de-soutien-au-cinema-et-l-audiovisuel/l-aide-au-developpement",
    grantType: ["Subvention", "Aide au développement"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Documentaire", "Animation"],
    geographicZone: ["Nouvelle-Aquitaine"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "ALCA est un des partenaires régionaux les plus actifs en France. Dépenses prévisionnelles N-Aquitaine à anticiper dès cette étape. Bordeaux, La Rochelle, Angoulême = pôles production.",
    status: "active",
  },
  {
    title: "Aide à la production — ALCA Nouvelle-Aquitaine",
    organization: "ALCA Nouvelle-Aquitaine × Région Nouvelle-Aquitaine",
    description:
      "Aide à la production cinéma et audiovisuel par ALCA. Soutient les différentes phases : préparation, tournage, fabrication, post-prod. Dépenses N-Aquitaine obligatoires à hauteur de 120% (doc) à 160% (animation/fiction) du montant de l'aide.",
    eligibility:
      "Sociétés de production pour longs métrages, courts métrages, œuvres audiovisuelles. Diffusion publique en conditions professionnelles prévue. Contrainte de dépenses régionales forte.",
    amount: null,
    amountMin: 20000,
    amountMax: 300000,
    deadline: "7 septembre 2026 (session automne) ; 21 sept 2026 (audiovisuel fiction)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://alca-nouvelle-aquitaine.fr/fr/cinema-audiovisuel/fonds-de-soutien-au-cinema-et-l-audiovisuel/l-aide-la-production",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Documentaire", "Animation"],
    geographicZone: ["Nouvelle-Aquitaine"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 35,
    preparationAdvice:
      "Ratio dépenses régionales STRICT : 120% doc, 160% animation/fiction. Prévoir techniciens, prestataires, hébergement locaux dès le montage. Angoulême animation = écosystème dense.",
    status: "active",
  },

  // ========== GRAND EST ==========
  {
    title: "Fonds de soutien cinéma / audiovisuel / nouveaux médias — Grand Est",
    organization: "Région Grand Est × CNC",
    description:
      "Fonds de soutien Grand Est pour l'écriture, le développement et la production de cinéma, audiovisuel, nouveaux médias et animation. Géré avec un comité consultatif de professionnels. 2 appels à projets par an. Dispositif actif jusqu'au 31/12/2026 (à renouveler ensuite).",
    eligibility:
      "Auteurs, scénaristes, sociétés de production. Projet en phase d'écriture, développement OU production. Tournage et/ou post-prod en Grand Est valorisés. Conventionnement CNC pour la production.",
    amount: null,
    amountMin: 5000,
    amountMax: 40000,
    deadline: "15 mars 2026 et 30 juin 2026",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.grandest.fr/",
    contactEmail: "cinema.audiovisuel@grandest.fr",
    grantType: ["Subvention", "Aide à l'écriture", "Aide au développement", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Animation", "Nouveaux médias", "Fiction", "Documentaire"],
    geographicZone: ["Grand Est"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Grand Est bénéficie de proximité Luxembourg/Allemagne/Belgique = coproductions européennes facilitées. Image-Est (réseau pro) accompagne. Courts-métrages entre 20-40K€ de production.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 29 : ${WAVE.length} grants à insérer.\n`);

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
