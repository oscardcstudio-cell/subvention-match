/**
 * Vague 28 : jeunesse (SLPJ Montreuil) + régions cinéma (PACA, Occitanie).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== JEUNESSE ==========
  {
    title: "Émergences — Auteurs émergents × SLPJ Montreuil",
    organization: "Salon du Livre et de la Presse Jeunesse de Montreuil × AR2L Hauts-de-France",
    description:
      "Programme Émergences destiné aux auteur.e.s émergent.e.s qui ont publié entre 1 et 3 livres. Les textes sélectionnés sont publiés dans une anthologie collective diffusée lors du Salon du Livre et de la Presse Jeunesse de Montreuil (novembre). 300 € versés à chaque auteur publié.",
    eligibility:
      "Auteur.e.s ayant publié au moins 1 livre chez un éditeur (tous genres : fiction, poésie, théâtre, BD, jeunesse, adulte) OU au moins 1 nouvelle en recueil collectif / revue reconnue. MAXIMUM 3 livres publiés. Texte inédit soumis pour l'anthologie.",
    amount: 300,
    deadline: "Consulter slpj.fr (appel annuel printemps)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.ar2l-hdf.fr/fileadmin//user_upload/Dispositifs_d_aides/Reglement-Emergences-2026.pdf",
    grantType: ["Publication", "Appel à candidatures"],
    eligibleSectors: ["Littérature", "Jeunesse", "Nouvelle", "Émergence", "Anthologie"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 15,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Dispositif tremplin idéal pour 2e-3e publication. Le texte soumis doit être ORIGINAL (jamais publié). Anthologie diffusée au Salon de Montreuil (200 000 visiteurs) = visibilité éditoriale forte. Nombreux éditeurs jeunesse présents.",
    status: "active",
  },
  {
    title: "Pépites du Salon du Livre Jeunesse de Montreuil",
    organization: "Salon du Livre et de la Presse Jeunesse de Montreuil",
    description:
      "Prix majeurs du SLPJ Montreuil récompensant l'excellence éditoriale en littérature jeunesse. 4 catégories : Fiction, Bande dessinée, Création, Livre d'art. Dotation + visibilité médiatique dans le champ jeunesse. Sélection par jury pro (éditeurs, libraires, critiques, bibliothécaires).",
    eligibility:
      "Ouvrages jeunesse publiés dans l'année (sélection par éditeurs / prescripteurs). PAS DE CANDIDATURE DIRECTE — envoi de l'ouvrage par l'éditeur au Salon. Tous genres jeunesse : album, roman, BD, documentaire, livre d'art.",
    amount: null,
    amountMin: 2000,
    amountMax: 5000,
    deadline: "Envoi par éditeur (septembre pour édition novembre)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://slpj.fr/salon/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Littérature", "Jeunesse", "Bande dessinée", "Album", "Livre d'art"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "difficile",
    acceptanceRate: 2,
    annualBeneficiaries: 4,
    preparationAdvice:
      "Dispositif éditeur-centré : c'est l'éditeur qui envoie l'ouvrage (pas l'auteur). Pour auteurs : convaincre votre éditeur d'envoyer au Salon. Les Pépites sont l'équivalent jeunesse des grands prix littéraires adultes — impact fort sur les ventes scolaires et bibliothèques.",
    status: "active",
  },

  // ========== RÉGION SUD (PACA) ==========
  {
    title: "Soutien création et production long métrage fiction — Région Sud",
    organization: "Région Provence-Alpes-Côte d'Azur × CNC",
    description:
      "Fonds régional cinéma PACA (Région Sud) pour la création et production de longs métrages de fiction. Conventionnement CNC + Région. Cible les productions qui tournent significativement en PACA (50%+ des dépenses éligibles idéalement).",
    eligibility:
      "Sociétés de production indépendantes conventionnées CNC/Région Sud. Projet de long-métrage de fiction. Tournage ou post-production en PACA (Marseille, Aix, Nice, Avignon, etc.). Plan de financement avec diffuseurs.",
    amount: null,
    amountMin: 30000,
    amountMax: 300000,
    deadline: "15 avril 2026 et 30 septembre 2026",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.maregionsud.fr/vos-aides/detail/soutien-a-la-creation-et-a-la-production-de-long-metrage-de-fiction",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Fiction", "Long-métrage"],
    geographicZone: ["Provence-Alpes-Côte d'Azur"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Dépôt avant début production. Dépenses PACA valorisées (studios locaux, techniciens, hôtels). Marseille = pôle de production majeur (Belle-de-Mai, Friche). Cumul avec aide CNC après agrément.",
    status: "active",
  },
  {
    title: "Soutien création et production documentaire — Région Sud",
    organization: "Région Provence-Alpes-Côte d'Azur × CNC",
    description:
      "Volet DOCUMENTAIRE du fonds régional cinéma PACA. Soutient documentaires de création pour cinéma, TV, plateformes. PACA a un écosystème documentaire dense (FID Marseille, Primed, Sunny Side of the Doc à La Rochelle pas loin).",
    eligibility:
      "Sociétés de production PACA ou avec tournage/post-prod PACA. Projet documentaire avec diffuseur pré-engagé ou plan de diffusion solide. Budget de production détaillé.",
    amount: null,
    amountMin: 10000,
    amountMax: 100000,
    deadline: "15 avril 2026 et 30 septembre 2026",
    frequency: "2 sessions par an",
    isRecurring: true,
    url: "https://www.maregionsud.fr/vos-aides/detail/soutien-a-la-creation-et-a-la-production-doeuvres-documentaires",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire"],
    geographicZone: ["Provence-Alpes-Côte d'Azur"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    preparationAdvice:
      "Docs avec ancrage PACA (sujet local, diaspora, mémoire régionale) valorisés. Plan de festivals ou plateformes crédible. Moins concurrentiel que la fiction.",
    status: "active",
  },
  {
    title: "Soutien création et production animation — Région Sud",
    organization: "Région Provence-Alpes-Côte d'Azur × CNC",
    description:
      "Fonds animation du Région Sud en 3 volets : écriture, développement, production. PACA compte des studios d'animation importants (Angoulême voisine, Annecy pas loin). Cible les projets animation pour cinéma, TV, plateformes, web.",
    eligibility:
      "Auteurs / scénaristes / sociétés de production animation. Projet 2D, 3D, stop-motion, motion design, techniques mixtes. Tournage et post-prod PACA valorisés.",
    amount: null,
    amountMin: 10000,
    amountMax: 200000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.maregionsud.fr/vos-aides/detail/soutien-a-la-creation-et-a-la-production-doeuvres-danimation",
    grantType: ["Subvention", "Aide à l'écriture", "Aide au développement", "Aide à la production"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Animation", "Animation 2D", "Animation 3D"],
    geographicZone: ["Provence-Alpes-Côte d'Azur"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 30,
    preparationAdvice:
      "Écriture (script + storyboard initial) = entrée moins compétitive. Production = fortement compétitif. Studios PACA : Mikros Image Marseille, Atelier des Minimes, Cerbère Animations.",
    status: "active",
  },
  {
    title: "Soutien web-création — Région Sud",
    organization: "Région Provence-Alpes-Côte d'Azur",
    description:
      "Dispositif PACA dédié à la création web et numérique : web-séries, web-documentaires, contenus interactifs, expériences immersives web. Deux volets : bourse d'écriture (5 000 à 7 000 €) + aide à la production (10 000 à 30 000 €). Dispositif rare dédié à la création web.",
    eligibility:
      "Auteurs et sociétés de production basées ou actives en PACA. Projet de web-création avec dimension innovante (narration, techno, usage). Diffusion numérique ciblée.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.maregionsud.fr/vos-aides",
    grantType: ["Bourse", "Subvention", "Aide à l'écriture", "Aide à la production"],
    eligibleSectors: ["Web-création", "Arts numériques", "Web-série", "Web-documentaire", "Création immersive"],
    geographicZone: ["Provence-Alpes-Côte d'Azur"],
    structureSize: ["TPE", "PME", "Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Dispositif sous-utilisé par manque de visibilité — taux d'acceptation plus élevé que le cinéma classique. Innovation narrative ET/OU techno attendue. La post-prod interactive/immersive justifie les budgets plus élevés.",
    status: "active",
  },

  // ========== RÉGION OCCITANIE ==========
  {
    title: "FRACA — Aide à la création audiovisuelle (Occitanie)",
    organization: "Région Occitanie × CNC",
    description:
      "Fonds Régional d'Aide à la Création Audiovisuelle (FRACA) de la Région Occitanie. 4,6 M€ mobilisés en 2026 pour soutenir la filière audiovisuelle régionale. 3 volets : développement, production, diffusion. Couvre fiction longue, audiovisuelle (séries, téléfilms), documentaire, animation.",
    eligibility:
      "Sociétés de production audiovisuelle conventionnées CNC/Région Occitanie. Tournage et/ou post-production en Occitanie. Diffuseur engagé (préachat) pour les projets TV. Dossier via portail Région.",
    amount: null,
    amountMin: 20000,
    amountMax: 250000,
    deadline: "Animation : 1er fév / 1er juin 2026. Documentaire : 1er mai, 1er sept, 1er déc 2026. Fiction : 1er mai, 1er juil, 1er déc 2026",
    frequency: "Multi-sessions par an selon discipline",
    isRecurring: true,
    url: "https://www.laregion.fr/Cinema-Audiovisuel-Multimedia-Aide-a-la-creation-audiovisuelle",
    contactEmail: "film@laregion.fr",
    grantType: ["Subvention", "Aide au développement", "Aide à la production", "Aide à la diffusion"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Fiction", "Animation", "Documentaire", "Série"],
    geographicZone: ["Occitanie"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Deadlines différenciées par discipline — bien anticiper. Occitanie très active (3e région audiovisuelle France après IdF et PACA). Occitanie Films accompagne le montage. Cumul CNC + FRACA + diffuseur = socle classique.",
    status: "active",
  },
  {
    title: "Aide à l'écriture d'œuvres audiovisuelles — Occitanie",
    organization: "Région Occitanie",
    description:
      "Volet AMONT du FRACA : aide à l'écriture pour auteurs et scénaristes basés en Occitanie. Finance le temps d'écriture (synopsis, traitement, séquencier, dialogues). Distinct du soutien à la création (production) — cible en amont.",
    eligibility:
      "Auteurs et scénaristes professionnels basés en Occitanie (résidence principale). Projet audiovisuel en phase d'écriture (pas encore en pré-production). Dossier avec synopsis, note d'intention, CV.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.laregion.fr/Cinema-Audiovisuel-Multimedia-Aide-a-l-ecriture-d-oeuvres-audiovisuelles",
    grantType: ["Subvention", "Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Écriture", "Scénario"],
    geographicZone: ["Occitanie"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Aide individuelle auteur (pas production). Dispositif précieux pour temps d'écriture. Le dossier tient en 20-30 pages. Occitanie Films peut orienter vers les diffuseurs régionaux (France 3 Occitanie, ViàOccitanie) pour sécuriser le projet en aval.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 28 : ${WAVE.length} grants à insérer.\n`);

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
