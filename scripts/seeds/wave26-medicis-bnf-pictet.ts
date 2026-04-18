/**
 * Vague 26 : Ateliers Médicis + BnF recherche + Prix Pictet photo.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== ATELIERS MÉDICIS ==========
  {
    title: "Transat — Ateliers Médicis (résidences d'été)",
    organization: "Ateliers Médicis",
    description:
      "Programme Transat : résidences d'artistes d'été (8 semaines entre juin et septembre) dans des structures sociales et médico-sociales (centres sociaux, centres de détention, structures d'hébergement, précarité). 7e édition en 2026. Cible l'art dans les territoires périphériques et auprès de publics éloignés.",
    eligibility:
      "Artistes de toutes disciplines (spectacle vivant, arts visuels, littérature, musique, numérique). Projet de résidence avec une structure d'accueil sociale/médico-sociale identifiée. Capacité à travailler avec des publics précaires ou fragiles.",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "6 au 20 janvier 2026 (édition 7)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.ateliersmedicis.fr/article/appel-candidatures-transat-residences-d-artistes-en-ete-edition-7-2026-32826",
    grantType: ["Résidence", "Bourse", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Arts numériques", "Médiation", "Résidence"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Annonce résultats fin mars 2026, résidence 8 semaines entre juin et septembre. Partenariat structure sociale OBLIGATOIRE (à identifier en amont). Les Ateliers Médicis accompagnent artiste + structure pendant toute la résidence. Impact fort pour trajectoire en milieu social.",
    status: "active",
  },
  {
    title: "Bourse Médicis — Ateliers Médicis (écriture et arts visuels)",
    organization: "Ateliers Médicis",
    description:
      "Nouveau dispositif Ateliers Médicis : Bourse Médicis pour soutenir la création locale en écriture et arts visuels par des artistes ou professionnels habitant à Clichy-sous-Bois ou Montfermeil. Dispositif d'ancrage territorial fort.",
    eligibility:
      "Artistes émergents OU professionnels de la culture résidant À Clichy-sous-Bois ou À Montfermeil (Seine-Saint-Denis). Disciplines : écriture littéraire, arts visuels. Justificatifs de domicile dans les 2 communes.",
    amount: null,
    amountMin: 2000,
    amountMax: 8000,
    deadline: "Consulter ateliersmedicis.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.ateliersmedicis.fr/article/les-appels-candidatures-8594",
    grantType: ["Bourse", "Aide à la création"],
    eligibleSectors: ["Littérature", "Écriture", "Arts visuels", "Émergence"],
    geographicZone: ["Île-de-France", "Seine-Saint-Denis"],
    applicationDifficulty: "facile",
    acceptanceRate: 40,
    preparationAdvice:
      "Critère RÉSIDENCE 93 strict (seulement Clichy ou Montfermeil). Bourse locale = sélectivité modérée pour un dispositif ciblé. Intéressant pour un artiste émergent qui s'installe dans ces communes.",
    status: "active",
  },
  {
    title: "CLEA — Création artistique et jeunesse (Ateliers Médicis × DRAC IdF)",
    organization: "Ateliers Médicis × DRAC Île-de-France",
    description:
      "Contrat Local d'Éducation Artistique (CLEA) Clichy-sous-Bois / Montfermeil porté par les Ateliers Médicis avec la DRAC. Résidences-missions EAC combinant création artistique personnelle et interventions auprès de la jeunesse (écoles, collèges, structures jeunesse). Durée 6-12 mois.",
    eligibility:
      "Artistes en milieu de carrière portant un projet combinant création personnelle + EAC. Engagement à être présent régulièrement sur le territoire (Clichy/Montfermeil) pendant 6-12 mois. Expérience avec la jeunesse valorisée.",
    amount: null,
    amountMin: 8000,
    amountMax: 25000,
    deadline: "Consulter culture.gouv.fr DRAC IdF",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/fr/regions/drac-ile-de-france/appels-a-projets/appels-a-projets-action-territoriale-education-artistique-et-culturelle/Appel-a-candidatures-CLEA-creation-artistique-et-jeunesse-Clichy-sous-Bois-Montfermeil-Ateliers-Medicis",
    grantType: ["Résidence-mission", "Subvention", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "EAC", "Résidence"],
    geographicZone: ["Île-de-France", "Seine-Saint-Denis"],
    applicationDifficulty: "difficile",
    acceptanceRate: 20,
    annualBeneficiaries: 2,
    preparationAdvice:
      "Résidence-mission LONGUE (6-12 mois) = choix de vie. Articulation fine création perso / EAC demandée. L'impact sur la trajectoire d'un artiste est fort : les Ateliers Médicis ont un rayonnement national.",
    status: "active",
  },

  // ========== BNF ==========
  {
    title: "Appel à chercheurs et chercheuses 2026-2027 — BnF",
    organization: "BnF — Bibliothèque nationale de France",
    description:
      "Appel annuel de la BnF qui associe des chercheurs pour valoriser ses collections. 10 bourses de recherche sur des domaines spécifiques (littérature, histoire du livre, musique, estampes, manuscrits, cartes, audiovisuel). Durée 1 an, non renouvelable.",
    eligibility:
      "Candidats à partir du niveau Master 1, pour projet cadré Master 2 ou doctorat. Projet de recherche utilisant substantiellement les collections BnF. Dossier scientifique avec directeur de recherche.",
    amount: null,
    amountMin: 3000,
    amountMax: 8000,
    deadline: "Consulter bnf.fr (appel automne annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bnf.fr/fr/actualites/appel-chercheurs-et-chercheuses-2026-2027",
    grantType: ["Bourse", "Aide à la recherche"],
    eligibleSectors: ["Littérature", "Histoire du livre", "Musique", "Patrimoine", "Recherche"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Pour chercheurs universitaires + artistes-auteurs avec approche recherche. Avantage : accès privilégié aux collections BnF + espace de travail. Certaines bourses co-financées avec Cité internationale de la BD (Angoulême) pour la BD/illustration.",
    status: "active",
  },

  // ========== PRIX PICTET ==========
  {
    title: "Prix Pictet — Photographie et durabilité (nomination)",
    organization: "Pictet Group",
    description:
      "Prix mondial de photographie sur la durabilité (« global award for photography and sustainability »), fondé 2008 par le Pictet Group. 100 000 CHF (~105 000 €). Nomination UNIQUEMENT par le réseau international de 350+ nominateurs (critiques, curateurs, spécialistes photo). Thème change chaque cycle.",
    eligibility:
      "Photographes professionnels de toutes nationalités. Œuvre importante en lien avec la durabilité (environnement, société, économie). SÉLECTION PAR NOMINATION — pas de candidature directe. Les nominateurs soumettent les artistes.",
    amount: 105000,
    deadline: "Nomination par nominateurs (pas de candidature directe)",
    frequency: "Biennal",
    isRecurring: true,
    url: "https://prix.pictet.com/",
    grantType: ["Prix", "Reconnaissance internationale"],
    eligibleSectors: ["Photographie", "Photographie documentaire", "Photographie environnementale", "Durabilité"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "PAS DE CANDIDATURE DIRECTE. Pour être nommé : construire une œuvre reconnue sur les enjeux de durabilité (environnement, déplacements, ressources, inégalités), exposer en institutions internationales, publier avec des éditeurs photo majeurs. Le prix est le plus doté au monde en photo + expos tournantes prestigieuses.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 26 : ${WAVE.length} grants à insérer.\n`);

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
