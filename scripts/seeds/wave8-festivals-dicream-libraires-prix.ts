/**
 * Vague 8 : dispositifs festivals / création immersive (DICRéAM successeur) /
 * librairies indépendantes / prix arts contemporains.
 *
 * Compléments transverses qui ne rentraient pas dans les vagues sectorielles.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== FESTIVALS ==========
  {
    title: "Soutien aux festivals — Ministère de la Culture",
    organization: "Ministère de la Culture",
    description:
      "Dispositif national de soutien aux festivals dans le champ de la création artistique (spectacle vivant et arts visuels). 3 types d'aide : ponctuelle (projet), pluriannuelle (fonctionnement), transversale (transition écologique, égalité, inclusion, mutation économique). Médiane d'aide 2025 en DRAC : 10 000 €.",
    eligibility:
      "Associations, EPCC, collectivités, entreprises privées organisant un festival dans le spectacle vivant ou les arts visuels. Festival avec identité artistique forte, programmation régulière (annuelle ou biennale), ancrage territorial.",
    amount: null,
    amountMin: 5000,
    amountMax: 80000,
    deadline: "15 mars 2026 (aide ponctuelle) — 1er mars 2026 (aide transversale)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/soutien-aux-festivals-dans-le-champ-de-la-creation-artistique-spectacle-vivant-et-arts-visuels",
    grantType: ["Subvention", "Aide au festival", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Théâtre", "Danse", "Cirque", "Festival"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE", "PME", "EPCC", "Collectivité"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Volet transversal (transition) potentiellement plus accessible : démarche éco-responsable, égalité, inclusion. Résultats annoncés fin mai 2026. Dossier dématérialisé via Démarche Numérique. Pour les gros festivals, le conventionnement pluriannuel est plus sécurisant que l'aide ponctuelle.",
    status: "active",
  },

  // ========== CNC — CRÉATION IMMERSIVE (successeur DICRéAM) ==========
  {
    title: "Fonds d'aide à la création immersive — CNC",
    organization: "CNC - Centre National du Cinema et de l'Image Animee",
    description:
      "Fonds créé en juillet 2022 qui a succédé au Fonds Expériences Numériques et au DICRéAM. Soutient la création d'œuvres XR (VR, AR, MR), expériences immersives, installations interactives, narrations immersives. 3 volets : aide à l'écriture, au développement, à la production.",
    eligibility:
      "Auteurs, producteurs, studios portant un projet d'œuvre immersive (VR/AR/MR, installation interactive, narration XR). Projet avec ambition artistique et/ou technologique. Budget détaillé, équipe identifiée, cible de diffusion (festivals XR, musées, plateformes).",
    amount: null,
    amountMin: 10000,
    amountMax: 200000,
    deadline: "Plusieurs commissions par an",
    frequency: "3 à 4 sessions par an",
    isRecurring: true,
    url: "https://www.cnc.fr/professionnels/aides-et-financements/creation-numerique/fonds-daide-a-la-creation-immersive_1725797",
    grantType: ["Subvention", "Aide à la création", "Aide au développement", "Aide à la production"],
    eligibleSectors: ["Arts numériques", "VR/AR", "XR", "Création immersive", "Arts visuels"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 50,
    coFundingRequired: "Oui - 50% minimum",
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    annualBeneficiaries: 60,
    preparationAdvice:
      "Le CNC est de plus en plus exigeant sur la distribution : avoir un plan de diffusion concret (festival Venice VR, Tribeca Immersive, SXSW, musées partenaires) augmente fortement les chances. Écriture = 10-25K, dev = 25-60K, prod = 50-200K selon ambition.",
    status: "active",
  },
  {
    title: "DICRéAM — Aide à la diffusion (CNC)",
    organization: "CNC - Centre National du Cinema et de l'Image Animee",
    description:
      "Volet diffusion du DICRéAM (maintenu). Soutient les propositions curatoriales ou éditoriales innovantes pour faire connaître les œuvres de création numérique. Couvre expositions, programmations, plateformes en ligne, événements.",
    eligibility:
      "Commissaires d'exposition, artistes-auteurs, lieux d'art invitant un commissaire. Projet curatorial/éditorial autour d'œuvres multimédias et numériques. Forme physique ou en ligne.",
    amount: null,
    amountMin: 5000,
    amountMax: 25000,
    deadline: "Plusieurs sessions par an",
    frequency: "3 sessions par an",
    isRecurring: true,
    url: "https://www.cnc.fr/professionnels/aides-et-financements/dispositif-pour-la-creation-artistique-multimedia-et-numerique-dicream_191324",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Arts numériques", "Arts visuels", "Curateurs", "Exposition"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Dispositif commissaire-centré — le curateur est le demandeur, pas l'artiste. Projet éditorial fort avec sélection argumentée, scénographie, médiation. Cumulable avec aides région.",
    status: "active",
  },

  // ========== LIBRAIRIES ==========
  {
    title: "Aide à l'investissement aux librairies — CNL",
    organization: "CNL — Centre National du Livre",
    description:
      "Aide à l'investissement des librairies indépendantes françaises : création, reprise, travaux, équipement informatique, mobilier, agrandissement. Subvention jusqu'à 50 000 € (100 000 € pour les reprises de librairies importantes) + prêt à taux zéro jusqu'à 300 000 €. Taux d'aide maximum 40% du projet.",
    eligibility:
      "Librairies indépendantes françaises (création, reprise, développement). Label LIR ou LR apprécié. Projet d'investissement détaillé avec devis, plan de financement, prévisionnel à 3 ans. Approche ADELC en parallèle pour les reprises.",
    amount: null,
    amountMin: 5000,
    amountMax: 100000,
    deadline: "16 mars au 29 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://centrenationaldulivre.fr/aides-financement/aide-a-l-investissement-aux-librairies-francaises",
    grantType: ["Subvention", "Prêt taux zéro", "Aide à l'investissement"],
    eligibleSectors: ["Librairie", "Édition", "Livre", "Littérature"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 40,
    coFundingRequired: "Oui - 60% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 60,
    preparationAdvice:
      "Combinaison subvention + prêt taux zéro très favorable. Pour les reprises, solliciter l'ADELC en PARALLÈLE (apport en capital). Commission d'examen en octobre 2026. Dossier solide : prévisionnel 3 ans, analyse concurrence, politique éditoriale différenciante.",
    status: "active",
  },
  {
    title: "Aide aux librairies pour la valorisation des fonds (VAL) — CNL",
    organization: "CNL — Centre National du Livre",
    description:
      "Subvention destinée aux librairies labellisées LIR (Librairie Indépendante de Référence) ou LR (Librairie de Référence) qui offrent au public une sélection diversifiée et qualitative de nouveautés. Finance les actions de valorisation : mise en avant, animations, catalogues, communication.",
    eligibility:
      "Librairies labellisées LIR ou LR (obtention du label préalable via commission CNL). Plan d'action de valorisation détaillé (animations auteurs, vitrines thématiques, newsletter, partenariats médiathèques).",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "16 mars au 29 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://centrenationaldulivre.fr/aides-financement/aide-aux-librairies-pour-la-mise-en-valeur-des-fonds-et-de-la-creation-editoriale",
    grantType: ["Subvention", "Aide à la valorisation"],
    eligibleSectors: ["Librairie", "Édition", "Livre", "Littérature"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "facile",
    acceptanceRate: 70,
    preparationAdvice:
      "Réservé aux librairies DÉJÀ labellisées LIR/LR. Si pas labellisé, candidater d'abord au label (processus annuel). Plan d'action concret et chiffré (ex : 12 rencontres auteur/an, 4 vitrines thématiques, partenariat 3 médiathèques).",
    status: "active",
  },
  {
    title: "Dispositif ADELC — Aide aux librairies indépendantes",
    organization: "ADELC — Association pour le Développement de la Librairie de Création",
    description:
      "Soutien des librairies de littérature générale et spécialisées jeunesse via interventions au capital et apports en compte courant à taux zéro. Accompagne les projets de création, développement ou transmission. Complémentaire du CNL — l'ADELC est spécialisée dans l'apport de FONDS PROPRES (alors que le CNL fait des subventions et prêts).",
    eligibility:
      "Libraires professionnels avec maîtrise de leur projet d'entreprise. Projet de création, développement ou reprise de librairie. Projet éditorial différencié (catalogue, politique culturelle). Rencontre préalable avec l'équipe ADELC obligatoire.",
    amount: null,
    amountMin: 10000,
    amountMax: 200000,
    deadline: "Dépôts en continu",
    frequency: "Au fil de l'eau",
    isRecurring: true,
    url: "https://www.adelc.fr/",
    grantType: ["Apport en fonds propres", "Prêt taux zéro", "Aide au développement"],
    eligibleSectors: ["Librairie", "Édition", "Littérature"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 40,
    preparationAdvice:
      "Pas une subvention : apport en capital ou compte courant. Rembourser à terme (mais taux 0). Contacter l'équipe ADELC AVANT de candidater — ils accompagnent le montage. Combinable systématiquement avec CNL investissement pour les grosses reprises.",
    status: "active",
  },

  // ========== PRIX ARTS VISUELS ==========
  {
    title: "ADIAF Émergence — Bourses artistes émergents",
    organization: "ADIAF — Association pour la Diffusion Internationale de l'Art Français",
    description:
      "Programme d'accompagnement lancé en 2022 par l'ADIAF (qui organise aussi le Prix Marcel Duchamp). Soutient les artistes de moins de 40 ans, commissaires d'exposition et jeunes diplômés d'écoles d'art dans leur trajectoire de développement et de reconnaissance. Dispositif plus accessible que le Prix Duchamp (qui fonctionne par nomination).",
    eligibility:
      "Artistes contemporains de moins de 40 ans, commissaires d'exposition, jeunes diplômés d'écoles d'art (moins de 5 ans après le diplôme). Dossier individuel avec portfolio, note d'intention de développement, CV d'expositions.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Consulter adiaf.com",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adiaf.com/",
    grantType: ["Bourse", "Aide à l'émergence"],
    eligibleSectors: ["Arts visuels", "Arts plastiques", "Émergence"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Critique de 40 ans strict. Le dossier doit montrer une trajectoire ascendante : expositions récentes, collections, prix, presse. Pour les commissaires, argumenter un projet curatorial spécifique. Cumul possible avec CNAP et ADAGP.",
    status: "active",
  },
  {
    title: "Prix Marcel Duchamp — ADIAF × Centre Pompidou",
    organization: "ADIAF × Centre Pompidou",
    description:
      "Un des prix majeurs de l'art contemporain français (créé en 2000). Doté de 90 000 € dont 35 000 € pour le lauréat. 4 artistes nommés chaque année, exposition au Musée d'Art Moderne de Paris, lauréat annoncé lors de la semaine de l'art en octobre. Reconnaissance institutionnelle massive.",
    eligibility:
      "Artistes contemporains nommés PAR LE COMITÉ ADIAF (pas de candidature directe). Nominations basées sur une trajectoire artistique reconnue via expositions institutionnelles, collections publiques/privées. L'artiste doit cultiver un rapport étroit avec les collectionneurs ADIAF.",
    amount: 90000,
    deadline: "Nominations annoncées en janvier",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adiaf.com/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Arts visuels", "Arts contemporains", "Installation", "Sculpture", "Peinture", "Photographie"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "ATTENTION : pas de candidature directe. La nomination se construit en amont via un parcours cohérent d'expositions institutionnelles, de collections et de visibilité critique. Un galeriste/curateur bien connecté est souvent nécessaire. Même nommé sans gagner, l'effet sur la carrière est considérable.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 8 : ${WAVE.length} grants à insérer.\n`);

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
