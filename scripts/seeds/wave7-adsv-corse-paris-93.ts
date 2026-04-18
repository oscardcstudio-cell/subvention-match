/**
 * Vague 7 : ADSV (DRAC national), Corse, Ville de Paris, Seine-Saint-Denis,
 * Île-de-France.
 *
 * - ADSV est le dispositif spectacle vivant DRAC le plus important en France
 *   (non couvert jusqu'ici).
 * - La Corse n'avait qu'1 grant (musique).
 * - Les communes étaient quasi absentes (1 seule avant).
 * - La Seine-Saint-Denis est un département très actif culturellement
 *   totalement absent.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== ADSV — DISPOSITIF DRAC NATIONAL ==========
  {
    title: "ADSV — Aides déconcentrées au spectacle vivant (DRAC)",
    organization: "Ministère de la Culture / DRAC",
    description:
      "Dispositif national phare pour le spectacle vivant, attribué par les DRAC en région. Deux volets : aide au projet (ponctuelle, pour une création) et conventionnement (2 à 4 ans, pour un programme pluriannuel). Couvre danse, musique, théâtre, arts de la rue, arts du cirque. Les calendriers varient par région — vérifier sa DRAC.",
    eligibility:
      "Équipes artistiques indépendantes professionnelles. Structure juridique (association, société) avec licence entrepreneur de spectacles cat. 2 ou 3. Projet de création nouvelle (pour l'aide au projet) ou programme d'activités artistiques et culturelles cohérent (pour le conventionnement). Ancrage régional démontré.",
    amount: null,
    amountMin: 5000,
    amountMax: 80000,
    deadline: "Variable par région (Île-de-France : 21 octobre 2025 pour session 2026 ; AURA : 31 octobre 2025)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/aides-aux-equipes-independantes-aides-deconcentrees-au-spectacle-vivant-adsv",
    grantType: ["Subvention", "Aide au projet", "Conventionnement"],
    eligibleSectors: ["Danse", "Musique", "Théâtre", "Arts de la rue", "Cirque", "Spectacle vivant"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    acceptanceRate: 35,
    annualBeneficiaries: 800,
    preparationAdvice:
      "LE dispositif DRAC par excellence — incontournable pour les compagnies professionnelles. Dépôt via Démarche Numérique. Chaque DRAC publie son calendrier spécifique — vérifier sur le site de SA DRAC. Les candidatures au conventionnement (2-4 ans) sont plus exigeantes mais assurent une visibilité à moyen terme.",
    status: "active",
  },

  // ========== CORSE ==========
  {
    title: "Aide à la résidence d'écriture — Collectivité de Corse",
    organization: "Collectivité de Corse (CdC)",
    description:
      "Soutient les résidences d'écriture littéraire en Corse, d'une durée maximum de 6 mois. Plafond 12 000 € représentant au maximum 90% des coûts de la résidence. Dispositif généreux en taux, permettant aux lieux corses d'accueillir auteurs dans de bonnes conditions.",
    eligibility:
      "Structures culturelles corses accueillant un auteur en résidence (bibliothèque, médiathèque, maison d'écrivain, association, maison d'édition). Contrat de résidence formalisé avec l'auteur, durée maximale 6 mois, présence physique effective en Corse.",
    amount: null,
    amountMin: 3000,
    amountMax: 12000,
    deadline: "15 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.isula.corsica/culture/attachment/1050847/",
    grantType: ["Subvention", "Aide à la résidence"],
    eligibleSectors: ["Littérature", "Édition", "Résidence", "Poésie"],
    geographicZone: ["Corse"],
    structureSize: ["Association", "Bibliothèque", "Collectivité"],
    maxFundingRate: 90,
    coFundingRequired: "Oui - 10% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 60,
    preparationAdvice:
      "Taux à 90% — un des plus généreux en France. Doit démontrer un programme public (rencontres, ateliers). La Collectivité de Corse favorise les projets ancrés dans les langues et cultures de l'île (corse, langues régionales).",
    status: "active",
  },
  {
    title: "Aide à la publication d'ouvrages — Collectivité de Corse",
    organization: "Collectivité de Corse (CdC)",
    description:
      "Aide à l'édition pour les maisons d'édition publiant des ouvrages d'intérêt pour la Corse ou d'auteurs corses. Plafond 30 000 €, taux d'intervention 60% maximum (70% pour publications en langue corse). Dispositif-clé pour soutenir la production éditoriale insulaire.",
    eligibility:
      "Éditeurs (corses ou extérieurs) publiant un auteur corse OU un ouvrage sur la Corse. Contrat d'édition signé. Maquette avancée, ISBN réservé. Publications en langue corse privilégiées.",
    amount: null,
    amountMin: 3000,
    amountMax: 30000,
    deadline: "15 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.isula.corsica/culture/REGLEMENT-DES-AIDES-POUR-LA-CULTURE-SECTEUR-LIVRE-ET-LECTURE-PUBLIQUE_a5037.html",
    grantType: ["Subvention", "Aide à l'édition"],
    eligibleSectors: ["Littérature", "Édition", "Langue corse"],
    geographicZone: ["Corse"],
    structureSize: ["TPE", "PME"],
    maxFundingRate: 70,
    applicationDifficulty: "Moyen",
    acceptanceRate: 55,
    status: "active",
  },
  {
    title: "Aide aux arts de la scène — Collectivité de Corse",
    organization: "Collectivité de Corse (CdC)",
    description:
      "Dispositif couvrant création, production et diffusion de spectacle vivant (théâtre, danse, musique, cirque) en Corse. Vise à structurer l'écosystème SV insulaire et favoriser la diffusion d'œuvres corses en métropole.",
    eligibility:
      "Équipes artistiques corses ou coproductions impliquant fortement la Corse. Licence entrepreneur. Projet de création ou de tournée avec ancrage insulaire.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "15 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.isula.corsica/culture/Aides-Art-de-la-scene_a3127.html",
    grantType: ["Subvention", "Aide à la création", "Aide à la diffusion"],
    eligibleSectors: ["Théâtre", "Danse", "Musique", "Cirque", "Spectacle vivant"],
    geographicZone: ["Corse"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    status: "active",
  },

  // ========== VILLE DE PARIS ==========
  {
    title: "Aide à la création spectacle vivant — Ville de Paris",
    organization: "Ville de Paris",
    description:
      "Fonds de soutien d'1 million d'euros/an de la Ville de Paris pour accompagner la création, la diffusion et la diversité artistique sur le territoire parisien. Deux sessions annuelles. Volet spectacle vivant. Attention particulière aux jeunes talents et à l'émergence artistique.",
    eligibility:
      "Compagnies et structures SV implantées à Paris (siège social parisien ou lieu principal d'activité à Paris). Licence entrepreneur. Projet de création ou de diffusion à Paris. Engagements écoresponsables valorisés.",
    amount: null,
    amountMin: 3000,
    amountMax: 30000,
    deadline: "23 mars 2026, 23h59 (session 1 2026)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.paris.fr/pages/aide-a-la-creation-et-a-la-diffusion-d-uvres-5337",
    grantType: ["Subvention", "Aide à la création", "Appel à projets"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant"],
    geographicZone: ["Île-de-France", "Paris"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Fonds récent, critères en évolution. Valorise : émergence, diversité esthétique, diversité des publics, démarche éco-responsable. Un projet qui coche plusieurs de ces cases a un vrai avantage. Dossier dématérialisé.",
    status: "active",
  },
  {
    title: "Aide à la création et diffusion musicale — Ville de Paris",
    organization: "Ville de Paris",
    description:
      "Volet musique du fonds de soutien Ville de Paris. Finance la création, la production et la diffusion d'œuvres musicales sur le territoire parisien. Toutes esthétiques : musiques actuelles, classiques, jazz, électro, musiques traditionnelles.",
    eligibility:
      "Artistes, labels, structures musicales implantés à Paris. Projet musical avec concerts, enregistrements ou diffusions à Paris. Structure juridique (association, société).",
    amount: null,
    amountMin: 3000,
    amountMax: 25000,
    deadline: "15 avril 2026, 23h59 (session 1 2026)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://cdn.paris.fr/paris/2025/07/04/1-diffusion-aap-musique-2026-s1-7e7b.pdf",
    grantType: ["Subvention", "Aide à la création", "Appel à projets"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Jazz", "Classique", "Électronique"],
    geographicZone: ["Île-de-France", "Paris"],
    structureSize: ["Association", "TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    status: "active",
  },
  {
    title: "Aides hip-hop — Ville de Paris × La Place",
    organization: "Ville de Paris & La Place",
    description:
      "Partenariat Ville de Paris / La Place (centre culturel hip-hop) pour soutenir spécifiquement les artistes et événements hip-hop : battles, concerts, expositions, festivals. Couvre danse, musique et arts visuels hip-hop. Dispositif rare, dédié à une culture souvent négligée par les aides classiques.",
    eligibility:
      "Artistes et structures hip-hop (danse hip-hop, rap, DJ, graffiti, expositions) basés à Paris. Projet événementiel ou de création. Ancrage dans la culture hip-hop démontré.",
    amount: null,
    amountMin: 1500,
    amountMax: 12000,
    deadline: "23 mars 2026 (session 2 2026)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.paris.fr/pages/nouvelles-aides-pour-les-artistes-et-evenements-hip-hop-30483",
    grantType: ["Subvention", "Aide à la création", "Appel à projets"],
    eligibleSectors: ["Hip-hop", "Danse", "Musique", "Musiques actuelles", "Arts visuels", "Street art"],
    geographicZone: ["Île-de-France", "Paris"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "facile",
    acceptanceRate: 45,
    preparationAdvice:
      "Dispositif bien plus accessible que les aides SV classiques. La Place accompagne les candidats. Ouvert aussi à des formats non-standards (battles, jam sessions, expos street art). Dépôt entre 26 janvier et 23 mars 2026.",
    status: "active",
  },

  // ========== SEINE-SAINT-DENIS ==========
  {
    title: "Résidences artistiques 2026 — Seine-Saint-Denis",
    organization: "Département de Seine-Saint-Denis",
    description:
      "Dispositif du Département 93 pour soutenir les résidences artistiques sur le territoire. Deux formats : « Création en Seine-Saint-Denis » (artistes émergents, création avec une structure du territoire) et « Nulle part ailleurs » (co-construction avec habitants ou structures locales, projet territorial). Aide 5K-20K€/an, 50% du budget (70% pour disciplines fragiles : arts visuels, cirque, marionnette, arts de la rue).",
    eligibility:
      "Artistes et structures artistiques portant un projet de résidence en Seine-Saint-Denis avec une structure partenaire locale. Projet impliquant les publics, avec restitution. Priorité aux territoires Grand Paris Grand Est et Paris Terres d'Envol.",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Consulter ressources.seinesaintdenis.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://ressources.seinesaintdenis.fr/Appel-a-projet-Residences-artistiques-2026",
    grantType: ["Subvention", "Aide à la résidence", "Appel à projets"],
    eligibleSectors: ["Arts visuels", "Spectacle vivant", "Cirque", "Marionnette", "Arts de la rue", "Résidence"],
    geographicZone: ["Île-de-France", "Seine-Saint-Denis"],
    structureSize: ["Association", "TPE"],
    maxFundingRate: 70,
    coFundingRequired: "Oui",
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Partenariat avec une structure du territoire 93 OBLIGATOIRE (association, centre social, théâtre, école, bibliothèque). Le taux monte à 70% pour disciplines fragiles + territoires prioritaires. Département très actif culturellement — candidatures de qualité élevée.",
    status: "active",
  },

  // ========== ÎLE-DE-FRANCE ==========
  {
    title: "Aide à la création spectacle vivant — Région Île-de-France",
    organization: "Région Île-de-France",
    description:
      "Dispositif de la Région IdF pour la création de spectacles vivants par les équipes artistiques franciliennes. Couvre les disciplines théâtre, danse, musique, cirque, arts de la rue, marionnette. Complémentaire de la DRAC et de la Ville de Paris.",
    eligibility:
      "Équipes artistiques professionnelles basées en Île-de-France. Licence entrepreneur cat. 2 ou 3. Projet de création avec calendrier et plan de diffusion. Cofinancement DRAC et/ou collectivités locales attendu.",
    amount: null,
    amountMin: 10000,
    amountMax: 50000,
    deadline: "Sessions annuelles",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets/aide-la-creation-dans-le-domaine-du-spectacle-vivant",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant", "Marionnette"],
    geographicZone: ["Île-de-France"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    status: "active",
  },
  {
    title: "Aide à la résidence territoriale SV — Région Île-de-France",
    organization: "Région Île-de-France",
    description:
      "Dispositif pour les résidences artistiques en spectacle vivant ancrées territorialement. Favorise le lien artistes / territoires franciliens, notamment hors Paris. Résidences de longue durée (plusieurs semaines à plusieurs mois).",
    eligibility:
      "Équipes artistiques franciliennes ou accueillies par un lieu francilien. Structure d'accueil conventionnée avec la Région. Projet impliquant les publics du territoire (ateliers, restitutions).",
    amount: null,
    amountMin: 10000,
    amountMax: 40000,
    deadline: "Sessions annuelles",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.iledefrance.fr/aides-et-appels-a-projets/aide-la-residence-territoriale-dans-le-domaine-du-spectacle-vivant",
    grantType: ["Subvention", "Aide à la résidence"],
    eligibleSectors: ["Théâtre", "Danse", "Cirque", "Musique", "Spectacle vivant", "Résidence"],
    geographicZone: ["Île-de-France"],
    structureSize: ["Association", "TPE"],
    maxFundingRate: 50,
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    status: "active",
  },
];

async function main() {
  console.log(`Wave 7 : ${WAVE.length} grants à insérer.\n`);

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
