import type { FormSubmission, GrantResult } from "@shared/schema";

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
      "HTTP-Referer": process.env.REPLIT_DOMAINS || "https://subventionmatch.replit.app",
      "X-Title": "SubventionMatch",
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
 * Filter grants by deadline - keep only grants that are open or recurring
 */
function filterGrantsByDeadline(grants: GrantResult[]): GrantResult[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return grants.filter(grant => {
    // If no deadline specified, keep it (recurring grants without specific dates)
    if (!grant.deadline || grant.deadline.trim() === '') {
      return true;
    }

    // If grant has frequency info, it's recurring - keep it even if deadline passed
    // We'll show "Prochaine session" in the UI
    if (grant.frequency && grant.frequency.trim() !== '') {
      return true;
    }

    try {
      const deadlineDate = new Date(grant.deadline);
      deadlineDate.setHours(23, 59, 59, 999);
      
      // For non-recurring grants, keep only if deadline is in the future
      return deadlineDate >= today;
    } catch (e) {
      // If date parsing fails, keep the grant to be safe
      console.warn(`⚠️ Could not parse deadline for grant ${grant.id}: ${grant.deadline}`);
      return true;
    }
  });
}

/**
 * Match user profile with grants using AI
 */
export async function matchGrantsWithAI(
  submission: FormSubmission,
  allGrants: GrantResult[]
): Promise<GrantResult[]> {
  // Filter out grants with passed deadlines
  const openGrants = filterGrantsByDeadline(allGrants);
  console.log(`🤖 Démarrage du matching IA pour ${openGrants.length} subventions ouvertes (${allGrants.length - openGrants.length} deadline passée)...`);

  // Build user profile summary (gérer les champs vides)
  const hasStatus = submission.status && submission.status.length > 0;
  const hasArtisticDomain = submission.artisticDomain && submission.artisticDomain.length > 0;
  const hasProjectType = submission.projectType && submission.projectType.length > 0;
  
  const userProfile = `
Profil de l'utilisateur :
- Statut : ${hasStatus ? submission.status.join(", ") : "Non spécifié"}${submission.statusOther ? ` (${submission.statusOther})` : ""}
- Domaine artistique : ${hasArtisticDomain ? submission.artisticDomain.join(", ") : "Non spécifié"}${submission.artisticDomainOther ? ` (${submission.artisticDomainOther})` : ""}
- Région : ${submission.region || "Non spécifiée"}
- International : ${submission.isInternational || "Non spécifié"}

Projet :
- Description : ${submission.projectDescription || "Non spécifiée"}
- Type : ${hasProjectType ? submission.projectType.join(", ") : "Non spécifié"}${submission.projectTypeOther ? ` (${submission.projectTypeOther})` : ""}
- Stade : ${submission.projectStage || "Non spécifié"}

Critères :
- Innovation : ${submission.innovation?.join(", ") || "Non spécifié"}${submission.innovationOther ? ` (${submission.innovationOther})` : ""}
- Dimension sociale : ${submission.socialDimension?.join(", ") || "Non spécifié"}${submission.socialDimensionOther ? ` (${submission.socialDimensionOther})` : ""}
- Urgence : ${submission.urgency || "Non spécifié"}
- Types d'aide recherchés : ${submission.aidTypes?.join(", ") || "Non spécifié"}${submission.aidTypesOther ? ` (${submission.aidTypesOther})` : ""}
- Périmètre géographique : ${submission.geographicScope?.join(", ") || "Non spécifié"}
`.trim();

  // Build grants database for AI (using only open grants) - COMPACT FORMAT
  // Limit info per grant to stay under token limit
  const grantsDatabase = openGrants.map((grant) => {
    // Ultra-compact format: ID | Title | Org | Eligibility (first 150 chars)
    const eligibilityShort = grant.eligibility?.substring(0, 150) || "";
    const sectorsShort = grant.eligibleSectors?.slice(0, 3).join(",") || "";
    return `${grant.id}|${grant.title}|${grant.organization}|${eligibilityShort}|${sectorsShort}`;
  }).join("\n");

  // System prompt
  const systemPrompt = `Tu es un expert en subventions culturelles françaises et européennes. Ta mission est d'analyser le profil d'un artiste/structure culturelle et de sélectionner les 5-10 subventions les plus pertinentes parmi une base de données.

⚠️ RÈGLES D'ÉLIGIBILITÉ CRITIQUES :

**Statut juridique** (TRÈS IMPORTANT) :
- Les aides "Commission Européenne - Creative Europe" nécessitent une STRUCTURE LÉGALE (association, micro-entreprise, collectif avec SIRET)
- Si l'utilisateur est "artiste-auto" (auto-entrepreneur individuel) SANS association/collectif, NE PAS matcher les aides EU Creative Europe
- Les artistes individuels peuvent candidater aux aides françaises (CNC, DRAC, CNM, etc.)
- Si l'utilisateur a une association OU micro-entreprise OU collectif : TOUTES les aides sont éligibles (FR + EU)

**Périmètre géographique** :
- Aides régionales : Vérifier que la région de l'utilisateur correspond
- Aides EU Creative Europe : Ouvertes à tous les pays UE (France incluse) mais STRUCTURE OBLIGATOIRE
- Aides nationales françaises : Accessibles depuis toute la France

Critères de matching importants (par ordre de priorité) :
1. **Statut juridique compatible** (structure pour EU, tout pour FR)
2. Correspondance avec le domaine artistique
3. Adéquation avec le type de projet (création, diffusion, médiation, etc.)
4. Cohérence avec la localisation géographique
5. Alignement avec le stade du projet (idée, développement, production, finalisation)
6. Montant adapté au projet
7. Urgence compatible avec les délais de l'aide
8. Dimension sociale et innovation si pertinent

Tu dois retourner UNIQUEMENT une liste d'IDs de subventions séparés par des virgules, dans l'ordre de pertinence (la plus pertinente en premier).
Format attendu : id1,id2,id3,id4,id5

Ne retourne que les IDs, rien d'autre. Maximum 10 subventions.`;

  const userPrompt = `${userProfile}

---

Base de données des subventions (format: ID|Titre|Organisme|Éligibilité|Secteurs):

${grantsDatabase}

---

Analyse ce profil et retourne les IDs des 5-10 subventions les plus pertinentes, séparés par des virgules (format: id1,id2,id3).`;

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

    // Find and return the matched grants (from open grants only)
    const matchedGrants = grantIds
      .map(id => openGrants.find(grant => grant.id === id))
      .filter((grant): grant is GrantResult => grant !== undefined);

    console.log(`✅ ${matchedGrants.length} subventions matchées avec succès`);

    // Enrichir chaque subvention avec montant, difficulté et conseils
    console.log("🔍 Enrichissement des subventions avec l'IA...");
    const enrichedGrants = await enrichGrantsWithAI(matchedGrants, submission);

    return enrichedGrants;
  } catch (error: any) {
    console.error("❌ Erreur matching IA:", error.message);
    throw error;
  }
}

/**
 * Enrich matched grants with AI-generated metadata
 */
async function enrichGrantsWithAI(
  grants: GrantResult[],
  submission: FormSubmission
): Promise<GrantResult[]> {
  const enrichedGrants: GrantResult[] = [];

  for (const grant of grants) {
    try {
      const enrichmentPrompt = `Analyse cette subvention culturelle et fournis des métadonnées enrichies :

SUBVENTION :
Titre: ${grant.title}
Organisme: ${grant.organization}
Description: ${grant.description || "Non spécifiée"}
Éligibilité: ${grant.eligibility || "Non spécifiée"}
Montant actuel: ${grant.amount}

PROFIL UTILISATEUR :
- Statut : ${submission.status.join(", ")}
- Domaine artistique : ${submission.artisticDomain.join(", ")}
- Type de projet : ${submission.projectType.join(", ")}
- Stade : ${submission.projectStage}
- Description : ${submission.projectDescription}

TÂCHE :
Analyse cette subvention et génère :

1. **Montant estimé** : Si le montant n'est pas précisé ou est "Montant variable", estime-le basé sur la description (ex: "5 000 - 15 000 €", "Jusqu'à 50 000 €", "Variable selon projet"). Garde le montant actuel s'il semble correct.

2. **Difficulté** : Évalue la difficulté du dossier (facile/moyen/difficile) basé sur :
   - Complexité des critères d'éligibilité
   - Documents requis
   - Type d'organisme (EU = difficile, local = plus facile)

3. **Conseils** : 2-3 conseils concrets et personnalisés pour ce profil spécifique (50-80 mots). Mentionne des éléments précis du projet de l'utilisateur.

Format de réponse (JSON strict) :
{
  "amount": "montant estimé ici",
  "difficulty": "facile|moyen|difficile",
  "advice": "conseils personnalisés ici"
}`;

      const messages: OpenRouterMessage[] = [
        { role: "system", content: "Tu es un expert en subventions culturelles françaises. Réponds UNIQUEMENT en JSON valide." },
        { role: "user", content: enrichmentPrompt },
      ];

      const aiResponse = await callOpenRouter(messages);
      
      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const enrichment = JSON.parse(jsonMatch[0]);
        
        enrichedGrants.push({
          ...grant,
          amount: enrichment.amount || grant.amount,
          applicationDifficulty: enrichment.difficulty || undefined,
          preparationAdvice: enrichment.advice || undefined,
        });
        
        console.log(`✅ Subvention enrichie: ${grant.title.substring(0, 40)}...`);
      } else {
        console.warn(`⚠️ Pas de JSON valide pour: ${grant.title}`);
        enrichedGrants.push(grant);
      }
    } catch (error: any) {
      console.warn(`⚠️ Erreur enrichissement pour ${grant.title}:`, error.message);
      enrichedGrants.push(grant);
    }
  }

  return enrichedGrants;
}
