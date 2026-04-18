import type { FormSubmission, GrantResult } from "@shared/schema";
import { db } from "./db";
import { grants as grantsTable } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  filterByQualityGate,
  calculateQualityScore,
  needsEnrichment,
} from "./quality-gate";
import { enrichGrant } from "./ai-enricher";
import { isRegionCompatible } from "./region-filter";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-chat"; // DeepSeek-v3.1-terminus

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature: number;
  max_tokens: number;
}

/**
 * Call OpenRouter API with DeepSeek model
 */
async function callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const request: OpenRouterRequest = {
    model: MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 4000,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : "https://mecene.fr",
      "X-Title": "Mecene",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Handle unexpected API response
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error("❌ Unexpected OpenRouter response:", JSON.stringify(data, null, 2));
    throw new Error(`OpenRouter returned unexpected response: ${JSON.stringify(data)}`);
  }
  
  return data.choices[0].message.content;
}

/**
 * Determine if a grant is recurring based on isRecurring flag or frequency text.
 * isRecurring (boolean from DB) is the source of truth when set.
 * Falls back to heuristic on frequency text for older data not yet backfilled.
 */
function isGrantRecurring(grant: GrantResult): boolean {
  // Explicit flag takes priority
  if (grant.isRecurring === true) return true;
  if (grant.isRecurring === false) return false;

  // Fallback: infer from frequency text (for grants not yet backfilled)
  if (!grant.frequency || grant.frequency.trim() === '') return false;

  const freq = grant.frequency.toLowerCase();
  const recurringKeywords = [
    'annuel', 'récurrent', 'permanent', 'régulier',
    'chaque année', 'toute l\'année', 'sessions',
    'appels à projets réguliers', 'variable selon',
  ];
  const oneOffKeywords = ['ponctuel', 'unique', 'one-shot', 'exceptionnel'];

  if (oneOffKeywords.some(k => freq.includes(k))) return false;
  if (recurringKeywords.some(k => freq.includes(k))) return true;

  // Unknown frequency text — assume non-recurring to be safe
  return false;
}

/**
 * Mots-clés utilisés pour présélectionner les grants par domaine artistique
 * AVANT l'envoi à DeepSeek (sinon le prompt dépasse les 32k tokens).
 *
 * Chaque grant est testée : si son titre/description/secteurs contient un mot-clé
 * du domaine de l'utilisateur → gardée. Si elle ne matche aucun mot-clé de
 * QUELCONQUE domaine (= aide culturelle générique/transversale) → gardée aussi.
 * Si elle matche exclusivement un AUTRE domaine → rejetée.
 */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  "musique": [
    "musique", "musical", "musicien", "phonograph", "chanson", "concert",
    "album", "tournée", "tournee", "festival", "spectacle vivant",
    "artiste-interprète", "artiste-interprete", "cnm", "sacem", "spedidam", "adami",
    "musiques actuelles", "enregistrement", "compositeur", "interprète",
    // événementiel / programmation / lieux (pour orgas de soirées, festivals,
    // programmateurs, salles) : ces aides touchent au domaine musical même
    // quand le mot "musique" n'est pas dans le titre.
    "programmation", "programmateur", "lieu de diffusion", "salle de concert",
    "smac", "scène de musique", "scenes de musique", "club", "manifestation",
    "tremplin", "showcase", "diffusion musicale", "booking",
  ],
  "audiovisuel": [
    "audiovisuel", "cinéma", "cinema", "cinématograph", "cinematograph",
    "film", "court métrage", "court-métrage", "court metrage",
    "long métrage", "long-métrage", "long metrage",
    "cnc", "documentaire", "série", "serie", "vfx", "animation",
  ],
  "spectacle-vivant": [
    "spectacle vivant", "théâtre", "theatre", "danse", "cirque",
    "chorégraph", "choregraph", "compagnie", "dramatique", "marionnette",
    "festival", "diffusion", "artiste-interprète", "spedidam", "scène",
    "scene nationale", "arts de la rue", "arts du mouvement",
  ],
  "arts-plastiques": [
    "arts plastiques", "arts visuels", "plasticien", "sculpt",
    "peinture", "peintre", "exposition", "galerie", "artiste visuel",
    "centre d'art", "fondation d'art",
  ],
  "arts-numeriques": [
    "numérique", "numerique", "digital", "multimedia", "multimédia",
    "interactif", "jeu vidéo", "jeu video", "gaming", "arts numériques",
    "arts numeriques", "nouvelles technologies", "réalité virtuelle",
    "immersion",
  ],
  "ecriture": [
    "écriture", "ecriture", "écrivain", "ecrivain", "auteur", "autrice",
    "littér", "litter", "roman", "édition", "edition", "livre", "cnl",
    "manuscrit", "poésie", "poesie", "bande dessinée", "bd",
    "bourse d'écriture", "résidence d'écriture",
  ],
  "patrimoine": [
    "patrimoine", "monument", "restauration", "musée", "musee",
    "archéo", "archeo", "conservation", "bâtiment culturel",
    "batiment culturel", "historique", "architectural",
  ],
};

/**
 * Indique qu'une grant est "transversale" (culture générique, pas rattachée
 * à un domaine précis). On garde ces grants dans le pool pour laisser l'IA
 * décider de leur pertinence.
 */
function hasAnyDomainSignal(haystack: string): boolean {
  for (const keywords of Object.values(DOMAIN_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) return true;
  }
  return false;
}

/**
 * Présélectionne les grants compatibles avec le(s) domaine(s) artistique(s)
 * de l'utilisateur via keyword matching sur title/description/secteurs.
 * Réduit le prompt envoyé à DeepSeek de 60-70% (évite dépassement 32k tokens).
 *
 * Logique :
 * - Utilisateur sans domaine spécifié → on garde tout.
 * - Grant matche un keyword d'un domaine de l'utilisateur → gardée.
 * - Grant ne matche AUCUN domaine (transversale) → gardée.
 * - Grant matche uniquement des domaines non-utilisateur → rejetée.
 */
function preselectByDomain(
  grants: GrantResult[],
  userDomains: string[] | null | undefined
): GrantResult[] {
  if (!userDomains || userDomains.length === 0) return grants;

  const userKeywords = userDomains
    .flatMap((d) => DOMAIN_KEYWORDS[d] ?? [])
    .map((k) => k.toLowerCase());

  if (userKeywords.length === 0) return grants;

  return grants.filter((g) => {
    const haystack = [
      g.title ?? "",
      g.description ?? "",
      g.eligibility ?? "",
      (g.eligibleSectors ?? []).join(" "),
      (g.grantType ?? []).join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .replace(/<[^>]*>/g, " ");

    // Match positif : keyword d'un domaine de l'utilisateur
    if (userKeywords.some((kw) => haystack.includes(kw))) return true;

    // Transversale : aucun keyword de domaine présent → on garde
    if (!hasAnyDomainSignal(haystack)) return true;

    // Sinon : la grant est clairement dans un domaine qui n'est pas celui
    // de l'utilisateur → on l'éjecte.
    return false;
  });
}

/**
 * Filter grants by deadline - keep only grants that are open or recurring.
 *
 * Recurring grants whose deadline has passed are KEPT — the UI shows
 * "Prochaine session" and the deadline-checker will bump their deadline
 * forward instead of archiving them.
 *
 * One-shot (ponctuel) grants whose deadline has passed are EXCLUDED.
 */
function filterGrantsByDeadline(grants: GrantResult[]): GrantResult[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return grants.filter(grant => {
    // No deadline specified — keep (permanent / always open)
    if (!grant.deadline || grant.deadline.trim() === '') {
      return true;
    }

    // Recurring grants are always kept — even with a past deadline
    if (isGrantRecurring(grant)) {
      return true;
    }

    try {
      const deadlineDate = new Date(grant.deadline);
      deadlineDate.setHours(23, 59, 59, 999);

      // One-shot grants: keep only if deadline is in the future
      return deadlineDate >= today;
    } catch (e) {
      console.warn(`⚠️ Could not parse deadline for grant ${grant.id}: ${grant.deadline}`);
      return true;
    }
  });
}

/**
 * Match user profile with grants using AI
 *
 * Pipeline :
 *   1. Filtre par deadline (grants ouvertes ou récurrentes)
 *   2. Quality gate : éjecte les grants sans titre/orga ou trop incomplètes
 *      (économise des tokens DeepSeek + garantit que l'utilisateur ne reçoit
 *      que des fiches actionnables)
 *   3. Matching IA sur les grants restantes → top 5-10 IDs
 *   4. Enrichissement à la volée des matches dont le score qualité < 80
 *      (description, éligibilité, organisme manquants → comblés via DeepSeek
 *      et persistés en DB pour les futurs utilisateurs)
 *   5. Enrichissement métadonnées (amount/difficulty/advice) personnalisées
 *      pour le profil de l'utilisateur courant
 */
export async function matchGrantsWithAI(
  submission: FormSubmission,
  allGrants: GrantResult[]
): Promise<GrantResult[]> {
  // 1. Filter out grants with passed deadlines
  const openGrants = filterGrantsByDeadline(allGrants);
  console.log(
    `🤖 Pipeline matching IA : ${allGrants.length} grants → ${openGrants.length} ouvertes (${allGrants.length - openGrants.length} deadline passée)`
  );

  // 2. Quality gate — éjecte les grants trop incomplètes pour être proposées
  const { passed: qualifiedGrants } = filterByQualityGate(openGrants);
  if (qualifiedGrants.length === 0) {
    console.warn(
      "⚠️ Aucune grant ne passe le quality gate. Vérifier la qualité des données en DB."
    );
    return [];
  }

  // 2b. Filtre géographique — rejette les aides régionales d'une autre région
  // (ex: Conseil départemental des Landes pour un user breton). Laisse passer
  // les aides nationales, UE, et celles sans région clairement identifiable.
  const regionCompatibleGrants = qualifiedGrants.filter((g) =>
    isRegionCompatible(g.organization, submission.region)
  );
  const rejectedByRegion = qualifiedGrants.length - regionCompatibleGrants.length;
  if (rejectedByRegion > 0) {
    console.log(
      `🗺️  Filtre régional (${submission.region}) : ${rejectedByRegion} aides d'autres régions rejetées`
    );
  }

  // 2c. Présélection par domaine artistique — keyword matching léger pour
  // réduire le pool envoyé à DeepSeek sous la limite de 32k tokens.
  // Les grants transversales (aides culture générique) passent aussi.
  const domainFilteredGrants = preselectByDomain(
    regionCompatibleGrants,
    submission.artisticDomain
  );
  const rejectedByDomain = regionCompatibleGrants.length - domainFilteredGrants.length;
  if (rejectedByDomain > 0) {
    console.log(
      `🎨 Présélection domaine (${submission.artisticDomain?.join(", ") ?? "aucun"}) : ${rejectedByDomain} aides hors domaine rejetées → ${domainFilteredGrants.length} restantes`
    );
  }

  // Build user profile summary (gérer les champs vides)
  const hasStatus = submission.status && submission.status.length > 0;
  const hasArtisticDomain = submission.artisticDomain && submission.artisticDomain.length > 0;
  const hasProjectType = submission.projectType && submission.projectType.length > 0;
  
  const userProfile = `
Profil de l'utilisateur :
- Statut : ${hasStatus ? submission.status!.join(", ") : "Non spécifié"}${submission.statusOther ? ` (${submission.statusOther})` : ""}
- Domaine artistique : ${hasArtisticDomain ? submission.artisticDomain!.join(", ") : "Non spécifié"}${submission.artisticDomainOther ? ` (${submission.artisticDomainOther})` : ""}
- Région : ${submission.region || "Non spécifiée"}
- International : ${submission.isInternational || "Non spécifié"}

Projet :
- Description : ${submission.projectDescription || "Non spécifiée"}
- Type : ${hasProjectType ? submission.projectType!.join(", ") : "Non spécifié"}${submission.projectTypeOther ? ` (${submission.projectTypeOther})` : ""}
- Stade : ${submission.projectStage || "Non spécifié"}

Critères :
- Innovation : ${submission.innovation?.join(", ") || "Non spécifié"}${submission.innovationOther ? ` (${submission.innovationOther})` : ""}
- Dimension sociale : ${submission.socialDimension?.join(", ") || "Non spécifié"}${submission.socialDimensionOther ? ` (${submission.socialDimensionOther})` : ""}
- Urgence : ${submission.urgency || "Non spécifié"}
- Types d'aide recherchés : ${submission.aidTypes?.join(", ") || "Non spécifié"}${submission.aidTypesOther ? ` (${submission.aidTypesOther})` : ""}
- Périmètre géographique : ${submission.geographicScope?.join(", ") || "Non spécifié"}
`.trim();

  // Build grants database for AI (only grants that passed the quality gate)
  // Format enrichi : on inclut désormais un snippet de description ET le
  // grantType pour que l'IA puisse filtrer par secteur/domaine réel, pas
  // juste par éligibilité administrative.
  const grantsDatabase = domainFilteredGrants.map((grant) => {
    const eligShort = (grant.eligibility || "").replace(/<[^>]*>/g, "").substring(0, 100).trim();
    const descShort = (grant.description || "").replace(/<[^>]*>/g, "").substring(0, 130).trim();
    const sectors = grant.eligibleSectors?.slice(0, 2).join(",") || "";
    const types = grant.grantType?.slice(0, 2).join(",") || "";
    const geo = grant.geographicZone?.slice(0, 2).join(",") || "";
    return `${grant.id}|${grant.title}|${grant.organization}|${descShort}|${eligShort}|${sectors}|${types}|${geo}`;
  }).join("\n");

  // System prompt — réécrit pour forcer la précision sectorielle
  const systemPrompt = `Tu es un expert en subventions culturelles françaises et européennes. Ta mission est d'analyser le profil d'un artiste/structure et de sélectionner UNIQUEMENT les subventions réellement pertinentes.

⚠️ RÈGLE N°1 — PERTINENCE SECTORIELLE (PRIORITÉ ABSOLUE) :
- NE JAMAIS proposer une aide dont le domaine est incompatible avec le profil.
  Exemples d'incompatibilités : aide "mobilier/bâtiment" pour un écrivain,
  aide "arts visuels" pour un musicien, aide "cinéma" pour un danseur.
- Le titre ET la description de la subvention doivent être cohérents avec
  le domaine artistique de l'utilisateur.
- En cas de doute sur la compatibilité sectorielle, NE PAS inclure la subvention.
- Mieux vaut renvoyer 3 résultats vraiment pertinents que 10 vaguement liés.

⚠️ RÈGLE N°1 BIS — COMPATIBILITÉ TYPE DE PROJET / TYPE D'AIDE :
- Une aide à la CRÉATION (produire une œuvre originale) n'est PAS pour un projet
  de DIFFUSION, de PROGRAMMATION ou d'ÉVÉNEMENTIEL, et inversement.
- Exemple concret : "Aide à la création musicale" du CNM n'est PAS pour un
  organisateur de soirées / programmateur / DJ set / festival — c'est pour
  composer/écrire/enregistrer de la musique originale.
- Exemple concret : une aide à l'organisation d'événements culturels n'est PAS
  pour un artiste qui veut financer la production de son album.
- Lire le TITRE et la DESCRIPTION de l'aide pour identifier son intention réelle
  (créer / diffuser / programmer / résidence / formation / équipement / structuration).
- Croiser avec le TYPE DE PROJET de l'utilisateur. Si l'intention de l'aide ne
  matche pas l'intention du projet → EXCLURE, même si le domaine artistique colle.

⚠️ RÈGLE N°2 — STATUT JURIDIQUE :
- Les aides "Creative Europe" (Commission Européenne) nécessitent une STRUCTURE LÉGALE (association, micro-entreprise, collectif avec SIRET).
- Si l'utilisateur est artiste individuel SANS structure, exclure les aides EU Creative Europe.
- Les aides françaises nationales (CNC, DRAC, CNM, SACEM, etc.) sont ouvertes aux individus.

⚠️ RÈGLE N°3 — PÉRIMÈTRE GÉOGRAPHIQUE :
- Aides régionales : vérifier que la RÉGION de l'utilisateur correspond.
- Aides nationales : ouvertes depuis toute la France.
- Aides EU : ouvertes à l'UE mais structure obligatoire (règle N°2).

CRITÈRES DE SÉLECTION (par ordre de priorité) :
1. Domaine artistique compatible (titre + description vs profil utilisateur)
2. Statut juridique compatible
3. Type de projet cohérent (création, diffusion, médiation, résidence, etc.)
4. Localisation géographique
5. Stade du projet (idée, développement, production, etc.)
6. Montant adapté
7. Urgence vs délais de l'aide

📌 GUIDE POSITIF — PATTERNS TYPIQUES PAR TYPE DE PROJET :
Balaye activement la base à la recherche de ces patterns, ne te contente pas
d'exclure les mauvais matches — il faut AUSSI repérer les bons :

- Projet ÉVÉNEMENTIEL / ORGANISATION DE SOIRÉES / PROGRAMMATION / FESTIVAL :
  → "Aide aux festivals", "Soutenir les manifestations", "Aide à la diffusion",
     "Bourse des festivals", aides aux organisateurs d'événements culturels,
     aides aux programmateurs, aides aux lieux de diffusion.
  → Spedidam "Aide aux festivals", CNM "Aide à la diffusion", aides régionales
     aux manifestations culturelles sont typiques.

- Projet de CRÉATION MUSICALE / ENREGISTREMENT / COMPOSITION :
  → "Aide à la création", CNM "Aide à la création musicale", Sacem aides
     création, résidences de composition.

- Profil DJ / PRODUCTEUR ÉLECTRONIQUE / BEATMAKER / MUSIQUE URBAINE :
  → Un DJ/producteur est à la fois créateur (il compose/produit ses tracks),
     interprète (il joue en live / en club) et entrepreneur (son label, ses sorties).
  → Pistes typiques : CNM "Aide au développement d'artiste", CNM "Aide à la
     production phonographique", CNM "Aide aux musiques actuelles", Sacem aides
     création musicale, Spedidam aides tournée, FCM (Fonds de Création Musicale),
     aides régionales aux musiques actuelles, aides aux labels indépendants.
  → Le fait qu'il soit "DJ" ne doit PAS exclure d'office les aides à la création
     musicale — la composition de tracks électro/hip-hop/house EST de la création.
     Exclusion uniquement si le projet se limite à DJ SET ÉVÉNEMENTIEL sans
     production originale.
  → Pour ce profil, vise 5 à 8 résultats (multiple cordes à leur arc).

- Projet de TOURNÉE / CONCERTS / SPECTACLE VIVANT :
  → Spedidam "Aide au spectacle musical" / "Aide aux projets", aides à la
     tournée, aides aux artistes-interprètes, aides au spectacle vivant.

- Projet de RÉSIDENCE ARTISTIQUE :
  → "Aide à la résidence", DRAC résidences, aides régionales résidences.

- Projet ÉDITION / LIVRE / LITTÉRATURE :
  → CNL, aides à l'édition, bourses auteurs, manifestations littéraires.

- Projet AUDIOVISUEL / CINÉMA :
  → CNC aides production / diffusion / VàD / festivals cinéma.

Quand un mot-clé du projet utilisateur (festival, soirée, album, tournée,
résidence, etc.) apparaît dans le TITRE d'une aide → c'est un signal fort.

FORMAT DE RÉPONSE :
- Retourne UNIQUEMENT les IDs séparés par des virgules, du plus pertinent au moins pertinent.
- Minimum 1, maximum 10.
- Vise 4 à 7 résultats vraiment pertinents. Si moins de 3 sont vraiment
  pertinents, n'en retourne que 1 ou 2 — NE REMPLIS PAS avec des médiocres.
- 🎪 CAS SPÉCIAL — projets ÉVÉNEMENTIEL / FESTIVAL / PROGRAMMATION / DIFFUSION :
  ces profils ont de nombreuses aides candidates (festivals régionaux,
  manifestations culturelles, aides diffusion, aides aux organisateurs).
  Vise 5 à 8 résultats dans ce cas — balaie largement les aides à la
  diffusion / festivals / manifestations compatibles avec la région.
- À l'inverse, ne sois pas trop restrictif : s'il existe 5-6 aides typiques
  pour le profil (voir guide positif), retourne-les toutes.
- Format : id1,id2,id3`;

  const userPrompt = `${userProfile}

---

Base de données des subventions (format: ID|Titre|Organisme|Description|Éligibilité|Secteurs|Types|Zone):

${grantsDatabase}

---

Analyse ce profil et retourne UNIQUEMENT les IDs des subventions pertinentes (pas de remplissage si peu de résultats valables).`;

  try {
    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const aiResponse = await callOpenRouter(messages);
    
    console.log(`🤖 Réponse IA reçue: ${aiResponse}`);

    // Parse AI response to extract grant IDs
    const grantIds = aiResponse
      .trim()
      .split(",")
      .map(id => id.trim())
      .filter(id => id.length > 0);

    console.log(`✅ IDs sélectionnés par l'IA: ${grantIds.join(", ")}`);

    // Find matched grants (from domain-filtered grants only)
    const matchedGrants = grantIds
      .map(id => domainFilteredGrants.find(grant => grant.id === id))
      .filter((grant): grant is GrantResult => grant !== undefined);

    console.log(`✅ ${matchedGrants.length} subventions matchées avec succès`);

    // 4. Enrichissement à la volée des grants dont le score qualité < 80
    //    (description, éligibilité, organisme manquants/courts → comblés via DeepSeek)
    //    Persisté en DB pour profiter aux futurs utilisateurs.
    const refreshedGrants = await enrichLowQualityMatches(matchedGrants);

    // 5. Enrichir chaque subvention avec montant, difficulté et conseils PERSONNALISÉS
    //    pour le profil de l'utilisateur courant (pas persisté car spécifique au user)
    console.log("🔍 Enrichissement personnalisé des subventions avec l'IA...");
    const enrichedGrants = await enrichGrantsWithAI(refreshedGrants, submission);

    // 6. Post-filtre qualité : l'étape d'enrichissement génère un matchScore par
    //    grant. Si l'IA elle-même a reconnu un faible fit (< MATCH_SCORE_THRESHOLD),
    //    on éjecte — mieux vaut 1 résultat vraiment pertinent que 5 médiocres.
    //    Fallback : si TOUT est filtré, on garde le meilleur pour ne pas renvoyer 0.
    const MATCH_SCORE_THRESHOLD = 65;
    const highQuality = enrichedGrants.filter(
      (g) => (g.matchScore ?? 0) >= MATCH_SCORE_THRESHOLD
    );
    const filtered = enrichedGrants.length - highQuality.length;
    if (filtered > 0) {
      console.log(
        `🎯 Post-filtre matchScore ≥ ${MATCH_SCORE_THRESHOLD} : ${filtered} résultats médiocres écartés`
      );
    }
    if (highQuality.length === 0 && enrichedGrants.length > 0) {
      const best = [...enrichedGrants].sort(
        (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
      )[0];
      console.log(
        `⚠️ Aucune grant au-dessus du seuil ${MATCH_SCORE_THRESHOLD} — on renvoie la meilleure (score ${best.matchScore})`
      );
      return [best];
    }

    // Re-trier par matchScore décroissant au cas où l'ordre IA initial diverge
    highQuality.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    return highQuality;
  } catch (error: any) {
    console.error("❌ Erreur matching IA:", error.message);
    throw error;
  }
}

/**
 * Pour chaque grant matchée dont le score qualité est sous le seuil
 * d'enrichissement (80), tente de combler les champs manquants via DeepSeek
 * (`enrichGrant` de ai-enricher.ts). Les données enrichies sont PERSISTÉES
 * en DB et bénéficient à tous les futurs utilisateurs.
 *
 * Tourne en parallèle (Promise.all) pour rester sous la barre des 30s d'attente.
 */
async function enrichLowQualityMatches(matched: GrantResult[]): Promise<GrantResult[]> {
  const candidates = matched.filter((g) => needsEnrichment(g));
  if (candidates.length === 0) {
    console.log("✅ Toutes les grants matchées sont déjà bien renseignées");
    return matched;
  }

  console.log(
    `🔧 Enrichissement à la volée de ${candidates.length}/${matched.length} grants sous le seuil qualité 80`
  );

  // Lancer tous les enrichissements en parallèle
  await Promise.all(
    candidates.map(async (grant) => {
      const breakdown = calculateQualityScore(grant);
      // Construire les "issues" attendues par enrichGrant() (format de ai-enricher.ts)
      const issues: Array<{
        grantId: string;
        grantTitle: string;
        field: string;
        issue: string;
        severity: "critical" | "warning" | "info";
      }> = [];

      if (!breakdown.hasOrganization) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: "organization",
          issue: "Organisme manquant",
          severity: "critical",
        });
      }
      if (!breakdown.hasDescription) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: "description",
          issue: "Description manquante",
          severity: "critical",
        });
      }
      if (!breakdown.hasEligibility) {
        issues.push({
          grantId: grant.id,
          grantTitle: grant.title,
          field: "eligibility",
          issue: "Éligibilité manquante",
          severity: "critical",
        });
      }

      if (issues.length > 0) {
        try {
          await enrichGrant(grant.id, issues);
        } catch (e: any) {
          // On ne bloque pas le pipeline si l'enrichissement échoue
          console.warn(`⚠️ Enrichissement à la volée échoué pour ${grant.id}: ${e.message}`);
        }
      }
    })
  );

  // Re-fetch les grants enrichies depuis la DB pour récupérer les valeurs à jour
  const refreshed = await Promise.all(
    matched.map(async (g) => {
      try {
        const [fresh] = await db.select().from(grantsTable).where(eq(grantsTable.id, g.id));
        if (!fresh) return g;
        // Merger les champs enrichissables tout en gardant les enrichissements
        // user-specifiques (matchScore, matchReason) qui n'existent pas en DB
        return {
          ...g,
          title: fresh.title,
          organization: fresh.organization,
          description: fresh.description ?? g.description,
          eligibility: fresh.eligibility ?? g.eligibility,
        } as GrantResult;
      } catch {
        return g;
      }
    })
  );

  return refreshed;
}

/**
 * Enrich matched grants with AI-generated metadata.
 * Runs in parallel (Promise.allSettled) to stay under 15s.
 * Generates: matchScore, matchReason, amount estimate, difficulty, advice.
 */
async function enrichGrantsWithAI(
  grants: GrantResult[],
  submission: FormSubmission
): Promise<GrantResult[]> {
  // Null-safe profile summary
  const statusStr = submission.status?.join(", ") ?? "Non spécifié";
  const domainStr = submission.artisticDomain?.join(", ") ?? "Non spécifié";
  const typeStr = submission.projectType?.join(", ") ?? "Non spécifié";
  const stageStr = submission.projectStage ?? "Non spécifié";
  const descStr = submission.projectDescription ?? "Non spécifié";

  const results = await Promise.allSettled(
    grants.map(async (grant, index) => {
      const enrichmentPrompt = `Analyse cette subvention culturelle pour cet utilisateur :

SUBVENTION :
Titre: ${grant.title}
Organisme: ${grant.organization}
Description: ${(grant.description || "Non spécifiée").substring(0, 500)}
Éligibilité: ${(grant.eligibility || "Non spécifiée").substring(0, 300)}
Montant actuel: ${grant.amount}

PROFIL UTILISATEUR :
- Statut : ${statusStr}
- Domaine artistique : ${domainStr}
- Type de projet : ${typeStr}
- Stade : ${stageStr}
- Description : ${descStr}

TÂCHE : Génère en JSON strict :
1. "matchScore" (0-100) : pertinence de cette subvention pour CE profil
2. "matchReason" (1-2 phrases en français) : pourquoi cette subvention correspond au profil. Sois spécifique sur les liens entre le profil et l'aide.
3. "amount" : estimation du montant si non précisé, sinon garder l'existant
4. "difficulty" : "facile"|"moyen"|"difficile"
5. "advice" : 2-3 conseils personnalisés concrets (50-80 mots)

Format :
{"matchScore":85,"matchReason":"...","amount":"...","difficulty":"moyen","advice":"..."}`;

      const messages: OpenRouterMessage[] = [
        { role: "system", content: "Tu es un expert en subventions culturelles françaises. Réponds UNIQUEMENT en JSON valide." },
        { role: "user", content: enrichmentPrompt },
      ];

      const aiResponse = await callOpenRouter(messages);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const enrichment = JSON.parse(jsonMatch[0]);
        console.log(`✅ Enrichi: ${grant.title.substring(0, 40)}... (score: ${enrichment.matchScore})`);
        return {
          ...grant,
          matchScore: enrichment.matchScore ?? (95 - index * 5),
          matchReason: enrichment.matchReason ?? undefined,
          amount: enrichment.amount || grant.amount,
          applicationDifficulty: enrichment.difficulty || undefined,
          preparationAdvice: enrichment.advice || undefined,
        } as GrantResult;
      }
      console.warn(`⚠️ Pas de JSON valide pour: ${grant.title}`);
      return { ...grant, matchScore: 90 - index * 5 } as GrantResult;
    })
  );

  return results.map((result, i) => {
    if (result.status === "fulfilled") return result.value;
    console.warn(`⚠️ Erreur enrichissement pour ${grants[i].title}:`, (result.reason as Error).message);
    return { ...grants[i], matchScore: 85 - i * 5 } as GrantResult;
  });
}
