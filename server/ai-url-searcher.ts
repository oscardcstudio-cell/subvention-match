import axios from "axios";
import { grantStorage } from "./grant-storage";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function deepSearchUrl(grantId: string): Promise<{ success: boolean; foundUrl: string | null; method: string }> {
  const grant = await grantStorage.getGrantById(grantId);
  if (!grant) return { success: false, foundUrl: null, method: "not_found" };

  if (!OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY is missing");
    return { success: false, foundUrl: null, method: "api_key_missing" };
  }

  const query = `Trouve l'URL directe du dossier de candidature ou de la page de détails pour la subvention culturelle suivante en France.

INFORMATIONS :
Titre : ${grant.title}
Organisme : ${grant.organization}
Description : ${grant.description?.substring(0, 300)}...
URL actuelle (souvent générique) : ${grant.url || "Aucune"}

CONSIGNES :
1. Recherche spécifiquement la page de cet organisme qui détaille cette aide précise.
2. Si tu trouves plusieurs URLs, choisis celle qui mène au formulaire ou à la notice technique.
3. Si l'organisme est la SPEDIDAM, cherche dans leur portail d'aides.
4. Si l'organisme est l'ADAMI, cherche dans leur catalogue d'aides.
5. Réponds UNIQUEMENT avec l'URL (ex: https://...) ou "NOT_FOUND" si tu es certain qu'elle n'existe pas. Pas de texte explicatif.`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: query }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://replit.com",
          "X-Title": "SubventionMatch",
        },
      }
    );

    const foundUrl = response.data.choices[0].message.content.trim();
    if (foundUrl && foundUrl.startsWith("http")) {
      console.log(`✅ AI found URL for ${grantId}: ${foundUrl}`);
      await grantStorage.updateGrant(grantId, { 
        url: foundUrl, // Update the main URL
        improvedUrl: foundUrl 
      });
      return { success: true, foundUrl, method: "ai_deepsearch" };
    }

    return { success: false, foundUrl: null, method: "ai_no_url" };
  } catch (error: any) {
    console.error("❌ Error in deepSearchUrl AI:", error.message);
    return { success: false, foundUrl: null, method: "ai_error" };
  }
}

export async function deepSearchAllUrls(limit: number = 30): Promise<{ processed: number; success: number; failed: number }> {
  const allGrants = await grantStorage.getAllActiveGrants();
  const grantsToProcess = allGrants.filter(g => !g.improvedUrl || g.improvedUrl.includes('#no-match')).slice(0, limit);

  let success = 0;
  let failed = 0;

  for (const grant of grantsToProcess) {
    const result = await deepSearchUrl(grant.id);
    if (result.success) success++;
    else failed++;
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { processed: grantsToProcess.length, success, failed };
}
