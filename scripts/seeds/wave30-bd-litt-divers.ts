/**
 * Vague 30 : dispositifs complémentaires (BD, littérature émergence,
 * prix divers).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== FESTIVAL ANGOULÊME ==========
  {
    title: "Prix Révélation — Festival International BD Angoulême",
    organization: "Festival International de la Bande Dessinée d'Angoulême (FIBD)",
    description:
      "Prix majeur récompensant un.e auteur.rice de BD dont c'est le premier ou second livre (« Essentiel Révélation »). Décerné chaque année lors du FIBD fin janvier. Un des prix BD les plus visibles du monde francophone. ATTENTION : édition 2026 annulée au profit du « Grand Off » et d'événements parallèles dans 15 villes (FR/BE/ES) organisés par le collectif féministe Girlxcott. Retour traditionnel en 2027.",
    eligibility:
      "Auteur.e.s de BD avec un 1er ou 2e album publié dans l'année. Sélection par comité FIBD (pas de candidature directe). Envoi par l'éditeur. Francophonie + traductions.",
    amount: null,
    amountMin: 2000,
    amountMax: 5000,
    deadline: "Envoi par éditeur (sept/oct pour édition janvier suivante)",
    frequency: "Annuel (2026 annulé, retour 2027)",
    isRecurring: true,
    url: "https://www.bdangouleme.com/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Bande dessinée", "Illustration"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Édition 2026 annulée. Demander à votre éditeur d'envoyer pour 2027 (envoi sept-oct 2026). L'Essentiel Révélation fait vendre 20-40K exemplaires supplémentaires pour le lauréat. Impact carrière majeur.",
    status: "active",
  },
  {
    title: "Fauve d'or — Grand Prix Festival Angoulême",
    organization: "Festival International de la Bande Dessinée d'Angoulême (FIBD)",
    description:
      "Récompense le meilleur album BD de l'année selon le jury FIBD. Le Fauve d'or est l'équivalent BD de la Palme d'Or ou du Goncourt. Dotation modeste, mais impact commercial et critique MAJEUR. Le Grand Prix de la Ville d'Angoulême récompense l'ensemble d'une carrière (autre catégorie).",
    eligibility:
      "Album BD publié dans l'année (janvier N-1 à décembre N-1). Envoi par l'éditeur au FIBD. Langue française ou traduction française publiée. Sélection par comité.",
    amount: null,
    amountMin: 5000,
    amountMax: 10000,
    deadline: "Envoi par éditeur (sept/oct)",
    frequency: "Annuel (2026 annulé, retour 2027)",
    isRecurring: true,
    url: "https://www.bdangouleme.com/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Bande dessinée", "Illustration"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Édition 2026 annulée (cf. notice Prix Révélation). Le Fauve d'or sacralise une œuvre et relance ventes + traductions. Éditeur stratégique indispensable. Beaucoup d'albums nommés vendent plus que le gagnant final.",
    status: "active",
  },

  // ========== LITTÉRATURE ÉMERGENCE ==========
  {
    title: "Prix Voix d'Afriques — JC Lattès",
    organization: "Éditions JC Lattès × RFI",
    description:
      "Prix ouvert aux auteur.e.s africain.e.s émergent.e.s. Publication du manuscrit primé par JC Lattès + accompagnement éditorial + visibilité via RFI et le réseau francophone. Dispositif important pour les voix littéraires africaines n'ayant pas encore publié.",
    eligibility:
      "Auteur.e.s de nationalité d'un pays africain. Premier roman manuscrit (jamais publié). Écriture en français. Manuscrit 150-350 pages.",
    amount: null,
    amountMin: 0,
    amountMax: 5000,
    deadline: "Consulter editions-jclattes.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.editions-jclattes.fr/actualite/lappel-manuscrit-pour-le-prix-voix-dafriques-2026-est-en-ligne/",
    grantType: ["Prix", "Publication"],
    eligibleSectors: ["Littérature", "Roman", "Afrique", "Émergence"],
    geographicZone: ["International", "Afrique"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 3,
    annualBeneficiaries: 1,
    preparationAdvice:
      "PAS une bourse cash mais UN CONTRAT D'ÉDITION (plus précieux pour un primo-auteur). Circulation internationale via réseau francophone. Les lauréats sont souvent réédités dans leur pays d'origine ensuite.",
    status: "active",
  },

  // ========== PRIX GONCOURT DU PREMIER ROMAN ==========
  {
    title: "Prix Goncourt du Premier Roman",
    organization: "Académie Goncourt",
    description:
      "Prix annuel décerné par l'Académie Goncourt au meilleur premier roman français de l'année (créé 1990). Sélection par les jurés Goncourt eux-mêmes. Doter les débuts littéraires français. Complémentaire du Prix Goncourt principal.",
    eligibility:
      "Auteur.e.s français.es de leur PREMIER roman publié (pas de roman antérieur). Publication dans l'année (éligible janvier-octobre). Envoi par l'éditeur à l'Académie Goncourt.",
    amount: null,
    amountMin: 0,
    amountMax: 5000,
    deadline: "Envoi par éditeur avant fin octobre",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.academiegoncourt.fr/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Littérature", "Roman", "Premier roman"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Le Goncourt du Premier Roman augmente les ventes de 20-50K exemplaires typiquement. Envoi par éditeur stratégique (service presse Goncourt). Moins médiatique que le Goncourt principal mais très significatif pour les primo-auteurs.",
    status: "active",
  },

  // ========== COMPLÉMENTS ==========
  {
    title: "Prix des Libraires — Union des Libraires Indépendants",
    organization: "Union des Libraires Indépendants",
    description:
      "Prix décerné par les libraires français indépendants. Sélection progressive par plusieurs milliers de libraires. Dotation modeste mais impact vente MAJEUR : le Prix des Libraires déclenche des commandes massives (5-15K exemplaires). Un des prix les plus commerciaux en France.",
    eligibility:
      "Romans publiés dans l'année. Envoi par éditeur / vote des libraires participants. Le prix 2026 a ses finalistes annoncés en mars-avril 2026.",
    amount: null,
    amountMin: 0,
    amountMax: 3000,
    deadline: "Envoi par éditeur (automne)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.libraires-ensemble.com/",
    grantType: ["Prix", "Reconnaissance commerciale"],
    eligibleSectors: ["Littérature", "Roman"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Prix très commercial — les lauréats vendent massivement. Service presse éditeur = envoi aux libraires jurys. Les romans non-formatés (pas rentrée littéraire classique) ont parfois de meilleures chances.",
    status: "active",
  },

  // ========== RÉSIDENCE MISSION HORSLESMURS ==========
  {
    title: "Résidence-mission Arts de la rue — Fédération nationale des Arts de la rue",
    organization: "Fédération nationale des Arts de la rue × DRAC",
    description:
      "Résidences-missions portées par la Fédération nationale des Arts de la rue en lien avec les DRAC. Artiste accueilli dans un territoire (souvent rural ou péri-urbain) pour mener un projet de création + médiation long. 6-12 mois. Cumule bourse artiste + convention structure d'accueil.",
    eligibility:
      "Artistes et compagnies des arts de la rue, arts de la piste, espace public. Volonté de s'ancrer dans un territoire avec un volet MÉDIATION fort (ateliers, interventions, rencontres). Projet de création personnelle + actions culturelles.",
    amount: null,
    amountMin: 10000,
    amountMax: 30000,
    deadline: "Sessions régulières — consulter federationartsdelarue.org",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "http://www.federationartsdelarue.org/ressources/appels-projets",
    grantType: ["Résidence-mission", "Subvention", "Appel à projets"],
    eligibleSectors: ["Arts de la rue", "Espace public", "Cirque", "Résidence", "Médiation"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    preparationAdvice:
      "Résidence-mission = engagement LONG (6-12 mois). Préparer un plan d'intervention territoriale (publics, formats, calendrier). La Fédération met en relation artiste / structure d'accueil. Cumul possible avec Écrire pour la rue si volet écriture fort.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 30 : ${WAVE.length} grants à insérer.\n`);

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
