/**
 * Vague 11 : résidences internationales prestigieuses + BD + métiers d'art.
 *
 * Disciplines connexes souvent oubliées :
 * - Résidences grand prestige (Villa Médicis, Villa Kujoyama)
 * - BD (Cité internationale Angoulême)
 * - Métiers d'art (Bettencourt, Banque Populaire)
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== VILLA MÉDICIS ==========
  {
    title: "Résidence Villa Médicis — Académie de France à Rome",
    organization: "Académie de France à Rome — Villa Médicis",
    description:
      "Un des programmes de résidence les plus prestigieux pour artistes et chercheurs francophones. 16 lauréats par an sélectionnés pour 12 mois de résidence à Rome (septembre à août). Couvre toutes disciplines : musique, littérature, architecture, design, arts visuels, chorégraphie, mise en scène, histoire de l'art, restauration. Bourse + logement + atelier + bureau.",
    eligibility:
      "Artistes, écrivains ou chercheurs confirmés. Maîtrise du français requise. Pas de critère de nationalité. Toutes disciplines artistiques et de recherche en histoire de l'art / restauration. Projet de création, recherche ou expérimentation à développer à Rome sur 12 mois.",
    amount: null,
    amountMin: 30000,
    amountMax: 60000,
    deadline: "15 octobre 2025 (pour résidence 2026-2027)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://villamedici.it/en/residencies/",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Musique", "Littérature", "Architecture", "Design", "Danse", "Mise en scène", "Histoire de l'art", "Restauration"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 3,
    annualBeneficiaries: 16,
    preparationAdvice:
      "Sélectivité extrême. Pré-sélection sur dossier, puis audition (oral). CV de haut vol attendu — rarement primo-accédant à ce niveau. Le dossier doit articuler finement pourquoi ROME et pourquoi MAINTENANT. Cumulable avec aides régionales françaises pendant la résidence.",
    status: "active",
  },

  // ========== VILLA KUJOYAMA ==========
  {
    title: "Résidence Villa Kujoyama — Institut français × Bettencourt (Kyoto)",
    organization: "Institut français du Japon × Fondation Bettencourt Schueller",
    description:
      "Première résidence artistique multidisciplinaire française en Asie, à Kyoto (mont Higashiyama). Soutenue par la Fondation Bettencourt Schueller comme mécène principal. 13 projets par 18 artistes accueillis chaque année, résidences de 4 à 6 mois. Axe : recherche artistique nécessitant immersion japonaise.",
    eligibility:
      "Artistes, créateurs ou scientifiques confirmés (solo ou duo artiste + scientifique). Projet de recherche original nécessitant une immersion au Japon, avec lien explicite avec les enjeux locaux. Capacité à établir un dialogue avec les réseaux pro/académiques/culturels de Kyoto et du Kansai.",
    amount: null,
    amountMin: 15000,
    amountMax: 30000,
    deadline: "Consulter villakujoyama.jp (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://villakujoyama.jp/en/",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Design", "Arts numériques", "Création immersive", "Métiers d'art", "Musique", "Littérature", "Curation"],
    geographicZone: ["International", "Japon"],
    applicationDifficulty: "difficile",
    acceptanceRate: 8,
    annualBeneficiaries: 18,
    preparationAdvice:
      "Projet doit avoir un LIEN FORT avec le Japon/Kyoto — pas juste « je veux visiter ». Méthodologie de recherche détaillée, interlocuteurs japonais identifiés (laboratoires, institutions, artisans), livrables précis. Le duo artiste + scientifique est valorisé. Sélection très compétitive.",
    status: "active",
  },

  // ========== BANDE DESSINÉE — ANGOULÊME ==========
  {
    title: "Résidence Maison des auteurs — Cité internationale de la bande dessinée (Angoulême)",
    organization: "Cité internationale de la bande dessinée et de l'image (Angoulême)",
    description:
      "La Maison des auteurs à Angoulême accueille en résidence permanente des auteurs de BD, illustration, cinéma d'animation du monde entier. Studio de travail, mutualisation avec pairs, accès aux archives et bibliothèque de la Cité. Un des écosystèmes BD les plus importants d'Europe.",
    eligibility:
      "Auteurs de bande dessinée, illustrateurs, scénaristes, auteurs cinéma d'animation. Projet de création en cours nécessitant du temps dédié. Niveau professionnel démontré (au moins 1 publication).",
    amount: null,
    amountMin: 5000,
    amountMax: 15000,
    deadline: "Sessions régulières — consulter citebd.org",
    frequency: "Plusieurs sessions par an",
    isRecurring: true,
    url: "https://www.citebd.org/venir-a-la-cite/la-maison-des-auteurs",
    grantType: ["Résidence", "Bourse"],
    eligibleSectors: ["Bande dessinée", "Illustration", "Cinéma d'animation", "Scénario", "Édition"],
    geographicZone: ["Nouvelle-Aquitaine", "National", "International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 20,
    preparationAdvice:
      "Studio à Angoulême — nécessite disponibilité pour être sur place. Écosystème exceptionnel : proximité avec 200+ auteurs, accès éditeurs (Festival d'Angoulême), formations possibles. Cumulable avec bourses CNL et régions.",
    status: "active",
  },
  {
    title: "Résidence BD — Villa Médicis × Cité BD × ADAGP",
    organization: "Villa Médicis × Cité internationale de la bande dessinée × ADAGP",
    description:
      "Résidence spécifique BD mise en place conjointement par l'Académie de France à Rome (Villa Médicis) et la Maison des auteurs d'Angoulême, avec le soutien de l'ADAGP. Un auteur expérimenté alterne 2 mois à Rome et 2 mois à Angoulême pour concevoir un projet BD innovant. Dotation mensuelle + transport.",
    eligibility:
      "Auteurs expérimentés de bande dessinée (au moins 3 albums publiés, reconnaissance professionnelle). Projet BD innovant pensé pour exploiter le dialogue Rome / Angoulême. Dossier avec portfolio, synopsis, note d'intention.",
    amount: null,
    amountMin: 8000,
    amountMax: 12000,
    deadline: "Consulter adagp.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adagp.fr/en/support-artistic-creation/direct-aid-artists/residencies/cite-bd-adagp-villa-medicis-residency",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Bande dessinée", "Illustration"],
    geographicZone: ["National", "International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 1,
    preparationAdvice:
      "2 000 €/mois + transport Rome (1 000€) et Angoulême (400€). Prestige Villa Médicis couplé à l'accompagnement Cité BD — très demandé. Projet doit justifier les DEUX lieux (pas juste pour le prestige romain).",
    status: "active",
  },
  {
    title: "Résidence croisée BD Angoulême-Bilbao-Québec",
    organization: "CALQ × Cité BD Angoulême × Azkuna Zentroa Bilbao",
    description:
      "Résidence tri-partite portée par le Conseil des arts et des lettres du Québec, la Cité internationale de la bande dessinée d'Angoulême et l'Azkuna Zentroa de Bilbao. 3 auteurs BD (1 français, 1 espagnol, 1 québécois) en résidence successive dans les 3 villes de fin janvier à fin avril. Bourse 4 500 € brut.",
    eligibility:
      "Auteur.e.s de BD français.e.s avec au moins 1 publication professionnelle. Projet BD avec dimension de dialogue international. Disponibilité totale de fin janvier à fin avril 2026 pour voyager successivement Angoulême / Bilbao / Québec.",
    amount: 4500,
    deadline: "Consulter citebd.org",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.citebd.org/residence-croisee-de-bande-dessinee-angouleme-bilbao-et-quebec",
    grantType: ["Résidence", "Bourse", "Appel à candidatures"],
    eligibleSectors: ["Bande dessinée", "Illustration"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Disponibilité 3 mois en continu obligatoire (janv-avril). Projet à dimension trans-culturelle. Bourse 4.5K brut peu généreuse mais l'impact réseau/CV est majeur. Cumul difficile avec activité rémunérée pendant la résidence.",
    status: "active",
  },

  // ========== MÉTIERS D'ART ==========
  {
    title: "Prix Liliane Bettencourt pour l'Intelligence de la Main",
    organization: "Fondation Bettencourt Schueller",
    description:
      "Prix majeur dédié aux métiers d'art français, créé en 1999. 3 catégories : Talents d'exception (artisans confirmés), Dialogues (artisan × artiste/designer), Parcours (accompagnement trajectoire). Dotation + accompagnement + visibilité média. 2026 met la Belgique à l'honneur.",
    eligibility:
      "Artisans d'art, maîtres d'art travaillant en France. Savoir-faire d'exception démontré (œuvres, ateliers, reconnaissance pairs). Pour Dialogues : duo artisan + artiste ou designer. Pour Parcours : trajectoire émergente.",
    amount: null,
    amountMin: 10000,
    amountMax: 50000,
    deadline: "16 mars 2026 (Talents d'exception & Dialogues)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationbs.org/fr/ce-que-nous-faisons/arts/metiers-dart/le-prix-liliane-bettencourt-pour-lintelligence-de-la-main",
    grantType: ["Prix", "Bourse", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Métiers d'art", "Artisanat d'art", "Céramique", "Textile", "Verrerie", "Métallerie", "Reliure", "Ébénisterie"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Dossier très visuel (photos HD des œuvres, vidéo du geste, atelier). Pour Dialogues : argumenter le vrai sens du duo (pas juste « on met 2 noms »). La Fondation Bettencourt est un tremplin de notoriété exceptionnel pour les métiers d'art.",
    status: "active",
  },
  {
    title: "Bourse Artisanat d'art — Fondation Banque Populaire",
    organization: "Fondation Banque Populaire",
    description:
      "Depuis 2015, la Fondation BP soutient les artisans d'art avec un programme de bourse et d'accompagnement sur 1 à 3 ans. 100+ lauréats à ce jour. Finance développement d'activité, outillage, formation, communication. Réseau d'alumni actif comme valeur ajoutée.",
    eligibility:
      "Artisans d'art français en phase de structuration ou développement. Projet de développement cohérent sur 1-3 ans (ouverture atelier, nouveau produit, formation, communication). Niveau technique reconnu.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Consulter fondationbanquepopulaire.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationbanquepopulaire.fr/artisanat-d-art/",
    grantType: ["Bourse", "Accompagnement", "Aide au développement"],
    eligibleSectors: ["Métiers d'art", "Artisanat d'art", "Entrepreneuriat culturel"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 15,
    annualBeneficiaries: 10,
    preparationAdvice:
      "Bourse INDIVIDUELLE (pas pour structure). Accompagnement sur 1-3 ans = vraie valeur ajoutée (mentorat, réseau, médias). Pour un artisan en phase de structuration post-création. Vérifier cumul avec autres bourses métiers d'art (Bettencourt).",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 11 : ${WAVE.length} grants à insérer.\n`);

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
