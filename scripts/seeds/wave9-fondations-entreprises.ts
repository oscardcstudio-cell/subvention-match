/**
 * Vague 9 : fondations d'entreprise avec appels ouverts à candidatures.
 *
 * Volontairement filtré sur les fondations avec de VRAIS appels à projets
 * publics (pas du mécénat par cooptation).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== FONDATION ORANGE ==========
  {
    title: "Mécénat musical — Fondation Orange",
    organization: "Fondation Orange",
    description:
      "Programme de soutien aux structures culturelles travaillant dans la musique classique et vocale. Finance concerts, enregistrements, tournées, résidences, outils de médiation. Un des rares mécénats privés ouverts sur la musique classique. Soutien plafonné à 25% du budget global du projet.",
    eligibility:
      "Structures culturelles (institutions, associations, fondations) travaillant dans la musique classique ou vocale, justifiant d'au moins 1 an d'existence et autorisées à émettre des reçus fiscaux. Les individus ne sont PAS éligibles — seulement les structures.",
    amount: null,
    amountMin: 5000,
    amountMax: 40000,
    deadline: "2 sessions par an (1 par semestre)",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.fondationorange.com/fr/newsroom/actualites/2025/appel-projets-mecenat-musical",
    grantType: ["Subvention", "Mécénat", "Appel à projets"],
    eligibleSectors: ["Musique", "Musique classique", "Musique vocale", "Chœur", "Opéra"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE", "PME"],
    maxFundingRate: 25,
    coFundingRequired: "Oui - 75% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    preparationAdvice:
      "Plafond à 25% du budget — Orange est un complément, pas un financeur principal. Structure porteuse obligatoire (pas de candidature individuelle d'artiste). Projets valorisés : diffusion classique/vocale vers nouveaux publics, ponts entre esthétiques, émergence.",
    status: "active",
  },
  {
    title: "Diffusion et Accès à la Musique — Fondation Orange",
    organization: "Fondation Orange",
    description:
      "Dispositif qui soutient les projets rendant la musique accessible aux publics et territoires qui en manquent normalement. Couvre aussi les passerelles entre classique et autres esthétiques, et l'intégration professionnelle des jeunes musiciens. Plus large que « Mécénat musical » — toutes esthétiques éligibles.",
    eligibility:
      "Structures culturelles (associations, institutions, festivals) portant un projet de diffusion musicale vers des publics empêchés : milieu rural isolé, quartiers populaires, milieu hospitalier, milieu carcéral, etc. Projet inclusif et non-élitiste.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "2 sessions par an",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.fondationorange.com/fr/newsroom/actualites/2024/appel-projets-diffusion-et-acces-la-musique-france",
    grantType: ["Subvention", "Mécénat", "Appel à projets"],
    eligibleSectors: ["Musique", "Médiation", "Accès culture", "Inclusion"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Démontrer concrètement la cible « publics empêchés » — chiffres, territoires, partenaires sociaux. Projets en zone rurale isolée ou QPV particulièrement valorisés. Articuler concert/atelier/rencontre pour éviter le modèle « parachutage ».",
    status: "active",
  },
  {
    title: "Accès à la scène — Fondation Orange (jeunes musiciens)",
    organization: "Fondation Orange",
    description:
      "Programme spécifique pour les projets collectifs accompagnant de jeunes musiciens professionnels ou en voie de professionnalisation : résidences artistiques, masterclasses, tournées de concerts, calendrier annuel de formation-production.",
    eligibility:
      "Structures porteuses d'un programme annuel combinant résidences + masterclasses + concerts pour jeunes musiciens pro ou en voie de professionnalisation. Profil des jeunes musiciens identifié, encadrants de haut niveau, lieux de diffusion partenaires.",
    amount: null,
    amountMin: 10000,
    amountMax: 40000,
    deadline: "2 sessions par an",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.fondationorange.com/fr/newsroom/actualites/2025/appel-projets-acces-la-scene",
    grantType: ["Subvention", "Mécénat", "Appel à projets"],
    eligibleSectors: ["Musique", "Jeunes musiciens", "Formation", "Résidence"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    preparationAdvice:
      "Plus sélectif — programme ANNUEL exigé (pas ponctuel). Partenariat avec lieux de diffusion + écoles/conservatoires est un plus. Les candidatures gagnantes articulent résidence (temps long) et scène (visibilité).",
    status: "active",
  },

  // ========== FONDATION BANQUE POPULAIRE ==========
  {
    title: "Bourse Musique — Fondation Banque Populaire",
    organization: "Fondation Banque Populaire",
    description:
      "Une des plus anciennes fondations mécènes sur la musique en France (1992). Soutient les jeunes talents de la musique classique et baroque pour poursuivre leur formation, enregistrer un premier disque, participer à des concours internationaux, ou faire des concerts. Accompagnement 1 à 3 ans avec réseau de pairs et conseils professionnels.",
    eligibility:
      "Instrumentistes classique ou baroque (sauf orgue, chef, chanteur) : moins de 27 ans. Ensembles de musique de chambre (duos à quartets) : moins de 28 ans. Compositeurs : moins de 40 ans. Musiciens individuels éligibles (pas de structure obligatoire). Niveau professionnel en construction démontré.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Consulter fondationbanquepopulaire.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationbanquepopulaire.fr/musique/",
    grantType: ["Bourse", "Aide au développement", "Appel à candidatures"],
    eligibleSectors: ["Musique classique", "Musique baroque", "Musique de chambre", "Composition"],
    geographicZone: ["National", "International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 15,
    preparationAdvice:
      "Dispositif INDIVIDUEL (rare en musique classique). Critères d'âge stricts — vérifier la fenêtre. Dossier avec enregistrements récents, CV concertiste/concours, note de projet à 1-3 ans. Le réseau des 1000+ alumni est un atout majeur au-delà du cash.",
    status: "active",
  },

  // ========== FONDATION SNCF ==========
  {
    title: "Entre les lignes — Fondation SNCF (lecture/écriture)",
    organization: "Fondation SNCF",
    description:
      "Appel à projets de la Fondation SNCF pour encourager les initiatives associatives qui contribuent à l'accès aux savoirs de base (lecture, écriture, calcul) ou à leur consolidation. Dispositif intéressant pour les auteurs, artistes et structures travaillant avec des publics en difficulté de lecture/écriture.",
    eligibility:
      "Associations françaises portant un projet d'accès à la lecture/écriture/calcul pour publics en difficulté (analphabétisme, illettrisme, détenus, décrocheurs). Cadre éducatif ou socio-culturel. Partenariats territoriaux.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Consulter fondation-sncf.org",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.groupe-sncf.com/fr/engagements/mecenat-sponsoring/fondation",
    grantType: ["Subvention", "Mécénat", "Appel à projets"],
    eligibleSectors: ["Littérature", "Médiation", "Accès culture", "Éducation", "Inclusion"],
    geographicZone: ["National"],
    structureSize: ["Association"],
    applicationDifficulty: "facile",
    acceptanceRate: 40,
    preparationAdvice:
      "Pertinent pour les auteurs qui ont des ateliers d'écriture avec publics empêchés, les associations littérature en milieu carcéral, les libraires itinérants. Le lien avec le train / la mobilité / les gares est un plus (mais pas obligatoire).",
    status: "active",
  },

  // ========== FONDATION GROUPE RATP ==========
  {
    title: "Accès à la culture — Fondation Groupe RATP",
    organization: "Fondation Groupe RATP",
    description:
      "Appel à projets qui soutient les initiatives favorisant l'égalité d'accès des personnes économiquement ou socialement fragiles aux institutions culturelles, au patrimoine historique et aux activités culturelles. Implantation dans des territoires où le groupe RATP est présent (Île-de-France + autres).",
    eligibility:
      "Associations françaises portant un projet d'accès à la culture pour publics précaires / fragiles. Ancrage dans un territoire RATP (Île-de-France principalement). Partenariats avec structures culturelles, sociales, éducatives.",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Appel ouvert du 28 janvier au 31 décembre 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://appelprojetsfondationgouperatp.selecteev.io/",
    grantType: ["Subvention", "Mécénat", "Appel à projets"],
    eligibleSectors: ["Médiation", "Accès culture", "Inclusion", "Spectacle vivant", "Arts visuels"],
    geographicZone: ["Île-de-France", "National"],
    structureSize: ["Association"],
    applicationDifficulty: "facile",
    acceptanceRate: 35,
    preparationAdvice:
      "Appel ouvert en continu 2026 — possibilité de candidater n'importe quand. Focus sur l'inclusion et la mobilité urbaine. Un projet articulant culture + insertion professionnelle est particulièrement pertinent pour la Fondation.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 9 : ${WAVE.length} grants à insérer.\n`);

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
