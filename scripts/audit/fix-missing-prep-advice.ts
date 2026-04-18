/**
 * Complète les preparationAdvice manquants pour les grants récentes.
 * Cible les grants UUID créées dans les 6 dernières heures sans prep_advice.
 */
import { db } from "../../server/db.js";
import { grants } from "../../shared/schema.js";
import { sql, eq, and, isNull } from "drizzle-orm";

// Mapping titre → conseil de préparation
const ADVICES: Record<string, string> = {
  "Bourse Albert Londres — Podcast (reportage sonore)":
    "Démo sonore (3-5 min) essentielle pour crédibiliser la démarche. Narration, son, ambiances — pas juste un commentaire audio posé sur reportage. Projet qui explore les FORMES du podcast (immersif, narratif, série) favorisé. -40 ans strict.",

  "Design Parade — Concours Architecture d'intérieur (Villa Noailles)":
    "Projet présenté : réalisation récente OU concept ambitieux documenté. Portfolio visuel soigné (plans, photos, maquettes, axos). La Villa Noailles valorise les approches radicales / non-conventionnelles de l'espace. Participation à la Design Week = visibilité auprès des éditeurs.",

  "Accompagnement artistes émergents — Contrat de filière MA AURA":
    "Structure demandeuse = SMAC, pôle régional, label ou manager. L'artiste accompagné doit avoir un parcours démontrable (sorties, concerts, presse). Projet d'accompagnement sur 12-18 mois avec objectifs concrets (nouvelle production, structuration, export).",

  "Prix Simone et Cino Del Duca — Sculpture (Académie des Beaux-Arts)":
    "PAS DE CANDIDATURE DIRECTE (sélection par académiciens). Pour se construire une légitimité : expositions en institutions publiques, commandes publiques, collections Fnac/FRAC/musées. Prix plutôt pour sculpteurs confirmés (40+ ans de carrière).",

  "Aide aux salles et lieux de diffusion de musiques actuelles — SACEM":
    "Programmation régulière d'auteurs-compositeurs SACEM attendue (part du répertoire SACEM > 50% idéalement). Dossier avec plan de programmation annuel détaillé + budget + chiffres fréquentation. Dispositif structurant pour les SMAC et bars-concerts.",

  "SCPP — Aides aux showcases":
    "Adhésion SCPP nécessaire (via le label/producteur). Showcase dans cadre professionnel identifié (salon MIDEM, festival tremplin, convention industrie). Les showcases sans contexte pro (simple mini-concert) sont peu retenus.",

  "SPPF — Aide Showcase":
    "Sociétariat SPPF préalable (gratuit pour labels indé). Priorité aux showcases à l'international (export musical) ou dans salons/festivals pros majeurs. Budget détaillé du déplacement + cachets + hébergement.",

  "SPPF — Aide Promo/Marketing":
    "Plan marketing précis avec cibles, canaux, KPI. La SPPF attend des actions concrètes (publicités, tournées presse, campagnes digitales) pas du vague. Budget chiffré poste par poste. Un dossier avec 1 seule grande action vaut mieux qu'une liste diffuse.",

  "Aide à la création spectacle vivant — Région Île-de-France":
    "Cofinancement DRAC IdF et/ou Paris / département fortement attendu. Compagnie conventionnée = avantage. Le budget de création doit être réaliste (pas gonflé) et la diffusion crédible (co-producteurs, lieux d'accueil identifiés).",

  "Aide à la résidence territoriale SV — Région Île-de-France":
    "Structure d'accueil IdF conventionnée avec la Région obligatoire. Projet d'ancrage territorial réel (ateliers, médiation, restitution). Durée plusieurs semaines minimum, idéalement fragmentée sur l'année scolaire.",

  "Résidence Artagon Marseille":
    "30 résidents par promotion, sélection très compétitive. Le dossier doit démontrer : cohérence du parcours, besoin actuel (pourquoi MAINTENANT Marseille ?), potentiel artistique. Artagon valorise la pluralité des profils.",

  "Résidence Artagon Pantin":
    "Dispositif favorable aux artistes qui veulent travailler AU CONTACT du réseau parisien (galeries, institutions, écoles). Projet qui articule production + rencontre avec le milieu pro = plus pertinent que studio isolé.",

  "Aide à la production d'œuvres d'art — Fondation des Artistes":
    "Dispositif AMONT (recherche, résidence prépa) — ne finance PAS les frais de post-prod ou diffusion. Pour projet ambitieux en phase de gestation. Le dossier doit argumenter POURQUOI le projet demande du temps et des moyens en amont.",

  "Soutien à un projet artistique — CNAP":
    "Les 5 visuels légendés sont cruciaux. La commission évalue la cohérence parcours-projet. Une note d'intention bien écrite (2 pages) qui articule le projet à votre recherche est le plus important.",

  "Bourse Fanzine — ADAGP":
    "Dispositif très accessible — la maquette visuelle compte plus que le CV. Projet d'édition avec positionnement clair (humour, politique, art brut, etc.). Diffusion : 200-500 ex typiquement, librairies indé + salons.",

  "Cultivons l'art en milieu rural — Fondation de France":
    "Géographie restrictive : 5 départements (Loire, Rhône, Haute-Savoie, Côte d'Or, Saône-et-Loire). Le RAPPORT AU TERRITOIRE doit être démontrable (résidence, ancien travail, réseau local). Lettre d'intention courte et percutante (3-4 pages).",

  "Résidences artistiques 2026 — Seine-Saint-Denis":
    "Partenariat avec structure 93 obligatoire. Taux 70% pour disciplines fragiles (cirque, arts de la rue, marionnette). La Seine-Saint-Denis est très active culturellement — qualité de la programmation locale élevée.",

  "Talents Adami Jazz 2026":
    "Dossier avec EPK complet : presse, dates confirmées, vidéos live HD, enregistrements récents. Le jury valorise la trajectoire ascendante, pas juste le talent. Plan de carrière à 2-3 ans articulé.",

  "Bourse de résidence de création — CNL":
    "Dispositif SIMPLE : la structure d'accueil fait 80% du dossier (logistique, défraiements, programme). L'auteur fournit note projet + CV + extraits. Cumul avec autres aides résidences fréquent (région, collectivités).",

  "Bourse de résidence d'auteurs à l'École — CNL":
    "Double compétence artistique + pédagogique. Contact PRÉALABLE avec un établissement (prof de français, CDI, chef d'établissement) pour co-construire. Projet articulé au programme scolaire ou à un temps fort de l'année.",

  "Bourse de séjour aux traducteurs étrangers — CNL":
    "Contrat d'édition formalisé pour la traduction (obligatoire). Institut français du pays du traducteur peut aider au montage. Séjour en France lié à des interactions concrètes (auteur, éditeur, archives).",

  "Résidence Maison des auteurs — Cité internationale de la bande dessinée (Angoulême)":
    "Les studios Angoulême tournent souvent — dossier + rencontre avec l'équipe en amont. Écosystème BD local exceptionnel (200+ auteurs, éditeurs locaux, festival). Cumul avec bourses CNL BD / auteurs.",

  "Bourse Artisanat d'art — Fondation Banque Populaire":
    "Positionnement INDIVIDUEL — l'artisan est le demandeur, pas son atelier-société. Dossier mettant en avant le parcours artistique + vision de développement. L'accompagnement post-sélection (1-3 ans) est souvent LA valeur.",

  "Aide aux arts de la scène — Collectivité de Corse":
    "Trajectoire insulaire ou en lien fort avec la Corse. Les coproductions avec compagnie corse favorisées pour les structures métropolitaines. Cumul avec DRAC Corse (SV) et CNM (si musique) possible.",

  "Aide à la publication d'ouvrages — Collectivité de Corse":
    "Publication en langue corse = taux bonifié (70%). Pour éditeurs métropolitains, s'associer avec imprimeur ou diffuseur corse. Plan de diffusion insulaire + continental. Tirage minimum selon le genre.",

  "SCPP — Aides aux vidéomusiques":
    "Budget clip détaillé (réalisation + post-prod + diffusion). La SCPP valorise les clips avec ambition formelle (pas juste playback). Plan de diffusion digital concret (YouTube, réseaux sociaux, festivals clips).",

  "PEAP — Plan d'Éducation aux Arts et Patrimoines (Guyane)":
    "Partenariat scolaire/périscolaire guyanais obligatoire. Ancrage territorial valorisé (identité amérindienne, bushinengue, créole, Amazonie). Calendrier articulé à l'année scolaire guyanaise (rentrée février).",

  "Fondation Daniel Langlois — Arts, Sciences, Technologies":
    "Collaboration science/art demandée (chercheur + artiste). Méthodologie claire, livrable identifié. Les projets sur le vivant, la simulation, l'IA artistique, la bio-art sont dans l'ADN Langlois. Dossier en français ou anglais.",

  "Aide au concept — Œuvres audiovisuelles et cinématographiques (Eurométropole Strasbourg)":
    "Dispositif AMONT — avant pré-production. Synopsis, note d'intention, éléments de développement suffisent (pas scénario finalisé). Le Lieu Documentaire Strasbourg peut accompagner le montage. Coopération transfrontalière (Allemagne, Suisse) bonus.",

  "Danse en amateur et répertoire — CND":
    "Partenariat compagnie / groupe amateur formalisé. Restitution publique obligatoire. La CND valorise les approches qui font dialoguer pros et amateurs sur un pied d'égalité (pas juste « on apprend aux amateurs »).",

  "Bourse de poésie Gina Chenouard — SGDL":
    "Bourse très sélective (1 lauréat/an). Un recueil poétique déjà publié est souvent préalable. Le dossier doit montrer une voix singulière et une cohérence thématique/formelle. Joindre 15-30 pages du projet en cours.",

  "Aide résidences et projets recherche arts plastiques — Normandie":
    "Siège OU résidence principale en Normandie obligatoire. Projet avec volet public (restitution, médiation). Partenariat avec lieu d'art normand (centre d'art, FRAC, école d'art) fortement apprécié.",

  "Soutien à la production d'œuvres en arts visuels — Centre-Val de Loire":
    "Dispositif simple mais ciblé : résidence principale en CVL requise. Production concrète avec budget détaillé (matériaux, sous-traitance, atelier). Dépôt 6 avril - 17 mai 2026.",

  "Soutien création et production artistique — Centre-Val de Loire":
    "Équipe artistique en CVL (licence entrepreneur SV). Projet de création avec calendrier et plan de diffusion. La Région CVL est dans un moment de restructuration de son soutien SV — dossier solide valorisé.",

  "Aide à la production des compagnies — Bourgogne-Franche-Comté":
    "Plafond 20K mais cofinancement DRAC et autres collectivités attendu. La Région BFC a un écosystème SV actif (scènes labellisées, festivals). Cumul fréquent avec ADSV DRAC.",

  "Aide au parcours de résidence — Bourgogne-Franche-Comté":
    "Partenariat inter-régional possible avec Centre-Val de Loire. Minimum 10 jours ouvrables dans un ou plusieurs lieux. Dossier avec conventions d'accueil formalisées.",

  "Aide au fonctionnement équipes artistiques — Pays de la Loire":
    "Pour équipes conventionnées ou à rayonnement démontré (diffusion nationale, convention DRAC). Dossier pluriannuel avec bilan + plan 3 ans. Non adapté aux jeunes compagnies.",

  "Aide à la création spectacle vivant — Bretagne (CREA)":
    "Écosystème breton structuré (Maison des cultures, Bouche d'Air, Les Trans). Co-production avec scène bretonne labellisée = avantage. La Région Bretagne est l'une des plus actives en SV par habitant.",

  "Aide à l'édition — Région Guadeloupe":
    "Pour éditeurs avec publication d'auteur guadeloupéen OU ouvrage sur la Guadeloupe. ISBN réservé, contrat d'édition signé. Publications en créole ou bilingue français/créole appréciées.",

  "PART — Projets Artistiques à Rayonnement Territorial (Réunion)":
    "Ancrage territorial réunionnais obligatoire. Partenariats avec établissements scolaires + lieux culturels + collectivités. Projet biennal possible (2026-2027 ou 2026-2028).",

  "Aide à la création et diffusion musicale — Ville de Paris":
    "Siège social ou lieu principal parisien. Toutes esthétiques acceptées (plus ouvert que la SACEM qui cible auteurs-compositeurs SACEM). Concerts ou enregistrements à Paris valorisés.",

  "Culture et lien social 2026 — Préfecture Bouches-du-Rhône":
    "Dimension sociale EXPLICITE et démontrable (publics empêchés, quartiers QPV, milieu hospitalier). Partenariats avec structures sociales (CCAS, ESAT, bailleurs sociaux). Dispositif généreux sur l'inclusion.",

  "Adami — Aide pour un spectacle de musique":
    "Adhésion Adami obligatoire. Distingue du concert classique : projet SCÉNIQUE (mise en scène, scénographie, régie). Les formes hybrides musique+théâtre+danse sont éligibles. Budget technique détaillé.",

  "FONPEPS — ADEP (Emploi enregistrement phonographique)":
    "Convention collective phonographique à respecter (salaires minimum). Dispositif automatique = critères cochés = aide versée. Attention : plateforme ASP fermée temporairement (réforme 2026 en cours).",

  "SPPF — Aide à la vidéomusique":
    "Liens avec sortie phonographique récente ou à venir obligatoire (pas de clip isolé). Budget détaillé (réal, techniciens, post-prod, VFX). Clips avec ambition artistique (pas juste playback) sont favorisés.",
};

async function main() {
  // Récupère toutes les grants UUID récentes sans prep_advice
  const recent = await db
    .select({
      id: grants.id,
      title: grants.title,
      preparationAdvice: grants.preparationAdvice,
    })
    .from(grants)
    .where(
      and(
        eq(grants.status, "active"),
        sql`${grants.createdAt} >= NOW() - INTERVAL '6 hours'`,
        sql`length(${grants.id}) = 36`,
        isNull(grants.preparationAdvice),
      ),
    );

  console.log(`${recent.length} grants récentes sans preparationAdvice.\n`);

  let updated = 0;
  let missing = 0;

  for (const g of recent) {
    const advice = ADVICES[g.title];
    if (advice) {
      await db
        .update(grants)
        .set({ preparationAdvice: advice })
        .where(eq(grants.id, g.id));
      console.log(`✓ ${g.title.slice(0, 70)}`);
      updated++;
    } else {
      console.log(`✗ NO ADVICE MAPPED : ${g.title}`);
      missing++;
    }
  }

  console.log(`\n${updated} grants mises à jour, ${missing} sans mapping.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
