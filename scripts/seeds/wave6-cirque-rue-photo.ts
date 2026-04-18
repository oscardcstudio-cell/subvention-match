/**
 * Vague 6 : cirque + arts de la rue + photographie (secteurs sous-couverts).
 *
 * Coverage matrix pré-audit :
 * - Cirque : 33 grants (5%)
 * - Photo : 32 grants (5%)
 * - Arts de la rue : intégré dans cirque (~5%)
 *
 * Cette vague ajoute les dispositifs-phares nationaux.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== CIRQUE + ARTS DE LA RUE ==========
  {
    title: "Aide nationale à la création 2026 — Arts de la rue et du cirque (DGCA/ARTCENA)",
    organization: "ARTCENA / DGCA — Ministère de la Culture",
    description:
      "Principale aide nationale pour la création en arts de la rue et arts du cirque. Attribuée par la Direction générale de la création artistique (DGCA) via ARTCENA. Soutient l'émergence de nouvelles écritures et les projets de production ambitieux, renforce les moyens des compagnies indépendantes. Dispositif de référence du secteur.",
    eligibility:
      "Compagnies d'arts de la rue ou d'arts du cirque ayant produit et diffusé au moins 2 spectacles. Une seule candidature par équipe par an. Pas de cumul avec une aide l'année précédente, quel que soit le projet. Pour arts de la rue : non cumulable avec « Écrire pour la rue » sur le même projet la même année.",
    amount: null,
    amountMin: 15000,
    amountMax: 80000,
    deadline: "30 janvier 2026, 23h59",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.artcena.fr/fil-vie-pro/aide-nationale-a-la-creation-2026-pour-les-arts-de-la-rue-et-du-cirque",
    grantType: ["Subvention", "Aide à la création", "Appel à projets"],
    eligibleSectors: ["Cirque", "Arts de la rue", "Arts de la piste", "Espace public"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    acceptanceRate: 25,
    annualBeneficiaries: 40,
    preparationAdvice:
      "Avoir diffusé 2 spectacles antérieurs obligatoire. Résultats annoncés fin avril 2026. Dossier doit articuler l'écriture artistique et le projet de production (co-producteurs, calendrier, lieux de création). La commission valorise les démarches qui renouvellent les formes.",
    status: "active",
  },
  {
    title: "Hors Cadre — Fonds mutualisé CNAREP (arts de la rue)",
    organization: "Association des CNAREP",
    description:
      "Fonds mutualisé de production créé en 2021 par l'Association des Centres Nationaux des Arts de la Rue et de l'Espace Public (A-CNAREP), co-financé par le Ministère de la Culture. Soutient les projets ambitieux, les écritures innovantes et les nouvelles esthétiques pour l'espace public. Coup de pouce unique pour la création en arts de la rue émergente.",
    eligibility:
      "Artistes, compagnies et collectifs portant un projet pour l'espace public avec démarche artistique innovante. Note d'intention ou esquisse (3 pages maximum). Présentation du porteur de projet.",
    amount: null,
    amountMin: 10000,
    amountMax: 35000,
    deadline: "27 janvier 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.artcena.fr/fil-vie-pro/appel-a-candidatures-hors-cadre-2026",
    grantType: ["Subvention", "Fonds de production", "Appel à projets"],
    eligibleSectors: ["Arts de la rue", "Espace public", "Spectacle vivant", "Écriture"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Note d'intention concise (3 pages). Le fonds privilégie les projets qui ne rentrent pas dans les cases habituelles — innovation de formes, interdisciplinarité, rapport au public. Sélection + rencontre en octobre 2026. Cofinancement avec 13 CNAREP du réseau.",
    status: "active",
  },
  {
    title: "Écrire pour la rue — SACD + DGCA",
    organization: "SACD & DGCA — Ministère de la Culture",
    description:
      "Dispositif conjoint SACD/DGCA pour soutenir les écritures originales destinées à l'espace public. Double aide : bourse d'écriture à l'auteur (2 000 €, payée par SACD) + aide à la résidence d'écriture à la structure d'accueil (payée par DGCA). Une des rares aides dédiées à l'ÉCRITURE pour la rue, en amont de la production.",
    eligibility:
      "Auteurs des arts de la rue OU d'autres disciplines souhaitant investir l'espace public. Projet en phase amont (pas encore en production). Binôme auteur + structure d'accueil pour la résidence d'écriture. Projet avec démarche originale pour l'espace public et relation aux publics.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "26 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.artcena.fr/annuaire/aide/ecrire-pour-la-rue",
    grantType: ["Bourse d'écriture", "Aide à la résidence", "Appel à projets"],
    eligibleSectors: ["Arts de la rue", "Écriture", "Espace public", "Théâtre"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    preparationAdvice:
      "Dispositif méconnu mais précieux pour les auteurs en amont de production. La structure d'accueil doit être engagée (convention, accueil matériel, mise en relation avec collaborateurs). Non cumulable avec Aide nationale à la création sur le même projet la même année.",
    status: "active",
  },

  // ========== PHOTO — PRIX & BOURSES ==========
  {
    title: "Bourse Photographe — Fondation Jean-Luc Lagardère",
    organization: "Fondation Jean-Luc Lagardère",
    description:
      "Bourse attribuée à un jeune photographe professionnel pour entreprendre une production documentaire en France ou à l'étranger, dans le champ social, économique, politique ou culturel. Permet de dégager du temps et de l'argent pour un projet ambitieux à moyen terme. L'une des bourses photo pros les plus visibles.",
    eligibility:
      "Photographes professionnels de 35 ans maximum, avec un début de parcours professionnel démontré. Projet original et ambitieux rédigé en français. Documentaire photographique cohérent, avec sujet, méthodologie et plan de travail.",
    amount: 30000,
    deadline: "14 juin 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.lagardere.com/fondation/bourses/photographe/",
    grantType: ["Bourse", "Aide à la création"],
    eligibleSectors: ["Photographie", "Photographie documentaire", "Photojournalisme"],
    geographicZone: ["National", "International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Réservé aux moins de 35 ans — ne pas manquer la fenêtre. Dossier solide : portfolio (15-25 images), CV, note d'intention du projet ambitieux, plan de travail sur 12 mois. Le jury valorise la maturité du regard + la singularité du sujet. Nombreuses candidatures, rareté extrême.",
    status: "active",
  },
  {
    title: "Prix Niépce",
    organization: "Gens d'Images",
    description:
      "Premier prix photographique professionnel créé en France (1955). Récompense chaque année le travail d'un photographe confirmé, français ou résidant en France depuis plus de 3 ans, âgé de 50 ans maximum. Reconnaissance institutionnelle majeure. Dotation + expositions.",
    eligibility:
      "Photographes confirmés français OU résidant en France depuis plus de 3 ans. 50 ans maximum. Body of work conséquent — le prix récompense une trajectoire, pas un unique projet. Dossier présenté par un prescripteur (institution, galerie) de préférence.",
    amount: null,
    amountMin: 8000,
    amountMax: 15000,
    deadline: "Consulter gensdimages.com",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://gensdimages.com/prix-niepce/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Photographie", "Arts visuels"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 2,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Prix de mi-carrière (pas émergents). Une candidature directe est possible mais les lauréats sont généralement proposés par des prescripteurs (directeurs de structures, galeristes). Accumulation de publications, expos, acquisitions est déterminante. Plus que de l'argent, c'est une validation symbolique majeure.",
    status: "active",
  },
  {
    title: "Prix HSBC pour la photographie",
    organization: "HSBC France",
    description:
      "Prix créé par HSBC France récompensant 2 photographes professionnels contemporains encore peu connus, sans critère d'âge ou de nationalité, travaillant sur la représentation du réel et n'ayant pas encore publié de monographie. Dotation + monographie éditée + exposition dans le réseau HSBC.",
    eligibility:
      "Photographes professionnels contemporains vivants, sans critère d'âge ou de nationalité. Travail sur la représentation du réel (documentaire, paysage, portrait, social). N'ayant PAS encore publié de monographie. Projet photographique en cours ou récent.",
    amount: null,
    amountMin: 10000,
    amountMax: 15000,
    deadline: "Consulter Picto Foundation",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.pictofoundation.fr/tag/prix-hsbc-pour-la-photographie/",
    grantType: ["Prix", "Édition monographique"],
    eligibleSectors: ["Photographie", "Photographie documentaire"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 2,
    annualBeneficiaries: 2,
    preparationAdvice:
      "Le critère « pas de monographie publiée » est crucial — vérifier attentivement. La valeur principale du prix est la monographie éditée — souvent la première de la carrière. Image de sortie majeure : ne pas candidater avec un body of work trop dispersé. Cohérence thématique importante.",
    status: "active",
  },
  {
    title: "Grande commande photographique — BnF / Ministère Culture",
    organization: "BnF — Bibliothèque nationale de France",
    description:
      "Commande publique de photographie pilotée par la BnF pour le Ministère de la Culture. Plus grande commande publique photographique d'Europe (budget de 5,46M€). Contrat de 22 000 € par photographe sélectionné pour produire un corpus inédit. Après sélection par portfolio, production + exposition collective à la BnF + entrée dans les collections nationales.",
    eligibility:
      "Photographes et photojournalistes professionnels. Portfolio et proposition de projet à soumettre. Les commandes successives ont des thèmes cadrés (ex : société française, photojournalisme). Consulter l'appel en cours pour l'édition 2026.",
    amount: 22000,
    deadline: "Appel à candidatures — consulter culture.gouv.fr",
    frequency: "Commandes successives (pas régulier)",
    isRecurring: false,
    url: "https://commande-photojournalisme.culture.gouv.fr/fr/appel-candidatures",
    grantType: ["Commande publique", "Subvention", "Aide à la production"],
    eligibleSectors: ["Photographie", "Photojournalisme", "Documentaire"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 100,
    preparationAdvice:
      "Forme atypique : commande, pas subvention classique. Le photographe est contractuellement engagé à produire un corpus inédit. Entrée dans les collections BnF = reconnaissance institutionnelle durable. Exposition BnF garantie pour tous les lauréats (impact presse fort).",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 6 : ${WAVE.length} grants à insérer.\n`);

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
