/**
 * Vague 12 : compléments musique — tremplins, dispositifs peu connus,
 * aides autoproduction.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import type { InsertGrant } from "../../shared/schema.js";

const WAVE: InsertGrant[] = [
  // ========== TREMPLINS NATIONAUX ==========
  {
    title: "iNOUïS du Printemps de Bourges Crédit Mutuel",
    organization: "Printemps de Bourges × Crédit Mutuel",
    description:
      "Tremplin national de référence pour artistes émergents en musiques actuelles : Rock/Pop, Chanson/Global Music, Electro, Urbain (Hip-hop/Rap). Sélection en plusieurs étapes (écoute, auditions régionales, sélection nationale). Les lauréats se produisent au Festival Printemps de Bourges (avril). Visibilité média et professionnelle majeure.",
    eligibility:
      "Nouveaux groupes ou artistes, musiciens et compositeurs émergents en musiques actuelles. Maquette ou premier album en conditions professionnelles. Disponibilité pour auditions régionales (janvier-février) puis national (février) puis festival (avril).",
    amount: null,
    amountMin: 0,
    amountMax: 5000,
    deadline: "Sessions 2026 closes (appel d'octobre à novembre) — session 2027 à venir",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.reseau-printemps.com/je-m-inscris/",
    grantType: ["Tremplin", "Prix", "Aide à l'émergence"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Rock", "Pop", "Chanson", "Électro", "Hip-hop", "Rap"],
    geographicZone: ["National"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 1,
    annualBeneficiaries: 60,
    preparationAdvice:
      "Pas une subvention directe mais un TREMPLIN majeur. Les lauréats ont souvent un deal label/booker dans les 6 mois qui suivent le festival. Maquette de haute qualité essentielle (pas de démo iPhone). L'auditon régionale est ouverte et publique — répéter le live.",
    status: "active",
  },
  {
    title: "Chantier des Francofolies",
    organization: "Francofolies de La Rochelle",
    description:
      "Programme d'accompagnement unique en France (25+ ans) dédié aux jeunes artistes francophones en développement. 14 artistes sélectionnés par édition. Résidence, coaching scénique, programmation au festival, mise en réseau pro (labels, éditeurs, tourneurs). Francofolies 2026 : 10-14 juillet à La Rochelle.",
    eligibility:
      "Artistes / groupes francophones avec au moins 15 concerts sur les 10 derniers mois, démo ou premier album en conditions pro, déjà accompagnés par un éditeur/tourneur/producteur (au moins 1 pro engagé). Chanson francophone privilégiée mais autres esthétiques acceptées si francophonie du texte.",
    amount: null,
    amountMin: 0,
    amountMax: 5000,
    deadline: "Consulter francofolies.fr (appel annuel)",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.francofolies.fr/le-chantier-des-francofolies/",
    grantType: ["Tremplin", "Accompagnement professionnel", "Résidence"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Chanson", "Francophonie"],
    geographicZone: ["National", "Francophonie"],
    applicationDifficulty: "difficile",
    acceptanceRate: 5,
    annualBeneficiaries: 14,
    preparationAdvice:
      "Francophonie textuelle centrale. Les 15 concerts démontrent une trajectoire de scène. Le Chantier est moins un prize money qu'un programme STRUCTURANT : coaching scénique + programmation festival + réseau. Cumulable avec iNOUïS.",
    status: "active",
  },

  // ========== ADAMI ==========
  {
    title: "Adami 365 — Aide au Projet Musical Global",
    organization: "ADAMI — Société civile pour l'administration des droits des artistes",
    description:
      "Aide directe aux artistes-producteurs adhérents Adami pour un projet musical GLOBAL sur 12 mois combinant au minimum 3 volets : enregistrement + 2 autres (concerts, promo, audiovisuel). Dispositif phare Adami pour les artistes qui structurent leur carrière sur le moyen terme.",
    eligibility:
      "Artiste interprète principal ET adhérent Adami ET dirigeant directement sa carrière (co-production de ses enregistrements via une personne morale). Projet sur 12 mois avec au moins 1 enregistrement + 2 autres volets.",
    amount: null,
    amountMin: 5000,
    amountMax: 30000,
    deadline: "Commission toutes les 6 semaines (sauf juillet-août)",
    frequency: "~8 commissions par an",
    isRecurring: true,
    url: "https://www.adami.fr/que-fait-ladami-pour-moi/cherche-financement-projet-artistique/projet-musical-global/",
    contactPhone: "01 44 63 10 00",
    grantType: ["Subvention", "Aide au projet", "Aide au développement"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Jazz", "Classique"],
    geographicZone: ["National"],
    structureSize: ["TPE", "Association", "Artiste individuel"],
    applicationDifficulty: "difficile",
    acceptanceRate: 30,
    preparationAdvice:
      "Adhésion Adami préalable OBLIGATOIRE. Artiste doit être en auto-production (via sa propre structure). Articuler les 3 volets sur 12 mois de façon cohérente — c'est un projet d'ensemble, pas 3 sous-aides. Commission rapide (même jour), très réactif.",
    status: "active",
  },
  {
    title: "Adami — Aide pour un spectacle de musique",
    organization: "ADAMI — Société civile pour l'administration des droits des artistes",
    description:
      "Aide à la création ou à la diffusion d'un spectacle musical. Cible les artistes-interprètes qui créent un spectacle personnel ou en collectif. Couvre les frais de résidence de création, cachets, techniciens, décor, régie lumière/son.",
    eligibility:
      "Artistes interprètes adhérents Adami. Spectacle musical avec dimension scénique (pas juste un concert classique). Projet de création ou tournée nouvelle. Structure juridique porteuse (licence entrepreneur).",
    amount: null,
    amountMin: 5000,
    amountMax: 20000,
    deadline: "Commissions régulières",
    frequency: "~8 commissions par an",
    isRecurring: true,
    url: "https://www.adami.fr/que-fait-ladami-pour-moi/cherche-financement-projet-artistique/aide-spectacle-musique/",
    grantType: ["Subvention", "Aide à la création", "Aide à la diffusion"],
    eligibleSectors: ["Musique", "Spectacle vivant musical", "Musiques actuelles", "Jazz"],
    geographicZone: ["National"],
    structureSize: ["Association", "TPE"],
    applicationDifficulty: "Moyen",
    acceptanceRate: 35,
    status: "active",
  },
  {
    title: "Talents Adami Jazz 2026",
    organization: "ADAMI — Société civile pour l'administration des droits des artistes",
    description:
      "Dispositif annuel dédié au jazz : accompagnement professionnel et artistique de talents émergents. Showcases dans les grands rendez-vous jazz (Jazz à Vienne, Jazz sous les pommiers, Jazz à la Villette). Visibilité presse nationale. Complément idéal d'Adami 365 pour un artiste en développement.",
    eligibility:
      "Musiciens jazz professionnels en émergence. Adhésion Adami. Trajectoire ascendante (sorties disque, dates live, presse). Projet de carrière cohérent sur 2-3 ans.",
    amount: null,
    amountMin: 3000,
    amountMax: 15000,
    deadline: "Consulter adami.fr",
    frequency: "Annuel",
    isRecurring: true,
    url: "https://www.adami.fr/evenements/talents-adami-jazz-2026/",
    grantType: ["Bourse", "Accompagnement", "Showcase"],
    eligibleSectors: ["Musique", "Jazz"],
    geographicZone: ["National"],
    applicationDifficulty: "difficile",
    acceptanceRate: 10,
    annualBeneficiaries: 8,
    preparationAdvice:
      "Valeur principale = showcases dans les 3-4 gros festivals jazz français. Un jeune jazzman qui obtient Talents Jazz accélère fortement. Dossier avec EPK complet (presse, vidéos live HD, CV concerts).",
    status: "active",
  },

  // ========== SACEM ==========
  {
    title: "Aide à l'autoproduction — SACEM",
    organization: "SACEM — Société des auteurs, compositeurs et éditeurs de musique",
    description:
      "Aide directe aux auteurs-compositeurs SACEM qui autoproduisent leur 1er ou 2e enregistrement. 5 000 € versés directement à l'auteur-compositeur. Concerne les enregistrements finalisés d'au moins 5 titres. Un des rares dispositifs dédiés à l'auteur-compositeur autoproducteur.",
    eligibility:
      "Adhérent SACEM avec numéro d'adhérent. Enregistrement auto-produit finalisé (au moins 5 titres). 1er ou 2e album autoproduit. Accompagnement professionnel obligatoire (manageur, éditeur, producteur spectacle, tourneur, salle de concert, ou dispositif d'accompagnement).",
    amount: 5000,
    deadline: "Dépôt jusqu'à 6 mois après sortie intégrale du projet",
    frequency: "Dépôts en continu",
    isRecurring: true,
    url: "https://www.sacem.fr/aides/autoproduction",
    grantType: ["Subvention", "Aide à l'autoproduction"],
    eligibleSectors: ["Musique", "Musiques actuelles", "Composition", "Chanson"],
    geographicZone: ["National"],
    applicationDifficulty: "facile",
    acceptanceRate: 50,
    preparationAdvice:
      "Adhésion SACEM préalable obligatoire (gratuite pour les compositeurs). Dossier : note d'intention + budget + lettre d'accompagnateur pro + copie demande SDRM (si sortie physique). Un des dispositifs les plus accessibles, taux d'acceptation élevé pour les dossiers bien construits.",
    status: "active",
  },
];

async function main() {
  console.log(`Wave 12 : ${WAVE.length} grants à insérer.\n`);

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
