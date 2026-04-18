/**
 * Vague 17 : cinéma/audiovisuel — Eurimages (Europe), régions cinéma,
 * SOFICA (défiscalisation).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== EURIMAGES ==========
  {
    title: "Eurimages — Soutien à la coproduction cinématographique",
    organization: "Eurimages — Conseil de l'Europe",
    description:
      "Fonds culturel du Conseil de l'Europe, opérationnel depuis 1989. Soutient les coproductions internationales de longs métrages de fiction, animation et documentaires (min 70 min) destinés à la salle. 38 États membres + Canada associé. Budget annuel ~27,5 M€. Subvention non-remboursable jusqu'à 150K€, au-delà = avance sur recettes.",
    eligibility:
      "Producteurs indépendants de films (personne physique ou morale) établis dans un État membre Eurimages. Coproduction internationale min 2 pays Eurimages. Long métrage fiction/animation/documentaire de 70 min minimum destiné aux salles. Budget global avec plan de financement.",
    amount: null,
    amountMin: 80000,
    amountMax: 500000,
    deadline: "3 appels par an (consulter coe.int/eurimages)",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.coe.int/en/web/eurimages/coproduction",
    grantType: ["Subvention européenne", "Avance sur recettes", "Appel à projets"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Animation", "Documentaire", "Coproduction européenne"],
    geographicZone: ["Europe", "International"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 20,
    annualBeneficiaries: 80,
    preparationAdvice:
      "Consortium de producteurs européens déjà constitué = condition. Le producteur délégué doit être expérimenté (pas premier long-métrage généralement). Budget prévisionnel réaliste 1-10M€, plan de financement avec CNC + diffuseurs + MG distribution. Dossier en anglais ou français.",
    status: "active",
  },

  // ========== RÉGIONS CINÉMA ==========
  {
    title: "Fonds de soutien cinéma (aide à la production) — Île-de-France",
    organization: "Région Île-de-France",
    description:
      "Fonds régional d'aide à la production de longs métrages cinéma. Soutient les films produits ou tournés significativement en Île-de-France. Conventionnement avec le CNC (convention région). Cofinancement avec CNC + chaînes + distributeurs. Un des fonds régionaux cinéma les plus dotés en France.",
    eligibility:
      "Sociétés de production indépendantes ayant signé une convention avec le CNC et l'Île-de-France. Projet de long métrage avec 50%+ des dépenses éligibles en Île-de-France. Plan de financement cohérent.",
    amount: null,
    amountMin: 30000,
    amountMax: 500000,
    deadline: "3e session : 14 avril ou 30 juin 2026, 17h",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets/fonds-de-soutien-cinema-aide-la-production",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Fiction", "Animation", "Documentaire long-métrage"],
    geographicZone: ["Île-de-France"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 30,
    coFundingRequired: "Oui - 70% minimum",
    applicationDifficulty: "difficile",
    acceptanceRate: 35,
    preparationAdvice:
      "Dépôt sur mesdemarches.iledefrance.fr avant 1er jour de tournage/animation. Commission audiovisuelle en septembre 2026, vote commission permanente en novembre. Conventionnement CNC préalable obligatoire.",
    status: "active",
  },
  {
    title: "Fonds de soutien Audiovisuel — Île-de-France",
    organization: "Région Île-de-France",
    description:
      "Volet AUDIOVISUEL du fonds régional IdF (distinct du cinéma) : soutient séries, web-séries, téléfilms, documentaires de création, captations. Objectif : structurer la filière audiovisuelle francilienne (première région de production AV en France).",
    eligibility:
      "Sociétés de production audiovisuelle conventionnées CNC/Région IdF. Œuvre audiovisuelle (min 26 min) avec diffuseur ou SMAD engagé (pré-achat en cash). Dépenses IdF représentant 50%+ du budget éligible.",
    amount: null,
    amountMin: 10000,
    amountMax: 200000,
    deadline: "14 avril 2026 (3e session 2026)",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets/fonds-de-soutien-audiovisuel-aide-la-production",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Audiovisuel", "Série", "Téléfilm", "Documentaire", "Web-série"],
    geographicZone: ["Île-de-France"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 35,
    preparationAdvice:
      "Pré-achat diffuseur OBLIGATOIRE (France TV, ARTE, Canal+, plateforme SMAD). Pas d'engagement diffuseur = pas d'éligibilité. Contact : melaine.thomann@iledefrance.fr.",
    status: "active",
  },
  {
    title: "Aide après réalisation cinéma — Île-de-France",
    organization: "Région Île-de-France",
    description:
      "Aide post-production IdF : finance la finalisation du film (étalonnage, mixage, sous-titrage, effets spéciaux) quand le tournage est terminé. Utile pour les productions dont le budget initial s'est épuisé en tournage et qui risquent de ne pas finaliser le film.",
    eligibility:
      "Producteurs de films (long, court, documentaire) tournés en IdF. Travail de post-production à effectuer en IdF (labo, studio). Dossier post-tournage avec budget finalisation détaillé.",
    amount: null,
    amountMin: 5000,
    amountMax: 50000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets/aide-apres-realisation-cinema",
    grantType: ["Subvention", "Aide à la post-production"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Post-production"],
    geographicZone: ["Île-de-France"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Soulagement précieux pour les productions sous-financées. Démontrer que la finalisation est à risque SANS cette aide. Devis labos et studios IdF obligatoires. Cumul avec aide à la production IdF sur le même projet impossible.",
    status: "active",
  },

  // ========== SOFICA ==========
  {
    title: "SOFICA — Financement par épargne défiscalisée",
    organization: "Sociétés de Financement d'Œuvres Cinématographiques et Audiovisuelles (SOFICA)",
    description:
      "Les SOFICA collectent de l'épargne privée défiscalisée pour investir dans la production de films, séries, documentaires et animations en langue française. Pour les producteurs : source de financement complémentaire du CNC. Pour les particuliers : réduction d'impôts 40-48% (plafond 18 000 € / foyer). Dispositif prorogé jusqu'au 31 décembre 2026.",
    eligibility:
      "Pour les producteurs : sociétés de production conventionnées CNC portant un film/série en langue française. Conditions strictes sur le capital, agrément CNC, commission SOFICA. Pour les particuliers-investisseurs : résidence fiscale France, souscription minimum ~5 000 €, blocage 5-10 ans.",
    amount: null,
    amountMin: 50000,
    amountMax: 1000000,
    deadline: "Souscriptions annuelles (septembre/octobre à décembre)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.cnc.fr/professionnels/aides-et-financements/tv-films/cinema/sofica",
    grantType: ["Investissement", "Financement privé défiscalisé"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Animation", "Documentaire"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    preparationAdvice:
      "Pas une subvention classique — c'est un investissement avec contrepartie. Les SOFICA prennent une part de marge producteur. Ne retenir que si les sources classiques (CNC, régions, diffuseurs) sont épuisées ET que le film a un potentiel commercial. Prorogé jusqu'à fin 2026 — loi à renouveler ensuite.",
    status: "active",
  },

  // ========== BRACKETS ==========
  {
    title: "Brouillon d'un rêve — Fondation Beaumarchais-SACD (documentaire)",
    organization: "Fondation Beaumarchais-SACD",
    description:
      "Bourse d'écriture de scénarios documentaires. Soutient les auteurs de documentaires en phase d'écriture. Dispositif rare qui rémunère l'écriture documentaire en amont de tout engagement de diffuseur. Permet de sortir de la logique « documentaire formaté TV » en donnant du temps d'écriture libre.",
    eligibility:
      "Auteurs de documentaires (français ou étrangers résidant en France). Projet documentaire original en phase d'écriture. Au moins 1 œuvre antérieure (documentaire ou film) préférable mais pas obligatoire pour les primo-auteurs. Dossier avec synopsis, note d'intention, éléments de traitement.",
    amount: null,
    amountMin: 3000,
    amountMax: 8000,
    deadline: "Sessions régulières — consulter beaumarchais.asso.fr",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://beaumarchais.asso.fr/",
    grantType: ["Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire", "Écriture"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Un des rares dispositifs qui RÉMUNÈRE spécifiquement l'écriture documentaire. Le synopsis doit être personnel (pas un pitch formaté TV). Prendre le temps d'articuler le POINT DE VUE d'auteur, la méthode, la forme. Les commissions Beaumarchais sont composées d'auteur.e.s de documentaire.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 17 : ${WAVE.length} grants à insérer.\n`);

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
