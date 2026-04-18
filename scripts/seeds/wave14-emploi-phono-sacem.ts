/**
 * Vague 14 : FONPEPS (emploi spectacle) + CNM production phonographique
 * + SACEM accélérateur/développement + SPEDIDAM.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== FONPEPS — EMPLOI SPECTACLE ==========
  {
    title: "FONPEPS — AESP (Aide unique à l'embauche CDI-CDD spectacle)",
    organization: "Ministère du Travail / ASP (Agence de Services et de Paiement)",
    description:
      "Aide principale du FONPEPS qui soutient l'embauche en CDI ou CDD dans le secteur du spectacle (vivant ou enregistré, public ou privé). En 2026 : cap à 5 000 € pour 2e contrat (valeur nominale 9K), total employeur plafonné à 15 000 € / an. Dispositif structurant pour la consolidation des emplois dans le secteur.",
    eligibility:
      "Entreprises et associations relevant principalement des conventions collectives IDCC 3090 (spectacle vivant privé) ou IDCC 1285 (entreprises artistiques et culturelles). Ou : détention licence entrepreneur spectacles + affiliation Caisse des Congés Spectacles. Embauche CDI ou CDD > 4 mois.",
    amount: null,
    amountMin: 2000,
    amountMax: 15000,
    deadline: "Dépôts en continu (plateforme ASP)",
    frequency: "Annuel (jusqu'à 2028)",
    isRecurring: true,
    url: "https://www.asp.gouv.fr/aides/fonpeps-aide-unique-lembauche-en-contrat-duree-determinee-ou-indeterminee-dans-le-spectacle-aesp",
    grantType: ["Subvention", "Aide à l'emploi"],
    eligibleSectors: ["Spectacle vivant", "Spectacle enregistré", "Emploi culturel"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME", "Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 70,
    preparationAdvice:
      "ATTENTION : la plateforme ASP est temporairement fermée pour les contrats démarrant après le 01/01/2026 (réforme en cours). Réouverture annoncée avec délais étendus. Dispositif concret, automatique si les critères sont remplis — peu de sélection subjective.",
    status: "active",
  },
  {
    title: "FONPEPS — APAJ (Plateau artistique petites salles)",
    organization: "Ministère du Travail / ASP",
    description:
      "Aide au plateau artistique pour les spectacles diffusés dans de petites salles (jauge ≤ 300 places). Objectif : soutenir la diffusion scénique des artistes dans les lieux intermédiaires et indépendants, souvent fragiles économiquement.",
    eligibility:
      "Exploitants et producteurs de spectacles vivants diffusés dans des salles de petite jauge (≤ 300 places). Licence entrepreneur. Plateau artistique rémunéré (contrats intermittents) avec montant plancher à respecter.",
    amount: null,
    amountMin: 500,
    amountMax: 8000,
    deadline: "Dépôts en continu",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/fonds-national-pour-l-emploi-perenne-dans-le-spectacle-fonpeps",
    grantType: ["Subvention", "Aide à l'emploi", "Aide à la diffusion"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Théâtre", "Danse", "Lieux intermédiaires"],
    geographicZone: ["National"],
    structureSize: ["TPE", "Association"],
    applicationDifficulty: "facile",
    acceptanceRate: 75,
    preparationAdvice:
      "Dispositif peu connu mais très utile pour les lieux intermédiaires. Seuil de rémunération des artistes à respecter. Cumul possible avec AESP pour structurer ses emplois permanents.",
    status: "active",
  },
  {
    title: "FONPEPS — ADEP (Emploi enregistrement phonographique)",
    organization: "Ministère du Travail / ASP",
    description:
      "Volet FONPEPS dédié à l'emploi artistique dans les enregistrements phonographiques. Soutient les producteurs qui rémunèrent des artistes-interprètes (chanteurs, musiciens, chœurs) sur des sessions d'enregistrement en studio.",
    eligibility:
      "Producteurs phonographiques français employant des artistes-interprètes sur des sessions d'enregistrement. Contrats conformes à la convention collective phonographique. Structure avec SIRET.",
    amount: null,
    amountMin: 500,
    amountMax: 5000,
    deadline: "Dépôts en continu",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.culture.gouv.fr/catalogue-des-demarches-et-subventions/subvention/fonds-national-pour-l-emploi-perenne-dans-le-spectacle-fonpeps",
    grantType: ["Subvention", "Aide à l'emploi", "Aide à l'enregistrement"],
    eligibleSectors: ["Musique", "Enregistrement", "Phonographie"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME", "Association"],
    applicationDifficulty: "facile",
    acceptanceRate: 75,
    status: "active",
  },

  // ========== CNM ==========
  {
    title: "CNM — Aide à la production phonographique (sélective)",
    organization: "CNM — Centre National de la Musique",
    description:
      "Aide à la production phonographique pour les projets musiques actuelles, classique, contemporain. Finance location studio, sessions, mix, post-prod, mastering, création visuelle. Plafond 20 000 € / projet, 100 000 € / an par entité, 40% des dépenses éligibles. 6 sessions de dépôt en 2026.",
    eligibility:
      "Structures de production phonographique avec au moins 1 an d'existence, employeur des artistes, détenant les droits du master. Projet phonographique inédit, budget détaillé, plan de distribution identifié.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "15 janvier, 20 mars, 20 mai, 20 juillet, 30 sept, 1er oct 2026",
    frequency: "6 sessions par an",
    isRecurring: true,
    url: "https://cnm.fr/aides-financieres/aide-a-la-production-phonographique-3/",
    grantType: ["Subvention", "Aide à la production"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Classique", "Contemporain", "Phonographie"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME", "Association"],
    maxFundingRate: 40,
    coFundingRequired: "Oui - 60% minimum",
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Structure productrice (pas artiste individuel). Détention du master OBLIGATOIRE. Budget phono détaillé (studio, musiciens, mix, master, pochette). Le CNM valorise la prise de risque artistique : un projet formaté passe moins bien qu'un projet identifiable.",
    status: "active",
  },
  {
    title: "CNM — Aide automatique à la production phonographique",
    organization: "CNM — Centre National de la Musique",
    description:
      "Volet AUTOMATIQUE de l'aide à la production phono CNM : calcul sur la base des ventes/streams de l'année précédente, réinvestissable dans la production phono à venir. Mécanisme de péréquation entre succès commercial et soutien à la création.",
    eligibility:
      "Producteurs phonographiques ayant généré des ventes/streams significatifs l'année précédente. Demande de réinvestissement dans une nouvelle production phono. Structure éligible CNM (affiliation, etc.).",
    amount: null,
    amountMin: 5000,
    amountMax: 100000,
    deadline: "Dépôts en continu",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://cnm.fr/aides-financieres/aide-automatique-a-la-production-phonographique/",
    grantType: ["Subvention", "Aide automatique"],
    eligibleSectors: ["Musique", "Phonographie"],
    geographicZone: ["National"],
    structureSize: ["TPE", "PME"],
    applicationDifficulty: "Moyen",
    preparationAdvice:
      "Réservé aux producteurs avec un historique commercial. Le montant dépend de l'activité passée — consulter le CNM pour simuler. Mécanisme plus favorable aux labels établis qu'aux primo-producteurs.",
    status: "active",
  },

  // ========== SPEDIDAM ==========
  {
    title: "Spedidam — Aide au spectacle musical (diffusion)",
    organization: "SPEDIDAM — Société de Perception et de Distribution des Droits des Artistes-Interprètes",
    description:
      "Aide à la diffusion de spectacles musicaux vivants financée par les droits des artistes-interprètes. Peut cofinancer les coûts employeurs artistiques, les déplacements internationaux, ou les deux. Taux : max 40% du coût employeur total, qui doit atteindre au moins 6 000 €.",
    eligibility:
      "Personnes morales (associations, entreprises) employant des artistes-interprètes. Projet de diffusion musicale (concerts, tournée). Coût employeur total des salaires artistes ≥ 6 000 €. Dépôt via la plateforme ADEL.",
    amount: null,
    amountMin: 2400,
    amountMax: 30000,
    deadline: "Calendrier commissions Spedidam",
    frequency: "Plusieurs commissions par an",
    isRecurring: true,
    url: "https://www.spedidam.fr/aides-aux-projets/nos-programmes/aide-au-spectacle-musical/",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Musique", "Spectacle vivant musical", "Concerts", "Tournée"],
    geographicZone: ["National", "International"],
    structureSize: ["Association", "TPE", "PME"],
    maxFundingRate: 40,
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    preparationAdvice:
      "Seuil de 6K de coût employeur = dispositif plutôt pour compagnies établies (pas pour 1er concert solo). Plateforme ADEL obligatoire. Le cumul avec Adami sur le même projet est possible.",
    status: "active",
  },

  // ========== SACEM ==========
  {
    title: "Accélérateur de projets 2026-2027 — SACEM",
    organization: "SACEM",
    description:
      "Programme d'accompagnement destiné aux auteurs-compositeurs qui veulent structurer et développer un projet artistique/culturel. 20 lauréats sélectionnés pour l'édition 2026-2027. Accompagnement personnalisé (coaching, mise en réseau, expertise juridique et financière) à partir de septembre 2026.",
    eligibility:
      "Auteurs-compositeurs adhérents SACEM portant un projet de structuration de carrière ou de développement d'activité. Projet artistique OU culturel (incluant entrepreneuriat culturel). Trajectoire démontrée.",
    amount: null,
    amountMin: 0,
    amountMax: 8000,
    deadline: "16 février au 13 avril 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://aide-aux-projets.sacem.fr/",
    grantType: ["Accompagnement", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Musique", "Composition", "Entrepreneuriat culturel"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 20,
    preparationAdvice:
      "Pas une aide cash principalement — c'est un programme d'accompagnement + coaching sur ~12 mois. Valeur principale : mise en réseau et expertise. Dossier étudié entre mai et juin 2026, accompagnement lancé en septembre.",
    status: "active",
  },
  {
    title: "Tous en Live 2026 — SACEM",
    organization: "SACEM",
    description:
      "Dispositif de soutien à la programmation live des salles et bars de musiques actuelles. 200 € par concert ou spectacle, pour des événements tenus entre le 15 janvier et le 15 décembre 2026. Dispositif simple et direct pour encourager la diffusion dans les lieux intermédiaires.",
    eligibility:
      "Salles de concert, bars-concerts, cafés-cultures, petites scènes programmant régulièrement des auteurs-compositeurs adhérents SACEM. Au moins 1 concert par mois dans une programmation musicale live cohérente.",
    amount: 200,
    deadline: "Dépôt par concert (15 janvier au 15 décembre 2026)",
    frequency: "Continu sur l'année",
    isRecurring: true,
    url: "https://www.bar-bars.com/tous-en-live-2026-dispositif-daide-sacem/",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Lieux de diffusion"],
    geographicZone: ["National"],
    structureSize: ["TPE", "Association"],
    applicationDifficulty: "facile",
    acceptanceRate: 80,
    preparationAdvice:
      "Aide par concert (200€) — peu par unité mais volume cumulable. Idéal pour un bar qui programme 40 concerts/an = 8K€. Dépôt simple sur plateforme SACEM. Compatible avec programmation SACD/Adami/Spedidam sur le même concert.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 14 : ${WAVE.length} grants à insérer.\n`);

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
