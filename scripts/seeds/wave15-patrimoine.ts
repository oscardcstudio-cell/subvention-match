/**
 * Vague 15 : dispositifs patrimoine — Fondation du Patrimoine, Mission Bern,
 * Maisons des Illustres, VMF.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  {
    title: "Mission Patrimoine Stéphane Bern × Loto du Patrimoine",
    organization: "Fondation du Patrimoine × Mission Bern × FDJ UNITED",
    description:
      "Dispositif national créé en 2018 qui mobilise la FDJ (loto patrimoine, grattage) pour financer la restauration du patrimoine en péril. 2 catégories annuelles : sites emblématiques régionaux (18 par an, 1 par région + DROM) et sites départementaux (~100 par an, 1 par département). Restauration + coup de projecteur médiatique national.",
    eligibility:
      "Propriétaires publics, privés ou associatifs de biens patrimoniaux français en péril (monuments historiques OU patrimoine non protégé d'intérêt public). Devis de restauration détaillé. Dossier déposé par un « relais » : collectivité, association, particulier. Signalement en amont possible sur missionbern.fr.",
    amount: null,
    amountMin: 50000,
    amountMax: 500000,
    deadline: "28 février 2026 (sites départementaux édition 2026) — 16 novembre 2025 (emblématiques édition 2026)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.missionbern.fr/signaler-un-site",
    grantType: ["Subvention", "Aide à la restauration", "Appel à candidatures"],
    eligibleSectors: ["Patrimoine", "Monument historique", "Restauration"],
    geographicZone: ["National"],
    structureSize: ["Association", "Collectivité", "Individuel"],
    applicationDifficulty: "difficile",
    acceptanceRate: 15,
    annualBeneficiaries: 120,
    preparationAdvice:
      "Le dossier doit démontrer l'urgence (état de péril) + l'ambition de restauration (devis techniques validés) + le projet culturel post-restauration (ouverture au public, programmation, valorisation). Le relais médiatique Stéphane Bern est majeur — souvent ça débloque d'autres mécénats privés.",
    status: "active",
  },
  {
    title: "Programme Patrimoine et Tourisme local — Fondation du Patrimoine",
    organization: "Fondation du Patrimoine",
    description:
      "Programme qui soutient les projets de restauration patrimoniale ayant un potentiel de développement touristique local (attractivité de la commune, retombées économiques). Cofinancement de la Fondation + sollicitation du mécénat d'entreprise local + collectivités.",
    eligibility:
      "Propriétaires publics ou privés d'un bien patrimonial avec potentiel touristique identifié (château, moulin, église, site industriel, jardin). Projet de restauration avec volet touristique (ouverture au public, circuits, médiation).",
    amount: null,
    amountMin: 10000,
    amountMax: 100000,
    deadline: "Dépôts en continu",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.fondation-patrimoine.org/c/soumettre-un-projet/obtenir-une-aide-financiere/programme-patrimoine-et-tourisme-local/1",
    grantType: ["Subvention", "Aide à la restauration"],
    eligibleSectors: ["Patrimoine", "Monument historique", "Tourisme culturel"],
    geographicZone: ["National"],
    structureSize: ["Association", "Collectivité", "TPE", "Individuel"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Le volet tourisme est central — démontrer par des chiffres (fréquentation potentielle, retombées économiques). Rassembler en amont le mécénat local (entreprises, clubs) et les collectivités pour présenter un plan de financement consolidé.",
    status: "active",
  },
  {
    title: "Label Fondation du Patrimoine (déduction fiscale propriétaires privés)",
    organization: "Fondation du Patrimoine",
    description:
      "Label délivré après avis de l'Architecte des Bâtiments de France qui permet aux propriétaires privés de patrimoine non protégé au titre des MH de déduire de leur revenu global les dépenses d'entretien et de réparation. Dispositif FISCAL + patrimonial hybride — pas une subvention directe mais un avantage significatif pour les gros travaux.",
    eligibility:
      "Propriétaires privés d'un bien patrimonial non-MH (château, manoir, église, ancien bâtiment remarquable) caractéristique de leur région ou de leur époque. Visibilité depuis la voie publique. Accord de l'Architecte des Bâtiments de France. Travaux de conservation ou de restauration identique.",
    amount: null,
    amountMin: 5000,
    amountMax: 500000,
    deadline: "Dépôts en continu",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.fondation-patrimoine.org/",
    grantType: ["Label", "Avantage fiscal"],
    eligibleSectors: ["Patrimoine", "Monument non protégé", "Restauration"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 70,
    preparationAdvice:
      "Pas une aide cash mais une DÉFISCALISATION — selon les revenus, peut représenter 30-45% d'économie sur les travaux. Cumul avec souscription publique et mécénat possible. Délai d'obtention du label : 2-3 mois après dépôt.",
    status: "active",
  },
  {
    title: "Souscription publique — Fondation du Patrimoine",
    organization: "Fondation du Patrimoine",
    description:
      "Dispositif qui permet à un porteur de projet patrimonial (collectivité, association, propriétaire privé) d'ouvrir une collecte de dons publique via la Fondation du Patrimoine. Les donateurs bénéficient d'une réduction d'impôt (66% IR ou 60% IS). La Fondation co-abonde souvent à partir d'un seuil de collecte atteint.",
    eligibility:
      "Collectivités publiques, associations, propriétaires privés d'un bien patrimonial protégé au titre des MH ou labellisé. Convention avec la Fondation du Patrimoine. Plan de communication pour mobiliser les donateurs (réseaux locaux, presse, événements).",
    amount: null,
    amountMin: 10000,
    amountMax: 1000000,
    deadline: "Dépôts en continu",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.fondation-patrimoine.org/",
    grantType: ["Collecte de dons", "Mécénat"],
    eligibleSectors: ["Patrimoine", "Monument historique", "Restauration"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 80,
    preparationAdvice:
      "Outil stratégique pour les gros chantiers : la souscription publique peut lever plusieurs centaines de K€. Nécessite un PLAN DE COMMUNICATION solide (relais médias locaux, événements, réseaux sociaux). La Fondation accompagne méthodologiquement.",
    status: "active",
  },
  {
    title: "Label Maisons des Illustres — Ministère de la Culture",
    organization: "Ministère de la Culture — DGP",
    description:
      "Label national qui distingue les lieux ayant été habités par des personnalités qui ont marqué l'histoire politique, scientifique, sociale et culturelle de la France. Pas une subvention directe mais un outil de valorisation et de notoriété qui ouvre la porte à d'autres aides (tourisme, mécénat, partenariats).",
    eligibility:
      "Maisons (musées, lieux visitables) respectant 3 conditions : ouverture au public au moins 40 jours/an, but non essentiellement commercial, habitée par la personnalité avec mémoire préservée. Dossier via DRAC de la région.",
    amount: null,
    amountMin: 0,
    amountMax: 0,
    deadline: "2 commissions nationales par an",
    frequency: "2 sessions annuelles",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/Aides-demarches/protections-labels-et-appellations/label-maisons-des-illustres",
    grantType: ["Label", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Patrimoine", "Musée", "Maison d'écrivain", "Maison d'artiste"],
    geographicZone: ["National"],
    structureSize: ["Association", "Collectivité", "TPE", "Individuel"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    annualBeneficiaries: 30,
    preparationAdvice:
      "Le label n'apporte pas d'argent mais un RESSORT DE NOTORIÉTÉ important : diffusion dans les guides touristiques, intégration réseau Maisons des Illustres (communication mutualisée), crédibilité pour solliciter mécénats et subventions locales. Dépôt via correspondant DRAC.",
    status: "active",
  },
  {
    title: "Aide VMF à la restauration — Fondation VMF (Vieilles Maisons Françaises)",
    organization: "Fondation VMF (abritée par la Fondation du Patrimoine)",
    description:
      "Aide directe aux projets de restauration de monuments en péril, portée par la Fondation VMF (créée en 2009 et abritée par la Fondation du Patrimoine). Conseil juridique + soutien financier. Complément des dispositifs Fondation du Patrimoine avec une expertise spécifique sur les maisons historiques privées.",
    eligibility:
      "Propriétaires privés, associations ou collectivités gérant un monument historique ou remarquable en péril. Projet de restauration identitaire (conservation du caractère historique). Accompagnement juridique VMF souvent préalable au dossier.",
    amount: null,
    amountMin: 3000,
    amountMax: 30000,
    deadline: "Dépôts en continu",
    frequency: "Traitement au fil de l'eau",
    isRecurring: true,
    url: "https://www.vmfpatrimoine.org/vmf-en-action/fondation-vmf",
    contactEmail: "accueil@vmfpatrimoine.org",
    grantType: ["Subvention", "Conseil juridique"],
    eligibleSectors: ["Patrimoine", "Monument historique", "Restauration"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Contact accueil@vmfpatrimoine.org en amont. L'accompagnement juridique VMF (sur les aspects fiscaux, urbanistiques, patrimoniaux) est souvent aussi précieux que le soutien financier. Cumul avec Fondation du Patrimoine et Mission Bern.",
    status: "active",
  },
  {
    title: "Label VMF Patrimoine Historique",
    organization: "Vieilles Maisons Françaises (VMF)",
    description:
      "Label attribué par l'association VMF aux édifices historiques remarquables (publics ou privés) dont la conservation est exemplaire. Confère une reconnaissance prestigieuse et une visibilité dans les publications et événements VMF (revue Patrimoine VMF, Journées du Patrimoine). 11 édifices labellisés en 2026.",
    eligibility:
      "Propriétaires d'édifices historiques remarquables (châteaux, manoirs, hôtels particuliers, églises, édifices ruraux). Conservation exemplaire démontrée. Ouverture possible au public (pas obligatoire). Adhésion VMF recommandée.",
    amount: null,
    amountMin: 0,
    amountMax: 0,
    deadline: "Commissions annuelles",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.vmfpatrimoine.org/",
    grantType: ["Label", "Reconnaissance"],
    eligibleSectors: ["Patrimoine", "Monument historique"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    annualBeneficiaries: 11,
    preparationAdvice:
      "Pas de cash mais un label prestigieux ouvrant sur réseau VMF (visibilité revue + JEP + mécénat). Cumul avec Label Fondation du Patrimoine et Maisons des Illustres. Dossier visuel de qualité indispensable.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 15 : ${WAVE.length} grants à insérer.\n`);

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
