/**
 * Vague 19 : métropoles majeures (Nantes, Bordeaux, Toulouse, Strasbourg).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== NANTES MÉTROPOLE ==========
  {
    title: "Aide à l'amorçage de production en spectacle vivant — Nantes Métropole",
    organization: "Nantes Métropole",
    description:
      "Aide au premier niveau de soutien à la production artistique, destinée aux compagnies nantaises en phase d'amorçage d'un projet. Encourage le renouvellement artistique et la diversité des formats (solos, formes singulières, dispositifs hors-les-murs). Dispositif-clé pour émergence dans le Grand Ouest.",
    eligibility:
      "Compagnies et collectifs professionnels de spectacle vivant implantés à Nantes Métropole (siège social ou lieu principal d'activité). Licence entrepreneur. Projet en phase d'amorçage (première création ou première structurée après émergence). Diversité esthétique valorisée.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "30 septembre de n pour projets n+1 (ou 15 juin si demande >23K€)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://metropole.nantes.fr/mes-services-mon-quotidien/aides-et-bons-plans/a-vos-projets/aide-a-l-amorcage-de-production-en-spectacle-vivant",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Spectacle vivant", "Théâtre", "Danse", "Cirque", "Musique", "Arts de la rue"],
    geographicZone: ["Pays de la Loire", "Nantes"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Dépôt via portail AIDEN. La Métropole travaille étroitement avec Trempo, TU-Nantes, la Soufflerie pour accompagner les émergences — s'appuyer sur un partenariat local solide.",
    status: "active",
  },
  {
    title: "Aide au projet culture et expérimentations inclusives — Nantes Métropole",
    organization: "Nantes Métropole",
    description:
      "Dispositif Nantes Métropole pour les projets culturels inclusifs et solidaires (publics empêchés, quartiers populaires, médiation sociale). Soutient les démarches à la croisée de l'art et de la solidarité, pour sortir de la culture « pour initiés ».",
    eligibility:
      "Associations et structures culturelles implantées à Nantes Métropole. Projet intégrant explicitement une dimension d'inclusion sociale : publics précaires, quartiers politique de la ville, handicap, grand âge, migrants.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "Sessions annuelles (via AIDEN)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://metropole.nantes.fr/aide-au-projet-culture-et-experimentations-inclusives-et-solidaires",
    grantType: ["Subvention", "Aide au projet", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Médiation culturelle", "Inclusion"],
    geographicZone: ["Pays de la Loire", "Nantes"],
    structureSize: ["Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Le volet social ne doit pas être décoratif — démontrer des partenariats réels (CCAS, bailleurs sociaux, centres sociaux, ESAT). Co-construction avec les bénéficiaires valorisée.",
    status: "active",
  },

  // ========== BORDEAUX ==========
  {
    title: "FAEE — Fonds d'Accompagnement à l'Émergence et à l'Expérimentation (Bordeaux)",
    organization: "Ville de Bordeaux",
    description:
      "Fonds créé en 2021 par la Ville de Bordeaux pour soutenir l'émergence et l'expérimentation artistiques sur son territoire. Couvre la création, la diffusion, la médiation, l'animation patrimoniale et l'événementiel culturel. Ciblé sur les associations et artistes-auteurs bordelais.",
    eligibility:
      "Associations et artistes-auteurs basés à Bordeaux. Projet sur le territoire bordelais (création, diffusion, médiation, patrimoine, événementiel). Caractère émergent ou expérimental démontré.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "Sessions annuelles (consulter bordeaux.fr)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bordeaux.fr/fonds-daccompagnement-a-lemergence-et-a-lexperimentation-faee",
    grantType: ["Subvention", "Aide à l'émergence", "Aide à l'expérimentation"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Patrimoine", "Médiation"],
    geographicZone: ["Nouvelle-Aquitaine", "Bordeaux"],
    structureSize: ["Association", "Artiste-auteur"],
    applicationDifficulty: "facile",
    acceptanceRate: 45,
    preparationAdvice:
      "Dispositif accessible pour les primo-candidats. Caractère EXPÉRIMENTAL central — démontrer la prise de risque artistique (forme, mode de production, rapport public). Territoire bordelais = condition ferme.",
    status: "active",
  },
  {
    title: "Résidences EAC — Ville de Bordeaux",
    organization: "Ville de Bordeaux",
    description:
      "Appel à projets pour des résidences d'Éducation Artistique et Culturelle articulant création artistique et structures scolaires/sociales. Cible les rencontres entre artistes et publics jeunes ou fragiles dans le cadre scolaire ou périscolaire.",
    eligibility:
      "Artistes et collectifs (toutes disciplines) souhaitant mener une résidence EAC sur le territoire bordelais. Partenariat formalisé avec un établissement scolaire, social ou médiation. Calendrier annuel scolaire.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "12 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bordeaux.fr/les-residences-deducation-artistique-et-culturelle-eac",
    grantType: ["Subvention", "Aide à la résidence", "Aide EAC", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Littérature", "Résidence", "EAC"],
    geographicZone: ["Nouvelle-Aquitaine", "Bordeaux"],
    structureSize: ["Association", "Artiste individuel"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Dépôt 12 janvier au 12 février 2026. Partenariat scolaire/social préalable — contacter en amont l'établissement (chef établissement, prof référent culture). Budget détaillé incluant rémunération artiste + matériel + restitution publique.",
    status: "active",
  },

  // ========== TOULOUSE ==========
  {
    title: "Artistes-Habitants — Expérimentation culturelle Toulouse Métropole",
    organization: "Toulouse Métropole",
    description:
      "Dispositif d'expérimentation culturelle visant à ancrer les artistes au cœur des quartiers prioritaires (Empalot, Cépière-Beauregard, zones en renouvellement urbain). Enveloppe annuelle 70 000 €. Aide plafonnée à 20 000 €/projet, max 60% du budget. Résidences territoriales longues.",
    eligibility:
      "Artistes et collectifs artistiques portant un projet de résidence territoriale dans un quartier prioritaire de Toulouse Métropole. Co-construction avec habitants et acteurs locaux. Durée plusieurs mois à 1 an.",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Consulter mairie-toulouse.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://metropole.toulouse.fr/actualites/experimentation-culturelle-artistes-habitants-2025-2026",
    contactEmail: "Experimentation.Culturelle@mairie-toulouse.fr",
    contactPhone: "05 62 27 43 22",
    grantType: ["Subvention", "Aide à la résidence", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Médiation culturelle", "Résidence", "QPV"],
    geographicZone: ["Occitanie", "Toulouse"],
    structureSize: ["Association", "Artiste individuel"],
    maxFundingRate: 60,
    coFundingRequired: "Oui - 40% minimum",
    applicationDifficulty: "difficile",
    acceptanceRate: 25,
    annualBeneficiaries: 4,
    preparationAdvice:
      "Enveloppe annuelle 70K pour ~4 projets — sélectivité élevée. Zones précises : vérifier que votre projet vise bien un QPV. Co-construction avec habitants obligatoire (focus groups, ateliers, ciné-clubs, pas simplement « venez voir »).",
    status: "active",
  },

  // ========== STRASBOURG ==========
  {
    title: "Aide à la création artistique — Ville de Strasbourg",
    organization: "Ville de Strasbourg",
    description:
      "Dispositif principal d'aide à la création artistique de la Ville de Strasbourg. Pour l'édition 2026, 31 projets soutenus pour une enveloppe totale de 187 000 €. Ville très active culturellement grâce à son rayonnement européen (Parlement + capitale européenne via contrat triennal).",
    eligibility:
      "Compagnies, artistes, structures culturelles implantées à Strasbourg ou en Eurométropole. Licence entrepreneur pour SV. Projet de création avec calendrier et plan de diffusion.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Sessions annuelles",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://culture.strasbourg.eu/actualites/aides-a-la-creation-artistique-laureats-2026/",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Musique", "Théâtre", "Danse", "Cirque"],
    geographicZone: ["Grand Est", "Strasbourg"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Strasbourg bénéficie d'un contrat triennal « Strasbourg capitale européenne » 2024-2026 qui ajoute des opportunités spécifiques (appels à projets culture européenne). Vérifier aussi les dispositifs Eurométropole Strasbourg pour des projets plus structurants.",
    status: "active",
  },
  {
    title: "Aide au concept — Œuvres audiovisuelles et cinématographiques (Eurométropole Strasbourg)",
    organization: "Eurométropole de Strasbourg",
    description:
      "Aide au concept de l'Eurométropole de Strasbourg pour les auteur·es en développement de projets audiovisuels et cinéma. Finance la phase très amont : écriture, développement, recherche de partenaires. Un des rares dispositifs métropolitains dédiés à l'audiovisuel en amont du projet.",
    eligibility:
      "Auteur.e.s de projets audiovisuels et cinéma basés ou implantés dans l'Eurométropole de Strasbourg. Projet en phase de concept (pas encore en pré-production). Synopsis, note d'intention, éléments de développement.",
    amount: null,
    amountMin: 3000,
    amountMax: 10000,
    deadline: "30 janvier 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://culture.strasbourg.eu/pro/discipline-domaine/audiovisuel-cinema/aide-au-concept-des-oeuvres-audiovisuelles-et-cinematographiques/",
    grantType: ["Subvention", "Aide à l'écriture", "Aide au développement"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire", "Fiction", "Écriture"],
    geographicZone: ["Grand Est", "Strasbourg"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Dispositif rare — aide très en amont. Pertinent si projet cohérent à 12-24 mois ensuite (dev, pré-prod, CNC). Le Lieu Documentaire à Strasbourg peut accompagner pour le montage de dossier.",
    status: "active",
  },
  {
    title: "Aide à la structuration spectacle vivant — Ville de Strasbourg",
    organization: "Ville de Strasbourg",
    description:
      "Convention d'accompagnement PLURIANNUELLE pour les équipes artistiques professionnelles du spectacle vivant à Strasbourg. Permet aux compagnies d'avoir une visibilité financière 2-4 ans, sortir de la logique projet par projet. Dispositif structurant pour les compagnies en phase de consolidation.",
    eligibility:
      "Équipes artistiques professionnelles SV basées à Strasbourg. Trajectoire démontrée (3+ créations diffusées). Projet artistique cohérent sur 2-4 ans. Engagement sur plusieurs créations et volets (diffusion, médiation, formation).",
    amount: null,
    amountMin: 20000,
    amountMax: 80000,
    deadline: "Sessions annuelles",
    frequency: "Convention 2-4 ans",
    isRecurring: true,
    url: "https://culture.strasbourg.eu/pro/discipline-domaine/spectacle-vivant/aide-a-la-structuration/",
    grantType: ["Subvention", "Conventionnement", "Aide pluriannuelle"],
    eligibleSectors: ["Spectacle vivant", "Théâtre", "Danse", "Musique", "Cirque"],
    geographicZone: ["Grand Est", "Strasbourg"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    acceptanceRate: 25,
    preparationAdvice:
      "Dispositif exigeant — pour compagnies déjà structurées. Projet pluriannuel détaillé avec volets croisés. Cumulable avec conventionnement DRAC (ADSV) pour une visibilité maximale.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 19 : ${WAVE.length} grants à insérer.\n`);

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
