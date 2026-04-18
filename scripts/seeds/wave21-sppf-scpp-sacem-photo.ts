/**
 * Vague 21 : SPPF / SCPP (producteurs phono) + SACEM compléments + prix
 * photo femmes/humanitaire.
 *
 * Dispositifs repérés via aggrégateurs (aidesmusiquesactuelles.fr,
 * ellesfontla.culture.gouv.fr) — sortes de trous que les recherches
 * par organisme n'avaient pas remontés.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== SPPF — PRODUCTEURS PHONO INDÉPENDANTS ==========
  {
    title: "SPPF — Aide à l'enregistrement d'album",
    organization: "SPPF — Société civile des Producteurs de Phonogrammes en France",
    description:
      "Aide sélective de la SPPF pour les producteurs phonographiques indépendants associés. Couvre l'enregistrement d'albums d'au moins 3 titres inédits (lives, remixes et compilations exclus). Complémentaire CNM. La SPPF représente les producteurs indé, la SCPP représente les majors.",
    eligibility:
      "Producteur de l'album + associé SPPF, ou en licence exclusive avec un associé SPPF, ou mandat de gestion à un associé SPPF. Label doit avoir déjà produit au moins 1 album avec distribution commerciale. Album de 3+ titres inédits.",
    amount: null,
    amountMin: 5000,
    amountMax: 25000,
    deadline: "26 février 2026 (puis sessions régulières)",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.sppf.com/subventions/creation-production/",
    grantType: ["Subvention", "Aide à l'enregistrement"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Phonographie", "Production"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Sociétariat SPPF préalable OBLIGATOIRE (gratuit pour les labels indé). Présenter le dossier AVANT commercialisation. Aide supplémentaire depuis 2022 pour TPE (<10 salariés, CA <2M) pour verser GRM (Garantie de Rémunération Minimale) aux artistes. Cumul avec CNM possible.",
    status: "active",
  },
  {
    title: "SPPF — Aide à la vidéomusique",
    organization: "SPPF — Société civile des Producteurs de Phonogrammes en France",
    description:
      "Aide sélective SPPF pour la production de clips et vidéomusiques accompagnant les sorties phonographiques des labels indé associés. Couvre réalisation, post-production, traitement d'image. Format traditionnel (clip) ou formes hybrides (court-métrage musical, lyric video premium).",
    eligibility:
      "Producteur phonographique associé SPPF. Vidéomusique liée à un album en cours de sortie ou récemment sorti. Budget détaillé production, plan de diffusion (YouTube, plateformes, festivals clips).",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "26 février 2026 (puis sessions régulières)",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.sppf.com/subventions/creation-production/",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Musique", "Audiovisuel", "Clip", "Vidéomusique"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    status: "active",
  },
  {
    title: "SPPF — Aide Promo/Marketing",
    organization: "SPPF — Société civile des Producteurs de Phonogrammes en France",
    description:
      "Aide à la promotion et au marketing d'un album ou d'un artiste pour les labels indé SPPF. Finance les campagnes de communication, achats média, relations presse, community management, supports imprimés. Complément d'une aide à la production (SPPF ou CNM).",
    eligibility:
      "Label associé SPPF. Album en sortie récente ou à venir. Plan promo détaillé (publics cibles, canaux, KPI). Budget marketing chiffré.",
    amount: null,
    amountMin: 2000,
    amountMax: 10000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.sppf.com/subventions/creation-production/",
    grantType: ["Subvention", "Aide au marketing"],
    eligibleSectors: ["Musique", "Marketing musical", "Promotion"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    status: "active",
  },
  {
    title: "SPPF — Aide Showcase",
    organization: "SPPF — Société civile des Producteurs de Phonogrammes en France",
    description:
      "Aide spécifique pour les showcases et mini-concerts promotionnels des labels indé SPPF. Finance les dates dédiées au développement d'un artiste (sélections festivals pros, MIDEM, Transmusicales tremplin, showcases BIS, etc.).",
    eligibility:
      "Label associé SPPF. Artiste en développement du catalogue. Showcase dans un contexte professionnel identifié (salon, festival tremplin, convention musicale).",
    amount: null,
    amountMin: 1000,
    amountMax: 5000,
    deadline: "Sessions régulières",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.sppf.com/subventions/creation-production/",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Showcase", "Export"],
    geographicZone: ["National", "International"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "facile",
    acceptanceRate: 55,
    status: "active",
  },

  // ========== SCPP ==========
  {
    title: "SCPP — Aides aux vidéomusiques",
    organization: "SCPP — Société Civile des Producteurs Phonographiques",
    description:
      "La SCPP représente les producteurs phonographiques français (principalement les majors Universal/Sony/Warner + indépendants). Aides à la production de vidéomusiques (clips) pour les sorties du catalogue des associés.",
    eligibility:
      "Producteur phonographique associé SCPP. Vidéomusique liée à un album en cours. Budget de production détaillé, plan de diffusion digital.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "27 février 2026 (puis sessions régulières)",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.scpp.fr/",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Musique", "Audiovisuel", "Clip", "Vidéomusique"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME", "ETI"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "SCPP = majors principalement mais indé aussi. Adhésion SCPP nécessaire. Dispositif complémentaire de SPPF (ne pas candidater aux deux simultanément sur le même clip).",
    status: "active",
  },
  {
    title: "SCPP — Aides aux showcases",
    organization: "SCPP — Société Civile des Producteurs Phonographiques",
    description:
      "Aide de la SCPP aux showcases des artistes du catalogue des associés. Finance les prestations de concerts promotionnels, sélections tremplin, conventions, festivals showcase (Transmusicales, MaMA, MIDEM).",
    eligibility:
      "Producteur phonographique associé SCPP. Showcase dans un contexte professionnel. Artiste du catalogue en phase de développement.",
    amount: null,
    amountMin: 1000,
    amountMax: 8000,
    deadline: "27 février 2026 (puis sessions régulières)",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.scpp.fr/",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Showcase"],
    geographicZone: ["National", "International"],
    structureSize: ["TPE", "PME", "ETI"],
    applicationDifficulty: "facile",
    acceptanceRate: 55,
    status: "active",
  },

  // ========== SACEM COMPLÉMENTS ==========
  {
    title: "Aide aux salles et lieux de diffusion de musiques actuelles — SACEM",
    organization: "SACEM",
    description:
      "Soutien SACEM aux salles de concert, SMAC, cafés-cultures et bars-concerts pour leur programmation musiques actuelles. Complément du dispositif « Tous en Live » (200€/concert) pour les structures plus importantes. Objectif : maintenir une programmation d'auteurs-compositeurs SACEM dans le maillage territorial.",
    eligibility:
      "Salles de concert, SMAC, cafés-cultures avec licence entrepreneur spectacles. Programmation musicale avec auteurs-compositeurs SACEM régulière. Structure juridique formalisée.",
    amount: null,
    amountMin: 3000,
    amountMax: 25000,
    deadline: "15 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://aide-aux-projets.sacem.fr/",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Lieux de diffusion", "SMAC"],
    geographicZone: ["National"],
    structureSize: ["TPE", "Association", "SMAC"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 60,
    status: "active",
  },
  {
    title: "Aide aux festivals de musiques actuelles et jeune public — SACEM",
    organization: "SACEM",
    description:
      "Aide SACEM dédiée aux festivals de musiques actuelles (toutes esthétiques) et aux festivals musique jeune public. Finance la programmation d'auteurs-compositeurs SACEM (cachets, promo, conditions d'accueil). Complémentaire des aides régionales et Ministère festivals.",
    eligibility:
      "Festivals de musiques actuelles ou jeune public avec programmation régulière (édition annuelle ou biennale). Structure porteuse formalisée. Programmation avec auteurs SACEM significative.",
    amount: null,
    amountMin: 3000,
    amountMax: 30000,
    deadline: "15 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://aide-aux-projets.sacem.fr/",
    grantType: ["Subvention", "Aide au festival"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Jeune public", "Festival"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 55,
    preparationAdvice:
      "Cumul avec « Soutien aux festivals » du Ministère de la Culture possible. La SACEM regarde la part de répertoire SACEM dans la programmation — plus elle est élevée, meilleures les chances.",
    status: "active",
  },
  {
    title: "Aide à la création de spectacle musical — SACEM",
    organization: "SACEM",
    description:
      "Aide SACEM pour la création de spectacles musicaux originaux : comédies musicales, spectacles vivants musicaux, créations originales. Cible la création d'œuvres originales d'auteurs-compositeurs SACEM destinées à la scène.",
    eligibility:
      "Auteurs-compositeurs adhérents SACEM + structure de production SV (licence entrepreneur). Projet de création ORIGINALE pour la scène (pas une reprise). Budget de création détaillé avec part musicale identifiée.",
    amount: null,
    amountMin: 5000,
    amountMax: 25000,
    deadline: "19 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://aide-aux-projets.sacem.fr/",
    grantType: ["Subvention", "Aide à la création"],
    eligibleSectors: ["Musique", "Spectacle musical", "Comédie musicale", "Création"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Distinct de l'aide à la production phono — cible la SCÈNE (pas le disque). Les comédies musicales originales, opéras-rock, créations jeune public musicales sont éligibles. Cumul avec SACD Musique de scène possible.",
    status: "active",
  },

  // ========== PHOTOGRAPHIE FEMMES / HUMANITAIRE ==========
  {
    title: "Bourse Canon de la Femme Photojournaliste",
    organization: "Canon × Visa pour l'Image Perpignan",
    description:
      "Bourse internationale dédiée aux femmes photojournalistes pour financer un reportage en cours. 8 000 € de dotation + exposition au festival Visa pour l'Image de Perpignan (référence mondiale du photojournalisme). Partenariat Canon France × Visa pour l'Image.",
    eligibility:
      "Femmes photojournalistes professionnelles. Projet de reportage en cours ou à démarrer. Dossier avec portfolio, note d'intention, calendrier de réalisation, budget.",
    amount: 8000,
    deadline: "Mai (appel annuel, consulter visapourlimage.com)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.visapourlimage.com/fr/prix-et-bourses",
    grantType: ["Bourse", "Prix"],
    eligibleSectors: ["Photographie", "Photojournalisme"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Visa pour l'Image = référence mondiale — exposition sur place = visibilité énorme dans le milieu. Le sujet doit être à forte ambition journalistique (actualité, droits humains, environnement, guerre, genre). Un photographe soutenu gagne 3-5 fois l'effet du prix en contrats post-expo.",
    status: "active",
  },
  {
    title: "Visa d'or humanitaire du CICR — Visa pour l'Image",
    organization: "CICR (Comité International de la Croix-Rouge) × Visa pour l'Image",
    description:
      "Prix dédié à un reportage photographique à caractère humanitaire, soutenu par le CICR et Visa pour l'Image Perpignan. 8 000 € + exposition au festival + visibilité CICR. Thème contextualisé chaque année (conflits, catastrophes, déplacés, famine).",
    eligibility:
      "Photojournalistes professionnels ayant produit un reportage à caractère humanitaire dans l'année écoulée. Travail publié dans un media reconnu OU non-publié mais abouti. Sujet cohérent avec mission CICR.",
    amount: 8000,
    deadline: "Mai (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.visapourlimage.com/fr/prix-et-bourses",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Photographie", "Photojournalisme", "Humanitaire"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 3,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Sujet OBLIGATOIREMENT humanitaire (conflits, crises, droits humains, catastrophes). Dossier avec 15-25 images + texte + contextualisation. Le CICR valorise l'éthique du reportage (consentement, respect dignité). Reconnaissance institutionnelle majeure au-delà du prix.",
    status: "active",
  },
  {
    title: "Inge Morath Award — Magnum Foundation (femmes/non-binaires photo)",
    organization: "Magnum Foundation × Inge Morath Foundation",
    description:
      "Prix international dédié aux photographes femmes et personnes non-binaires de moins de 30 ans. 7 500 $ pour soutenir un projet en cours. Héritage d'Inge Morath (première femme de l'agence Magnum). Visibilité internationale majeure dans le circuit photo pro.",
    eligibility:
      "Photographes femmes OU personnes non-binaires, moins de 30 ans. Projet documentaire ou artistique en cours. Dossier en anglais, portfolio + statement + budget.",
    amount: 6800,
    deadline: "30 avril (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://magnumfoundation.org/inge-morath-award/",
    grantType: ["Prix", "Bourse"],
    eligibleSectors: ["Photographie", "Documentaire", "Photojournalisme"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 3,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Critère de -30 ans strict. Dossier en anglais obligatoire. La Magnum Foundation valorise les projets à longue haleine, avec engagement éthique et artistique. Heritage d'Inge Morath = projets qui questionnent le genre, le regard, l'humain.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 21 : ${WAVE.length} grants à insérer.\n`);

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
