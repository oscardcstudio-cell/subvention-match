/**
 * Vague 18 : Prix Emerige + SCAM Brouillon d'un rêve + Prix AWARE.
 *
 * Note : en wave 17 j'avais mis un "Brouillon d'un rêve - Fondation
 * Beaumarchais-SACD" pour le documentaire. C'est en fait un dispositif
 * SCAM (Société civile des auteurs multimédia), pas SACD-Beaumarchais.
 * Les dispositifs SCAM sont référencés proprement ici.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== RÉVÉLATIONS EMERIGE ==========
  {
    title: "Bourse Révélations Emerige — Groupe Emerige",
    organization: "Groupe Emerige",
    description:
      "Programme tremplin pour la jeune scène artistique française, en partenariat avec une galerie de renommée internationale (change chaque édition). 12 artistes sélectionnés chaque année, commissariat de Gaël Charbau, exposition collective à Paris à l'automne. Le LAURÉAT reçoit 15 000 € + studio pendant 1 an + exposition personnelle à la galerie partenaire l'année suivante.",
    eligibility:
      "Artistes français vivant et travaillant en France, âgés de 35 ans MAX (inclus), NON REPRÉSENTÉS par une galerie. Discipline arts visuels/contemporains. Dossier avec portfolio, CV, note d'intention.",
    amount: 15000,
    deadline: "Consulter revelations-emerige.com (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://revelations-emerige.com/",
    grantType: ["Prix", "Bourse", "Aide à l'émergence"],
    eligibleSectors: ["Arts visuels", "Arts contemporains", "Émergence"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 3,
    annualBeneficiaries: 12,
    preparationAdvice:
      "Critère ferme : PAS REPRÉSENTÉ par une galerie. Un artiste en galerie est inéligible, même débutant. Les 12 sélectionnés ont déjà un très fort bénéfice (expo collective Paris, commissaire prestigieux, médias). 1 seul gagne le prix cash. Rare mais transformateur pour la carrière.",
    status: "active",
  },

  // ========== SCAM — BROUILLON D'UN RÊVE ==========
  {
    title: "Brouillon d'un rêve — Documentaire (Repérages) — SCAM",
    organization: "SCAM — Société civile des auteurs multimédia",
    description:
      "Bourse de recherche documentaire de la SCAM. Finance la phase amont : repérages, recherche documentaire, entretiens préparatoires, production d'un teaser. 2 500 € versés directement à l'auteur.e. Sessions récurrentes 6 fois par an (2e mercredi de janvier, mars, mai, juillet, septembre, novembre).",
    eligibility:
      "Auteur.e.s de documentaires (français ou résidents en France). Projet de documentaire de création ou d'essai sous forme unitaire (court, moyen ou long). Destiné à la TV ou cinéma. Adhésion SCAM non obligatoire mais encouragée.",
    amount: 2500,
    deadline: "6 sessions par an (2e mercredi de chaque mois impair)",
    frequency: "Bimestriel",
    isRecurring: true,
    url: "https://www.lascam.fr/lessentiel/bourses-brouillon-dun-reve/brouillon-dun-reve-documentaire/",
    grantType: ["Bourse", "Aide à la recherche", "Aide à l'écriture"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire", "Écriture"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 25,
    annualBeneficiaries: 90,
    preparationAdvice:
      "ACCESSIBLE — beaucoup de sessions, taux raisonnable. Idéal pour un premier projet documentaire. Le dossier tient en 10-15 pages : synopsis, note d'intention, notes de repérage, éléments visuels. Cumulable avec Brouillon d'un rêve Écriture (2e étape).",
    status: "active",
  },
  {
    title: "Brouillon d'un rêve — Documentaire (Écriture) — SCAM",
    organization: "SCAM — Société civile des auteurs multimédia",
    description:
      "Volet 2 du Brouillon d'un rêve SCAM : bourse d'écriture continuation, après les repérages. 2 500 € à 6 000 € pour finaliser le scénario documentaire après la phase de recherche. Permet de sortir de la logique « format TV imposé » en donnant du temps d'écriture libre.",
    eligibility:
      "Auteur.e.s ayant généralement bénéficié de la bourse Repérages (pas obligatoire mais fréquent). Projet documentaire avec traitement avancé. Éléments déjà tournés ou maquettés. Note d'intention aboutie.",
    amount: null,
    amountMin: 2500,
    amountMax: 6000,
    deadline: "6 sessions par an (2e mercredi de chaque mois impair)",
    frequency: "Bimestriel",
    isRecurring: true,
    url: "https://www.lascam.fr/lessentiel/bourses-brouillon-dun-reve/brouillon-dun-reve-documentaire/",
    grantType: ["Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Cinéma", "Audiovisuel", "Documentaire", "Écriture"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 20,
    annualBeneficiaries: 40,
    preparationAdvice:
      "Étape 2 (après Repérages). Le dossier doit démontrer la progression depuis la phase recherche. Traitement détaillé avec structure, arcs, personnages. Parfois précédé d'une session de mentorat (pour 1 projet/an).",
    status: "active",
  },
  {
    title: "Brouillon d'un rêve — Sonore — SCAM",
    organization: "SCAM — Société civile des auteurs multimédia",
    description:
      "Volet SCAM dédié à la création sonore : podcast, fiction radio, documentaire sonore, créations audio. Un des rares dispositifs qui rémunère spécifiquement l'écriture de création sonore (en dehors des commandes Radio France).",
    eligibility:
      "Auteur.e.s de création sonore (podcast, documentaire audio, fiction radio, art sonore). Projet original avec trame narrative. Éléments sonores ou maquette (optionnel).",
    amount: null,
    amountMin: 2500,
    amountMax: 6000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.scam.fr/lessentiel/bourses-brouillon-dun-reve/brouillon-dun-reve-sonore/",
    grantType: ["Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Radio", "Podcast", "Création sonore", "Documentaire sonore", "Fiction radio"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 25,
    preparationAdvice:
      "Essor du podcast / création sonore — ce dispositif accompagne la tendance. Fournir un traitement clair + extraits sonores (teaser ou références). Les projets d'art sonore avec une forme innovante sont valorisés.",
    status: "active",
  },
  {
    title: "Brouillon d'un rêve — Journalisme — SCAM",
    organization: "SCAM — Société civile des auteurs multimédia",
    description:
      "Bourse pour le journalisme narratif / grand reportage. Soutient les enquêtes longues, les reportages au long cours, les projets transmédia journalistiques (écrit + photo + son + vidéo).",
    eligibility:
      "Journalistes professionnels (carte de presse ou justificatifs équivalents). Projet de grand reportage ou enquête longue durée. Angle original et méthodologie rigoureuse.",
    amount: null,
    amountMin: 2500,
    amountMax: 6000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.scam.fr/lessentiel/bourses-brouillon-dun-reve/brouillon-dun-reve-journalisme/",
    grantType: ["Bourse", "Aide à l'enquête"],
    eligibleSectors: ["Journalisme", "Grand reportage", "Enquête"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    preparationAdvice:
      "Dispositif RARE dédié au journalisme au long cours. Dossier avec angle précis, enquête préliminaire, sources identifiées, calendrier. Un appui éditorial (rédacteur en chef, directeur de publication) engagé est un atout.",
    status: "active",
  },
  {
    title: "Brouillon d'un rêve — Écritures et formes émergentes — SCAM",
    organization: "SCAM — Société civile des auteurs multimédia",
    description:
      "Volet SCAM dédié aux écritures hybrides, transmédia, numériques, performatives. Soutient les projets qui ne rentrent pas dans les catégories classiques (documentaire TV, fiction, radio). Formes de narration innovantes, dispositifs immersifs, web-créations.",
    eligibility:
      "Auteur.e.s de formes émergentes (écriture transmédia, art numérique narratif, web-création, performance documentaire). Projet avec dimension expérimentale explicite. Capacité technique ou partenariats techniques.",
    amount: null,
    amountMin: 2500,
    amountMax: 6000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.lascam.fr/lessentiel/bourses-brouillon-dun-reve/brouillon-dun-reve-ecritures-et-formes-emergentes/",
    grantType: ["Bourse", "Aide à l'écriture"],
    eligibleSectors: ["Arts numériques", "Écriture transmédia", "Performance", "Web-création"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 25,
    preparationAdvice:
      "Pour les projets qui échappent aux cases. Argumenter la dimension EXPÉRIMENTALE (pas juste « on fait un doc en VR »). Les projets qui articulent narration + technologie + expérience usager passent mieux.",
    status: "active",
  },

  // ========== PRIX AWARE ==========
  {
    title: "Prix AWARE — Femmes et personnes non-binaires artistes",
    organization: "AWARE × Centre Pompidou (depuis 2026)",
    description:
      "Prix dédié aux artistes femmes et non-binaires contemporaines (créé 2016). 10e anniversaire en 2026, première édition au Centre Pompidou (AWARE a rejoint le musée en janvier 2026). 3 catégories : artiste confirmée, artiste émergente, artiste à redécouvrir. Reconnaissance institutionnelle majeure.",
    eligibility:
      "Artistes femmes OU personnes non-binaires contemporaines, sans critère de nationalité. Pratiques en arts visuels. 3 catégories selon trajectoire (confirmée, émergente, à redécouvrir). Candidature directe ou par prescripteur.",
    amount: null,
    amountMin: 5000,
    amountMax: 25000,
    deadline: "Édition 2026 — consulter awarewomenartists.com",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://awarewomenartists.com/en/prix_aware/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Arts visuels", "Arts contemporains"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 3,
    preparationAdvice:
      "Depuis 2026, prix intégré au Centre Pompidou — prestige accru. La catégorie « artiste à redécouvrir » (pour artistes de + de 60 ans dont l'œuvre a été invisibilisée) est une voie unique pour celles dont la reconnaissance a été freinée. Dossier solide avec contextualisation critique.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 18 : ${WAVE.length} grants à insérer.\n`);

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
