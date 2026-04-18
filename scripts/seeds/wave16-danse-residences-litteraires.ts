/**
 * Vague 16 : danse compléments (CCN/CDCN) + résidences littéraires & dramaturgie.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== DANSE — CCN / CDCN ==========
  {
    title: "Accueil-Studio CCN — Centres Chorégraphiques Nationaux",
    organization: "Association des Centres Chorégraphiques Nationaux (ACCN)",
    description:
      "Dispositif commun aux 19 CCN de France (répartis sur 12 régions). L'accueil-studio permet aux chorégraphes et compagnies d'être accueillis en résidence avec des moyens de production dédiés (studio, équipement, accompagnement technique et administratif). Programme structurant national, financé par le Ministère de la Culture.",
    eligibility:
      "Chorégraphes et compagnies de danse professionnelles. Projet de recherche, création ou production nécessitant un studio équipé. Candidature via formulaire en ligne de l'ACCN ou directement auprès du CCN choisi.",
    amount: null,
    amountMin: 3000,
    amountMax: 25000,
    deadline: "Variable selon CCN",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://accn.fr/",
    grantType: ["Résidence", "Accueil-studio", "Co-production"],
    eligibleSectors: ["Danse", "Chorégraphie", "Spectacle vivant", "Résidence"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    acceptanceRate: 20,
    preparationAdvice:
      "Viser le CCN dont la ligne artistique correspond (chaque CCN a sa « couleur » : Tanztheater à Caen avec Chaignaud, performatif à Nantes avec Salia Sanou, etc.). Construire la candidature autour du PROJET ARTISTIQUE, pas juste « on a besoin d'un studio ». Cumul avec DRAC ADSV fréquent.",
    status: "active",
  },
  {
    title: "Accueil-Studio CDCN — Centres de Développement Chorégraphique Nationaux",
    organization: "Association des CDCN (A-CDCN)",
    description:
      "Programme équivalent CCN pour les 16 CDCN (Centres de Développement Chorégraphique Nationaux). Les CDCN ciblent plus spécifiquement le développement de la création et la rencontre avec les publics, souvent en territoire moins dense. Résidences avec accompagnement technique et administratif.",
    eligibility:
      "Chorégraphes et compagnies de danse professionnelles. Projet en phase de recherche, création ou diffusion. Candidature directe auprès du CDCN choisi OU via appels groupés de l'A-CDCN.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "Variable selon CDCN",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.a-cdcn.fr/",
    grantType: ["Résidence", "Accueil-studio"],
    eligibleSectors: ["Danse", "Chorégraphie", "Spectacle vivant", "Résidence"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    preparationAdvice:
      "Souvent plus accessibles que les CCN, CDCN accueillent davantage les compagnies émergentes. Rôle pédagogique (rencontre publics) valorisé — intégrer des ateliers ou interventions pendant la résidence.",
    status: "active",
  },
  {
    title: "La Danse en Grande Forme 2026-2027 — Collectif 11 CCN/CDCN",
    organization: "Collectif La Danse en Grande Forme (11 structures)",
    description:
      "Appel à projets collectif réunissant 11 structures chorégraphiques nationales (CNDC Angers, CCN Malandain Biarritz, CCN Caen Normandie, etc.) pour co-produire des projets de danse de grande forme (effectif important, grande ambition scénique). Apport de production minimum 77 000 € (7 000 € × 11 structures) + résidences dans les lieux membres.",
    eligibility:
      "Chorégraphes et compagnies portant un projet de DANSE EN GRANDE FORME : effectif important (8+ interprètes), ambition formelle (scénographie, dispositif), dimension structurante dans la trajectoire du chorégraphe. Budget conséquent.",
    amount: null,
    amountMin: 77000,
    amountMax: 150000,
    deadline: "Consulter a-cdcn.fr (appel 2026-2027 ouvert)",
    frequency: "Biennal",
    isRecurring: true,
    url: "https://www.a-cdcn.fr/storage/app/media/uploaded-files/Appel%20%C3%A0%20projets_La%20danse%20en%20grande%20forme_2026-2027.pdf",
    grantType: ["Co-production", "Subvention", "Appel à projets"],
    eligibleSectors: ["Danse", "Chorégraphie", "Spectacle vivant"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    preparationAdvice:
      "Pour les chorégraphes CONFIRMÉS (trajectoire de 10+ ans souvent). La « grande forme » est explicitement l'opposé du solo/duo — prévoir minimum 6 interprètes. Dossier avec budget de production 300K+ réaliste. Co-production unique en France à cette échelle.",
    status: "active",
  },

  // ========== RÉSIDENCES LITTÉRAIRES ==========
  {
    title: "Villa Marguerite Yourcenar — Résidences d'écriture (Nord)",
    organization: "Département du Nord × Villa Marguerite Yourcenar",
    description:
      "Villa d'écriture créée en 1997 par le Département du Nord, sur les terres d'enfance de Marguerite Yourcenar (Mont Noir, Flandres). Accueille auteurs français et étrangers, émergents ou confirmés, pour des résidences d'1 à 2 mois. Logement, bureau, défraiements. Un des principaux lieux d'écriture en résidence en France.",
    eligibility:
      "Auteurs ayant publié au moins 1 livre individuel chez un éditeur (à compte d'éditeur). Disciplines : roman, nouvelle, récit littéraire, poésie, théâtre, traduction, littérature jeunesse, BD/roman graphique, essai, philosophie, sociologie. Projet d'écriture en cours.",
    amount: null,
    amountMin: 2000,
    amountMax: 6000,
    deadline: "3 avril 2026 (pour résidences 2026-2027)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://villamargueriteyourcenar.fr/la-residence-d-ecritures",
    grantType: ["Résidence", "Bourse"],
    eligibleSectors: ["Littérature", "Poésie", "Théâtre", "Traduction", "Littérature jeunesse", "Bande dessinée", "Essai"],
    geographicZone: ["Hauts-de-France"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 12,
    preparationAdvice:
      "Périodes : octobre/novembre 2026, avril/mai 2027, octobre/novembre 2027. Le cadre historique (maison d'enfance de Yourcenar, paysages de Flandres) est inspirant mais ISOLÉ — important pour les projets qui demandent concentration. Dossier avec manuscrit en cours (30-50p) + note d'intention.",
    status: "active",
  },
  {
    title: "Résidence La Chartreuse — Centre National des Écritures du Spectacle (Villeneuve-lès-Avignon)",
    organization: "La Chartreuse — Centre National des Écritures du Spectacle",
    description:
      "Lieu majeur en France et en Europe dédié aux résidences d'écriture dramatique. 60 résidences/an pour auteurs, compagnies, laboratoires, formations. Hébergement dans les anciennes cellules des moines Chartreux (modernisées). Collaborations régulières avec le Festival d'Avignon.",
    eligibility:
      "Auteurs dramatiques, traducteurs de théâtre, compagnies (théâtre, danse, cirque, arts de la rue, arts numériques) intégrant un auteur contemporain ou un texte dans leur création. Projet nécessitant recherche, expérimentation, temps de création.",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "30 avril 2026 (pour résidences 1er semestre 2027)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://chartreuse.org/site/venir-en-residence",
    grantType: ["Résidence", "Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Théâtre", "Écriture dramatique", "Spectacle vivant", "Arts numériques", "Danse", "Cirque"],
    geographicZone: ["Provence-Alpes-Côte d'Azur"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 60,
    preparationAdvice:
      "Volume important de résidences (60/an) = chances raisonnables. Dossier avec extraits de texte + note d'intention + calendrier de résidence (2-4 semaines typiquement). La proximité Festival d'Avignon (juillet) est un atout pour caler sa résidence en prévision d'une présentation festival.",
    status: "active",
  },
  {
    title: "Résidence Jeune Public — Chartreuse × Cube Montréal (Québec)",
    organization: "La Chartreuse × Le Cube (Montréal) × CALQ",
    description:
      "Résidence croisée dédiée à la création pour le jeune public. Soutien par le CALQ (Conseil des arts et des lettres du Québec) et La Chartreuse. L'artiste est accueilli au Cube (Montréal) pendant 6 semaines entre fin octobre et mi-décembre 2026.",
    eligibility:
      "Auteurs, metteurs en scène, compagnies portant un projet de création pour le jeune public (dès 3 ans). Projet à la croisée des disciplines (théâtre, marionnette, musique, numérique). Disponibilité 6 semaines au Québec.",
    amount: null,
    amountMin: 3000,
    amountMax: 8000,
    deadline: "1er février 2026, minuit",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://chartreuse.org/site/residence-de-recherche-en-arts-de-la-scene-pour-le-jeune-public-0",
    grantType: ["Résidence", "Bourse", "Aide à la mobilité"],
    eligibleSectors: ["Théâtre jeunesse", "Spectacle vivant", "Marionnette", "Arts numériques", "Résidence"],
    geographicZone: ["International", "Canada"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Deadline précoce (1er février). Candidature détaillée sur le projet jeune public et les interactions anticipées avec la scène québécoise. Budget voyage et hébergement couverts ou partiellement couverts par le CALQ.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 16 : ${WAVE.length} grants à insérer.\n`);

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
