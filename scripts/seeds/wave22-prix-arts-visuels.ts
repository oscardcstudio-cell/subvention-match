/**
 * Vague 22 : prix arts visuels importants repérés via CNAP 225 bourses et
 * via devenir.art / ellesfontla.culture.gouv.fr.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== FONDATION FRANÇOIS SCHNEIDER ==========
  {
    title: "Concours Talents Contemporains — Fondation François Schneider",
    organization: "Fondation François Schneider",
    description:
      "Concours annuel international sur le thème de l'EAU dans toutes les disciplines des arts visuels (peinture, dessin, sculpture, installation, photo, vidéo). Créé en 2011. 4 à 6 lauréats sélectionnés reçoivent 15 000 € chacun pour l'acquisition de leur œuvre qui intègre la collection de la Fondation. Collection permanente visible au centre d'art de Wattwiller (Alsace).",
    eligibility:
      "Artistes plasticiens de toutes nationalités, tous âges (majeurs), à mi-parcours dans leur carrière. Une œuvre ou un projet sur le thème de l'eau. Disciplines acceptées : peinture, dessin, sculpture, installation, photographie, vidéo, performance.",
    amount: 15000,
    deadline: "Automne (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.fondationfrancoisschneider.org/concours-talents-contemporains/appel-a-candidatures/",
    grantType: ["Prix", "Acquisition", "Appel à candidatures"],
    eligibleSectors: ["Arts visuels", "Peinture", "Dessin", "Sculpture", "Installation", "Photographie", "Vidéo"],
    geographicZone: ["International"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 2,
    annualBeneficiaries: 5,
    preparationAdvice:
      "Thème EAU central — le dossier doit démontrer un rapport profond au thème (pas juste un paysage aquatique). La Fondation achète l'œuvre : implication artistique dans le choix de l'œuvre finale. Exposition post-sélection à Wattwiller = visibilité.",
    status: "active",
  },

  // ========== ACADÉMIE DES BEAUX-ARTS ==========
  {
    title: "Prix Simone et Cino Del Duca — Peinture (Académie des Beaux-Arts)",
    organization: "Académie des Beaux-Arts × Fondation Simone et Cino Del Duca",
    description:
      "Prix annuel de l'Académie des Beaux-Arts décerné sur proposition. 25 000 € de dotation pour un peintre dont l'œuvre témoigne d'une trajectoire artistique d'envergure. Un des prix de reconnaissance institutionnelle les plus prestigieux en France pour la peinture (équivalent Prix Marcel Duchamp mais sur nomination par les académiciens).",
    eligibility:
      "Peintres (artistes plasticiens dont la peinture est le médium principal). Trajectoire professionnelle reconnue (expositions en institutions, collections, presse critique). Proposition par les académiciens de l'Académie des Beaux-Arts (pas de candidature directe).",
    amount: 25000,
    deadline: "Sélection par académiciens (pas de candidature directe)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.academiedesbeauxarts.fr/prix-artistiques-de-la-fondation-simone-et-cino-del-duca",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Arts visuels", "Peinture"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "PAS DE CANDIDATURE DIRECTE. Les peintres identifiés par les académiciens. Pour se rapprocher : exposer en galeries reconnues, intégrer des collections publiques, attirer l'attention de critiques membres des jurys. Un peintre qui atteint ce prix a déjà 20-30 ans de carrière reconnue.",
    status: "active",
  },
  {
    title: "Prix Simone et Cino Del Duca — Sculpture (Académie des Beaux-Arts)",
    organization: "Académie des Beaux-Arts × Fondation Simone et Cino Del Duca",
    description:
      "Équivalent sculpture du prix Del Duca Académie des Beaux-Arts. 25 000 €. Chaque année, l'Académie des Beaux-Arts décerne 2 prix Del Duca dans 2 disciplines différentes (celles NON couvertes par le Grand Prix artistique de l'année). Peinture, sculpture, gravure, architecture, composition musicale, photographie tournent sur les éditions.",
    eligibility:
      "Sculpteurs reconnus. Trajectoire professionnelle démontrée. Proposition par les académiciens (pas de candidature directe).",
    amount: 25000,
    deadline: "Sélection par académiciens",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.academiedesbeauxarts.fr/prix-artistiques-de-la-fondation-simone-et-cino-del-duca",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Arts visuels", "Sculpture"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    status: "active",
  },
  {
    title: "Grand Prix artistique Simone et Cino Del Duca — Académie des Beaux-Arts",
    organization: "Académie des Beaux-Arts × Fondation Simone et Cino Del Duca",
    description:
      "Grand Prix artistique de l'Académie des Beaux-Arts. 100 000 € (plus prestigieux que les prix de peinture/sculpture). Décerné chaque année dans une discipline différente : peinture, sculpture, gravure, architecture, composition musicale, photographie. 2025 : Thomas Adès (composition musicale).",
    eligibility:
      "Artistes de très haute envergure dans la discipline de l'année. Trajectoire internationale démontrée. Proposition exclusive par les académiciens.",
    amount: 100000,
    deadline: "Sélection par académiciens",
    frequency: "Annuel (discipline rotative)",
    isRecurring: true,
    url: "https://www.academiedesbeauxarts.fr/",
    grantType: ["Prix", "Reconnaissance institutionnelle"],
    eligibleSectors: ["Arts visuels", "Musique", "Architecture", "Photographie", "Peinture", "Sculpture"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 1,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Prix d'envergure internationale. Vérifier la discipline de l'année à venir avant toute démarche de visibilité. Anticipation 2-3 ans nécessaire pour construire le profil (expositions internationales, publications, collaborations institutionnelles).",
    status: "active",
  },

  // ========== DRAWING NOW ==========
  {
    title: "Prix Drawing Now — Dessin contemporain",
    organization: "Drawing Now Paris × Conté à Paris",
    description:
      "Prix de dessin contemporain décerné lors de Drawing Now Paris (première foire européenne dédiée au dessin, Carreau du Temple). 20 000 € depuis 2026 (avec partenariat Conté à Paris). Candidature par les galeries exposantes. 15 ans d'existence.",
    eligibility:
      "Artistes présentés par des galeries participant à Drawing Now Paris. Galerie devant justifier d'au moins 3 expositions/an hors foires. Artistes INDÉPENDANTS NON ÉLIGIBLES directement — passer par une galerie. Dessin contemporain : toutes techniques (fusain, encre, aquarelle, pastel, dessin numérique, sculpture dessin).",
    amount: 20000,
    deadline: "Candidatures galeries fin d'année (pour foire mars)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.drawingnowparis.com/evenements/le-prix-drawing-now/",
    grantType: ["Prix", "Reconnaissance"],
    eligibleSectors: ["Arts visuels", "Dessin", "Dessin contemporain"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Passage obligé par une galerie participante. Pour un artiste dessinateur : se rapprocher des galeries spécialisées (Galerie Binome, Archiraar, Eric Dupont, etc.). Prix + foire = accélérateur de carrière dessin-centrée.",
    status: "active",
  },

  // ========== FONDATION AURELIE NEMOURS ==========
  {
    title: "Prix Aurelie Nemours — Institut de France",
    organization: "Fondation Aurelie Nemours (Institut de France)",
    description:
      "Prix biennal créé par Aurelie Nemours (abstraction géométrique). Récompense un artiste dont le travail poursuit la quête plastique rigoureuse et spirituelle de l'artiste. Ouvert à toutes disciplines (arts visuels, design graphique, architecture). Deux lauréats récents : Irma Boom (designer graphique) + Hans-Jörg Glattfelder (peintre).",
    eligibility:
      "Artistes de toutes disciplines dont l'œuvre s'inscrit dans la continuité de l'abstraction géométrique et spirituelle. Trajectoire professionnelle reconnue. Proposition ou candidature selon les éditions.",
    amount: null,
    amountMin: 10000,
    amountMax: 30000,
    deadline: "Appel biennal (consulter aurelienemours.com)",
    frequency: "Biennal",
    isRecurring: true,
    url: "http://www.aurelienemours.com/fr/le-prix-aurelie-nemours",
    grantType: ["Prix", "Bourse"],
    eligibleSectors: ["Arts visuels", "Abstraction géométrique", "Design graphique", "Architecture"],
    geographicZone: ["International"],
    applicationDifficulty: "difficile",
    acceptanceRate: 2,
    annualBeneficiaries: 1,
    preparationAdvice:
      "Très spécifique : l'œuvre doit s'inscrire dans la filiation Aurelie Nemours (rigueur, réduction, spiritualité, géométrie). Pas de candidature générique. Les 2 lauréats 2023 (Irma Boom designer + Glattfelder peintre) montrent la diversité disciplinaire acceptée.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 22 : ${WAVE.length} grants à insérer.\n`);

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
