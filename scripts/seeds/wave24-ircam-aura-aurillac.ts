/**
 * Vague 24 : IRCAM + Contrat de filière AURA + Festival Aurillac + FEVIS.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== IRCAM ==========
  {
    title: "Résidence en recherche musicale et artistique — IRCAM",
    organization: "IRCAM — Institut de Recherche et Coordination Acoustique/Musique",
    description:
      "Résidence à l'IRCAM (Centre Pompidou, Paris) pour compositeurs et artistes de toutes disciplines souhaitant collaborer avec les équipes de recherche. Durée 2 à 6 mois (extensible en centre partenaire). Objectifs : élargir le champ musical via sciences et technologies, développer des outils innovants, tester des dispositifs audio/vidéo immersifs.",
    eligibility:
      "Compositeurs, artistes (musique, arts visuels, arts numériques, danse) portant un projet de recherche artistique nécessitant les outils et l'expertise IRCAM. Dossier avec note d'intention, projet de recherche, méthodologie. Sélection par comité international.",
    amount: null,
    amountMin: 5000,
    amountMax: 25000,
    deadline: "17 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.ircam.fr/creation/residence-en-recherche-artistique",
    grantType: ["Résidence", "Aide à la recherche", "Appel à candidatures"],
    eligibleSectors: ["Musique", "Musique contemporaine", "Composition", "Arts numériques", "Arts sonores", "Recherche artistique"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 8,
    preparationAdvice:
      "Projet INTERDISCIPLINAIRE science/art obligatoire. L'IRCAM ne cherche pas un compositeur cherchant un studio — mais un artiste avec un problème de recherche spécifique que les équipes IRCAM peuvent aider à résoudre. Dossier en anglais ou français, niveau scientifique + artistique requis.",
    status: "active",
  },

  // ========== AURA MUSIQUES ACTUELLES ==========
  {
    title: "Soutien à la présence artistique en territoires — Contrat de filière MA AURA",
    organization: "DRAC Auvergne-Rhône-Alpes × Région AURA × CNM × Grand Bureau",
    description:
      "Appel à projets régional AURA soutenant la présence artistique en musiques actuelles dans les territoires peu pourvus. Cofinancement État (DRAC) + Région + CNM + réseau Grand Bureau. Objectif : irriguer culturellement les zones rurales et péri-urbaines d'AURA.",
    eligibility:
      "Structures culturelles et artistiques de la filière musiques actuelles en Auvergne-Rhône-Alpes. Projet de diffusion ou de résidence en territoire rural ou périurbain. Partenariat avec acteur local (mairie, MJC, médiathèque).",
    amount: null,
    amountMin: 5000,
    amountMax: 25000,
    deadline: "11 mai 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.contratdefiliere-musiquesactuelles-aura.fr/",
    grantType: ["Subvention", "Aide au projet", "Appel à projets"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Diffusion", "Résidence"],
    geographicZone: ["Auvergne-Rhône-Alpes"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Contrat de filière = 4 partenaires cofinanceurs, budget consolidé. Ancrage territorial = critère #1. Le réseau Grand Bureau (150 structures MA en AURA) peut accompagner le montage.",
    status: "active",
  },
  {
    title: "Accompagnement artistes émergents — Contrat de filière MA AURA",
    organization: "DRAC Auvergne-Rhône-Alpes × Région AURA × CNM × Grand Bureau",
    description:
      "Volet émergence du Contrat de filière MA AURA. Soutient l'accompagnement d'artistes et groupes émergents en musiques actuelles sur le territoire régional (résidences, coaching, production, développement). Complète l'aide aux structures par une approche artiste-centrée.",
    eligibility:
      "Structures d'accompagnement MA en AURA (SMAC, pôles régionaux, labels, managers) portant un projet d'accompagnement d'artistes émergents identifiés. Artistes déjà en développement avec trajectoire ascendante.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "11 mai 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.contratdefiliere-musiquesactuelles-aura.fr/",
    grantType: ["Subvention", "Aide à l'émergence", "Appel à projets"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Émergence", "Accompagnement"],
    geographicZone: ["Auvergne-Rhône-Alpes"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    status: "active",
  },

  // ========== FESTIVAL AURILLAC ==========
  {
    title: "Rendez-vous des compagnies de passage — Festival Aurillac",
    organization: "Festival International de Théâtre de Rue d'Aurillac × ÉCLAT (CNAREP)",
    description:
      "Format « Passage » du Festival d'Aurillac (le plus grand festival arts de la rue d'Europe, 19-22 août 2026). Pas de sélection artistique — inscription directe des compagnies qui jouent dans les rues et places d'Aurillac pendant le festival. Visibilité massive (400 000+ festivaliers), occasion unique de rencontrer programmateurs.",
    eligibility:
      "Compagnies d'arts de la rue. Proposition artistique respectant l'esthétique des arts de la rue et tenant compte de l'espace public. Inscription à partir du 23 février (fermeture selon demande).",
    amount: null,
    amountMin: 0,
    amountMax: 0,
    deadline: "Inscriptions à partir du 23 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.aurillac.net/",
    grantType: ["Diffusion", "Appel à candidatures"],
    eligibleSectors: ["Arts de la rue", "Espace public", "Cirque", "Théâtre de rue"],
    geographicZone: ["Auvergne-Rhône-Alpes", "National", "International"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "facile",
    acceptanceRate: 100,
    annualBeneficiaries: 600,
    preparationAdvice:
      "Pas d'argent mais visibilité inestimable — Aurillac c'est le « marché » des arts de la rue européens. Compagnies émergentes souvent invitées à jouer dans des festivals après Aurillac. Prévoir budget auto-production (logistique, défraiements, technique) — le festival ne paie pas les compagnies de passage. Lieux de jeu (rues, places) à réserver en amont via la programmation.",
    status: "active",
  },

  // ========== FEVIS ==========
  {
    title: "Aide à l'insertion professionnelle post-DNSPM — FEVIS × DRAC Hauts-de-France",
    organization: "FEVIS × DRAC Hauts-de-France × ESMD",
    description:
      "Dispositif d'insertion professionnelle des diplômés DNSPM (Diplôme National Supérieur Professionnel de Musicien) de l'ESMD (Lille). Aide financière au recrutement de diplômés par les ensembles FEVIS. Combine politique d'emploi des jeunes artistes + soutien aux ensembles vocaux/instrumentaux spécialisés.",
    eligibility:
      "Ensembles FEVIS (210 ensembles membres en musique classique/baroque/contemporaine) qui recrutent un jeune diplômé DNSPM de l'ESMD dans les conditions du dispositif. Contrat formalisé, mission d'insertion progressive.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Dépôts en continu",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fevis.com/",
    grantType: ["Subvention", "Aide à l'emploi"],
    eligibleSectors: ["Musique", "Musique classique", "Musique contemporaine", "Musique baroque", "Insertion professionnelle"],
    geographicZone: ["Hauts-de-France", "National"],
    structureSize: ["Association"],
    applicationDifficulty: "Moyen",
    preparationAdvice:
      "Dispositif rare combinant insertion musiciens + soutien ensembles. Partenariat ESMD Lille central. Les ensembles FEVIS partout en France peuvent bénéficier mais l'ESMD est le vivier principal.",
    status: "active",
  },

  // ========== ACADÉMIE FRANÇAISE ==========
  {
    title: "Grand Prix du Roman — Académie française",
    organization: "Académie française",
    description:
      "Un des prix littéraires les plus prestigieux de France (créé 1915). Récompense un roman français de l'année. Décerné à la fin octobre, avant les autres grands prix (Goncourt, Renaudot, Femina). Dotation 10 000 €. Effet de notoriété et de ventes considérable.",
    eligibility:
      "Romanciers francophones ayant publié un roman dans l'année. Sélection par nomination des 40 académiciens (pas de candidature directe d'auteur ou éditeur). Tour d'élection en comité.",
    amount: 10000,
    deadline: "Sélection par académiciens (fin octobre)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.academie-francaise.fr/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Littérature", "Roman", "Fiction"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Pour les éditeurs : envoyer aux académiciens (service presse) les romans ambitieux dès leur sortie (août-septembre). La réception critique du roman dans Le Monde, Figaro Littéraire, Lire pèse. Prix moins commercial que Goncourt mais symboliquement majeur.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 24 : ${WAVE.length} grants à insérer.\n`);

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
