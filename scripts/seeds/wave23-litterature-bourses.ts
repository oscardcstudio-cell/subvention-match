/**
 * Vague 23 : CNL bourses auteurs + Stendhal/MIRA LIVRE + prix littéraires.
 *
 * Dispositifs CNL auteurs non encore référencés et programmes mobilité
 * littéraire internationale.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== CNL — BOURSES AUTEURS ==========
  {
    title: "Bourse aux auteurs-autrices — CNL",
    organization: "CNL — Centre National du Livre",
    description:
      "Bourse principale CNL destinée aux auteurs.trices pour soutenir un projet d'écriture, d'illustration ou de traduction. Deux montants : 7 000 € (projet de démarrage) ou 14 000 € (projet plus avancé). Un des dispositifs CNL les plus demandés, pilier du soutien individuel aux auteurs.",
    eligibility:
      "Auteurs.trices ayant publié au moins 1 ouvrage à compte d'éditeur diffusé en librairie. Projet d'écriture/illustration/traduction avec texte ou maquette avancée (30-100 pages). Dossier avec synopsis, motivations, CV bibliographique.",
    amount: null,
    amountMin: 7000,
    amountMax: 14000,
    deadline: "Sessions récurrentes — consulter centrenationaldulivre.fr",
    frequency: "4 sessions par an",
    isRecurring: true,
    url: "https://centrenationaldulivre.fr/aides-financement/bourse-aux-auteurs-autrices",
    grantType: ["Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Littérature", "Édition", "Poésie", "Illustration", "Bande dessinée", "Traduction"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    annualBeneficiaries: 350,
    preparationAdvice:
      "Le dossier doit démontrer l'ADÉQUATION parcours-projet. Extrait substantiel (30-100 pages) essentiel. La commission évalue à la fois la qualité littéraire et la faisabilité. Cumul avec résidences (type Villa Yourcenar, Chartreuse) possible.",
    status: "active",
  },
  {
    title: "Bourse de résidence de création — CNL",
    organization: "CNL — Centre National du Livre",
    description:
      "Bourse permettant à un auteur/illustrateur/traducteur invité en résidence par une structure française de finaliser un projet. La bourse rémunère le travail de création pendant la résidence (logement et hébergement payés par la structure d'accueil, rémunération pour l'auteur par le CNL).",
    eligibility:
      "Auteurs.trices (écrivains, illustrateurs, traducteurs) invités en résidence par une structure française (bibliothèque, médiathèque, maison d'écrivains, association, université). Publication antérieure d'au moins 1 ouvrage. Convention de résidence formalisée.",
    amount: null,
    amountMin: 2000,
    amountMax: 12000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://centrenationaldulivre.fr/aides-financement/bourse-de-residence",
    grantType: ["Bourse", "Aide à la résidence"],
    eligibleSectors: ["Littérature", "Édition", "Poésie", "Illustration", "Traduction", "Résidence"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 50,
    preparationAdvice:
      "Deux demandeurs : la structure d'accueil (qui prend en charge logistique) + l'auteur (qui touche la bourse CNL). Relation structure/auteur centrale. Compatible avec résidences région (Bretagne, Corse, etc.) via double financement.",
    status: "active",
  },
  {
    title: "Bourse de résidence d'auteurs à l'École — CNL",
    organization: "CNL — Centre National du Livre",
    description:
      "Dispositif spécifique : résidence d'auteur en ÉTABLISSEMENT SCOLAIRE (primaire, collège, lycée). L'auteur est accueilli par l'école pour mener un projet d'écriture avec les élèves. Combine création personnelle + médiation littéraire. Programme EAC (Éducation Artistique et Culturelle) prioritaire.",
    eligibility:
      "Auteurs.trices ayant publié au moins 1 ouvrage. Partenariat formalisé avec un établissement scolaire français. Projet combinant écriture personnelle + ateliers/restitutions avec les élèves. Durée 3+ mois.",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://centrenationaldulivre.fr/aides-financement/bourse-de-residence-d-auteurs-a-l-ecole",
    grantType: ["Bourse", "Aide à la résidence", "Aide EAC"],
    eligibleSectors: ["Littérature", "EAC", "Illustration", "Poésie", "Jeunesse"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Double compétence attendue : qualité littéraire + pédagogie. Les auteurs jeunesse ont un avantage naturel. Contact avec un prof/CDI-documentaliste en amont pour co-construire le projet. Cumul avec aides EAC DRAC et collectivités fréquent.",
    status: "active",
  },
  {
    title: "Bourse de séjour aux traducteurs étrangers — CNL",
    organization: "CNL — Centre National du Livre",
    description:
      "Bourse destinée aux traducteurs ÉTRANGERS qui traduisent du français vers leur langue. Permet un séjour en France pour approfondir le contexte culturel du texte traduit, rencontrer l'auteur.e, travailler en bibliothèque. Dispositif international de rayonnement de la langue française.",
    eligibility:
      "Traducteurs professionnels traduisant du français vers leur langue maternelle ou une langue qu'ils maîtrisent. Contrat d'édition pour l'œuvre française à traduire. Projet de séjour en France (1 à 3 mois).",
    amount: null,
    amountMin: 2000,
    amountMax: 6000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://centrenationaldulivre.fr/aides-financement/bourse-de-sejour-aux-traducteurs-du-francais-vers-les-langues-etrangeres",
    grantType: ["Bourse", "Aide à la mobilité", "Aide à la traduction"],
    eligibleSectors: ["Littérature", "Traduction", "Francophonie"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Pour traducteurs vers l'étranger — OUTIL de diffusion du livre français à l'international. Contrat d'édition formalisé OBLIGATOIRE. Institut français local souvent relais/co-financeur.",
    status: "active",
  },

  // ========== PROGRAMME STENDHAL / MIRA LIVRE ==========
  {
    title: "Programme Stendhal / MIRA LIVRE — Mobilité auteurs à l'étranger",
    organization: "Institut français × CNL",
    description:
      "Programme conjoint Institut français × CNL qui soutient les auteurs francophones dont le projet d'écriture justifie un SÉJOUR À L'ÉTRANGER (min 1 mois). Allocation forfaitaire mensuelle 4 000-6 000 € selon pays/durée. MIRA LIVRE est la continuation des « Missions Stendhal ». Un des rares dispositifs français pour la mobilité auteurs en pays étrangers.",
    eligibility:
      "Auteurs.trices d'expression française ayant publié au moins 1 ouvrage. Projet d'écriture nécessitant un séjour à l'étranger (recherche, immersion culturelle, enquête). Disciplines : fiction, essai, BD, littérature jeunesse, poésie. Minimum 1 mois de séjour.",
    amount: null,
    amountMin: 4000,
    amountMax: 6000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.institutfrancais.com/fr/programme/aide-projet/mira-livre",
    grantType: ["Bourse", "Aide à la mobilité"],
    eligibleSectors: ["Littérature", "Édition", "Poésie", "Bande dessinée", "Littérature jeunesse", "Essai"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Le projet doit JUSTIFIER le séjour à l'étranger (pas juste « je veux partir écrire au soleil »). Recherche, sources, paysages spécifiques, témoins locaux à interroger. 80% de l'allocation 2 semaines avant départ, 20% au retour sur justificatifs.",
    status: "active",
  },

  // ========== PRIX CINO DEL DUCA MONDIAL ==========
  {
    title: "Prix mondial Cino Del Duca — Institut de France",
    organization: "Fondation Simone et Cino Del Duca × Institut de France × Académie française",
    description:
      "Prix littéraire de renommée mondiale créé en 1969. 200 000 € de dotation — un des prix littéraires les plus dotés au monde. Récompense un.e auteur.trice français.e ou étranger.e dont l'œuvre constitue un message d'humanisme moderne. Lauréats récents : Boualem Sansal (2025), Ken Follett, Mario Vargas Llosa.",
    eligibility:
      "Écrivains de toutes nationalités. Œuvre d'envergure internationale reconnue. Sélection par nomination exclusive (pas de candidature directe). Les nominations viennent des académiciens Académie française et Institut de France.",
    amount: 200000,
    deadline: "Nomination par l'Institut (pas de candidature directe)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondation-del-duca.fr/prix-subventions/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Littérature", "Fiction", "Essai"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "PAS DE CANDIDATURE DIRECTE. Prix construit par nomination/cooptation entre académiciens et personnalités littéraires. Pour se rapprocher : œuvre substantielle (10+ livres), traduction internationale, présence critique forte. Dotation exceptionnelle mais rareté extrême.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 23 : ${WAVE.length} grants à insérer.\n`);

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
