/**
 * Vague 10 : départements majeurs absents.
 * Bouches-du-Rhône (13), Gironde (33), Rhône (69), Métropole de Lyon, Nord (59).
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== BOUCHES-DU-RHÔNE (13) ==========
  {
    title: "Aide à la création arts visuels — Bouches-du-Rhône",
    organization: "Conseil départemental des Bouches-du-Rhône",
    description:
      "Dispositif qui aide les artistes visuels et photographes vivant et travaillant dans les Bouches-du-Rhône à publier leur travail (catalogues, monographies, livres d'artistes). Plafond 15 000 € à hauteur de 50% des frais d'impression. Dispositif-clé pour la reconnaissance institutionnelle locale.",
    eligibility:
      "Artistes contemporains des arts visuels et/ou photographes vivant et travaillant dans les Bouches-du-Rhône. Projet de publication (catalogue, monographie, livre d'artiste). Partenariat éditeur/imprimeur formalisé.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "30 janvier 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.departement13.fr/nos-actions/culture/les-dispositifs/dispositifs-daide/",
    grantType: ["Subvention", "Aide à l'édition", "Aide à la création"],
    eligibleSectors: ["Arts visuels", "Photographie", "Arts plastiques", "Édition d'art"],
    geographicZone: ["Provence-Alpes-Côte d'Azur", "Bouches-du-Rhône"],
    maxFundingRate: 50,
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Dépôt sur plateforme GSU du Département. Mentionner « Aide à la création » en début de description. Envoi email du formulaire + n° dossier GSU avant le 30 janvier 2026 obligatoire.",
    status: "active",
  },
  {
    title: "Culture et lien social 2026 — Préfecture Bouches-du-Rhône",
    organization: "Préfecture des Bouches-du-Rhône",
    description:
      "Appel à projets transversal (État en département) couvrant tous les secteurs artistiques : arts visuels, design, architecture, théâtre, danse, livre, musique, patrimoine, cinéma, médias, journalisme. Focus sur la dimension inclusive et le lien social via la culture.",
    eligibility:
      "Associations, structures culturelles des Bouches-du-Rhône portant un projet ayant une dimension sociale explicite : publics empêchés, quartiers populaires, rural isolé, milieu hospitalier/carcéral, personnes âgées, migrants, etc.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "Consulter préfecture",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.bouches-du-rhone.gouv.fr/Publications/Appels-a-projets/Appel-a-projets-Culture-et-lien-social-2026",
    grantType: ["Appel à projets", "Subvention"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "Patrimoine", "Cinéma", "Médiation culturelle", "Inclusion"],
    geographicZone: ["Provence-Alpes-Côte d'Azur", "Bouches-du-Rhône"],
    structureSize: ["Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 45,
    status: "active",
  },

  // ========== GIRONDE (33) ==========
  {
    title: "Scènes d'été en Gironde — Appel à projets 2026",
    organization: "Conseil départemental de la Gironde",
    description:
      "Dispositif phare du Département 33 pour favoriser la tournée estivale d'œuvres artistiques en Gironde. Sélection de 20 spectacles par an (10 musique + 10 spectacle vivant) par un jury pro/élus. Les communes, intercommunalités et associations peuvent programmer les spectacles retenus à tarif préférentiel.",
    eligibility:
      "Associations culturelles loi 1901 avec au moins 1 an d'existence, siège en Gironde, licence d'entrepreneur de spectacles. Projet de spectacle diffusable en tournée été (mai-septembre).",
    amount: null,
    amountMin: 2000,
    amountMax: 8000,
    deadline: "Mai 2026 (appel pour été 2027)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.gironde.fr/associations/subventions/culture/scenes-d-ete-en-gironde",
    grantType: ["Subvention", "Aide à la diffusion", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Théâtre", "Danse", "Cirque", "Arts de la rue"],
    geographicZone: ["Nouvelle-Aquitaine", "Gironde"],
    structureSize: ["Association"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    annualBeneficiaries: 20,
    preparationAdvice:
      "Le dispositif fonctionne en 2 temps : sélection (via jury) puis diffusion (les communes choisissent parmi les retenus). Spectacle jouable en plein air / petites jauges. Prévoir un tarif de diffusion attractif.",
    status: "active",
  },
  {
    title: "Talents d'avance — Tremplin cirque (Gironde)",
    organization: "Conseil départemental de la Gironde",
    description:
      "Tremplin pour valoriser les jeunes artistes de cirque girondins (15-26 ans) : accompagnement professionnel, scène dédiée, mise en relation avec pros. Dispositif rare qui cible explicitement les jeunes circassiens — tranche sous-accompagnée.",
    eligibility:
      "Jeunes artistes de cirque de 15 à 26 ans vivant en Gironde. Pratique du cirque démontrable (formation en école, auto-apprentissage avec production). Projet de présentation scénique.",
    amount: null,
    amountMin: 1000,
    amountMax: 5000,
    deadline: "25 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.gironde.fr/culture/soutien-la-vie-culturelle-et-artistique",
    grantType: ["Bourse", "Accompagnement professionnel"],
    eligibleSectors: ["Cirque", "Arts de la piste", "Jeunesse", "Émergence"],
    geographicZone: ["Nouvelle-Aquitaine", "Gironde"],
    applicationDifficulty: "facile",
    acceptanceRate: 30,
    preparationAdvice:
      "Un des rares dispositifs cirque pour la jeunesse en France. Vidéo de présentation (3-5 min) souvent demandée. L'accompagnement pro post-sélection est souvent la vraie valeur (plus que la bourse cash).",
    status: "active",
  },

  // ========== RHÔNE (69) + MÉTROPOLE LYON ==========
  {
    title: "Rhône en scènes 2026 — Département du Rhône",
    organization: "Conseil départemental du Rhône",
    description:
      "Appel à projets qui soutient les festivals organisés sur le territoire du Rhône, hors métropole de Lyon. Objectif : irriguer culturellement les communes rurales et péri-urbaines du Rhône, en dehors de l'aimant lyonnais.",
    eligibility:
      "Organisateurs de festival (association, collectivité, EPCI) situés dans le Rhône hors Métropole de Lyon. Festival avec programmation artistique professionnelle et ancrage territorial.",
    amount: null,
    amountMin: 3000,
    amountMax: 20000,
    deadline: "15 février 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://figurespubliques.fr/region/departement-du-rhone-lappel-a-projets-rhone-en-scenes-2026-est-lance/",
    grantType: ["Subvention", "Aide au festival", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Théâtre", "Cirque", "Arts de la rue", "Festival"],
    geographicZone: ["Auvergne-Rhône-Alpes", "Rhône"],
    structureSize: ["Association", "Collectivité"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 50,
    preparationAdvice:
      "Deadline précoce (15 février). Attention : territoire STRICT — Lyon Métropole exclue. Les festivals ruraux et péri-urbains du Rhône (Beaujolais, Monts du Lyonnais, etc.) sont la cible.",
    status: "active",
  },
  {
    title: "Projets EAC ambitieux et inclusifs — Métropole de Lyon",
    organization: "Métropole de Lyon (Grand Lyon)",
    description:
      "Subventions de la Métropole de Lyon pour des projets d'éducation artistique et culturelle ambitieux et inclusifs, ciblant collèges, jeunesse, territoires fragiles. Dispositif EAC majeur pour l'aire lyonnaise (59 communes).",
    eligibility:
      "Structures culturelles et acteurs socio-culturels basés dans la Métropole de Lyon ou intervenant sur son territoire. Partenariats avec établissements scolaires (collèges notamment) ou structures jeunesse. Projet pluriannuel valorisé.",
    amount: null,
    amountMin: 5000,
    amountMax: 40000,
    deadline: "3 juin 2026",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.grandlyon.com/services/demande-de-subvention",
    grantType: ["Subvention", "Aide EAC", "Appel à projets"],
    eligibleSectors: ["Spectacle vivant", "Arts visuels", "Musique", "Littérature", "EAC", "Médiation culturelle"],
    geographicZone: ["Auvergne-Rhône-Alpes", "Rhône", "Métropole de Lyon"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 40,
    preparationAdvice:
      "Partenariat établissement scolaire OU structure jeunesse obligatoire. Projets ambitieux (plusieurs classes, plusieurs années scolaires) valorisés. Cumul avec DRAC et Région possible.",
    status: "active",
  },

  // ========== NORD (59) ==========
  {
    title: "Aide à la diffusion culturelle — Département du Nord",
    organization: "Département du Nord",
    description:
      "Dispositif départemental qui finance la diffusion de spectacles professionnels dans le Nord. Double mécanisme : agrément d'une production artistique (compagnies Nord/Pas-de-Calais) + aide à la diffusion pour les organisateurs (communes, associations). Plafond 3 000 € par spectacle. Couvre aussi les ateliers pédagogiques (2 par spectacle, 75% coûts plafonnés 150€).",
    eligibility:
      "Pour l'agrément : compagnies artistiques professionnelles du Nord ou Pas-de-Calais. Pour la diffusion : organisateurs occasionnels dans le Nord (communes, équipements publics, associations accueillant des publics prioritaires).",
    amount: null,
    amountMin: 500,
    amountMax: 3000,
    deadline: "1 mois avant date du spectacle",
    frequency: "Dépôts en continu",
    isRecurring: true,
    url: "https://services.lenord.fr/aide-a-la-diffusion-culturelle--demande-daide-financiere",
    contactEmail: "aidealadiffusion@lenord.fr",
    contactPhone: "03 59 73 55 97",
    grantType: ["Subvention", "Aide à la diffusion"],
    eligibleSectors: ["Spectacle vivant", "Musique", "Théâtre", "Danse", "Cirque", "Diffusion"],
    geographicZone: ["Hauts-de-France", "Nord"],
    structureSize: ["Association", "TPE", "Collectivité"],
    applicationDifficulty: "facile",
    acceptanceRate: 70,
    preparationAdvice:
      "Double porte d'entrée : la compagnie demande l'agrément, l'organisateur demande l'aide. Circuit bien rodé — contacter le Service Développement Culturel en amont. Particulièrement efficace pour les communes rurales du Nord.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 10 : ${WAVE.length} grants à insérer.\n`);

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
