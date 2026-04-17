/**
 * Enrichissement des montants pour toutes les grants sans montant
 *
 * Stratégie 3 couches :
 * 1. Re-fetch API Aides Territoires → subvention_comment + rates
 * 2. Scraping léger de l'URL de la grant → extraction texte
 * 3. DeepSeek → extraction structurée des montants
 *
 * Usage: npx tsx scripts/enrich-amounts.ts [--limit N] [--dry-run]
 */
import { db } from "../server/db.js";
import { grants } from "../shared/schema.js";
import { sql, eq, and, isNull } from "drizzle-orm";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const AIDES_API_KEY = process.env.AIDES_ET_TERRITOIRES_API_KEY;
const AIDES_API = "https://aides-territoires.beta.gouv.fr/api";

// ── Helpers ──────────────────────────────────────────────────────────

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function callDeepSeek(prompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY manquante");

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://subventionmatch.com",
          "X-Title": "SubventionMatch",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "Tu es un expert en subventions publiques françaises. " +
                "Extrais les montants de manière factuelle. Ne jamais inventer de chiffres.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (resp.status === 429 || resp.status >= 500) {
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      if (!resp.ok) throw new Error(`API ${resp.status}`);

      const data = await resp.json();
      return data.choices[0]?.message?.content || "";
    } catch (e) {
      if (attempt < 2) { await new Promise((r) => setTimeout(r, 3000)); continue; }
      throw e;
    }
  }
  return "";
}

// ── Couche 1 : API Aides Territoires ─────────────────────────────────

interface ApiAmountData {
  subventionComment: string | null;
  rateLower: number | null;
  rateUpper: number | null;
  loanAmount: number | null;
}

async function fetchApiAmounts(title: string): Promise<ApiAmountData | null> {
  if (!AIDES_API_KEY) return null;

  try {
    // Auth
    const authResp = await fetch(`${AIDES_API}/connexion/`, {
      method: "POST",
      headers: { "X-AUTH-TOKEN": AIDES_API_KEY, "Content-Type": "application/json" },
    });
    if (!authResp.ok) return null;
    const { token } = (await authResp.json()) as { token: string };

    // Recherche par titre (mots-clés)
    const keywords = title
      .replace(/[^a-zA-ZÀ-ÿ\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 5)
      .join(" ");

    const params = new URLSearchParams({ text: keywords, page_size: "5" });
    const resp = await fetch(`${AIDES_API}/aids/?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!resp.ok) return null;

    const data: any = await resp.json();
    if (!data.results?.length) return null;

    // Trouver la meilleure correspondance
    const titleLower = title.toLowerCase();
    const match = data.results.find((a: any) =>
      a.name?.toLowerCase().includes(titleLower.substring(0, 30).toLowerCase()) ||
      titleLower.includes(a.name?.toLowerCase().substring(0, 30))
    ) || data.results[0];

    if (!match.subvention_comment && !match.subvention_rate_lower_bound && !match.loan_amount) {
      return null;
    }

    return {
      subventionComment: match.subvention_comment ? stripHtml(match.subvention_comment) : null,
      rateLower: match.subvention_rate_lower_bound,
      rateUpper: match.subvention_rate_upper_bound,
      loanAmount: match.loan_amount,
    };
  } catch {
    return null;
  }
}

// ── Couche 2 : Scraping léger de l'URL ───────────────────────────────

async function scrapeAmountFromUrl(url: string): Promise<string | null> {
  if (!url || url === "#") return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SubventionMatch/1.0)",
        Accept: "text/html",
      },
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;

    const html = await resp.text();
    // Extraire le texte brut, limiter à 8000 chars
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Chercher des patterns de montant
    const amountPatterns = [
      /(\d[\d\s.,]*\s*€)/gi,
      /(montant[\s:]*[\d\s.,]+)/gi,
      /(plafond[\s:]*[\d\s.,]+)/gi,
      /(subvention[\s:]*[\d\s.,]+)/gi,
      /(aide[\s:]*(?:de\s+)?[\d\s.,]+\s*€)/gi,
      /(\d+[\s.,]\d+\s*euros?)/gi,
      /(\d+\s*%\s*(?:du|des|maximum|max))/gi,
    ];

    const matches: string[] = [];
    for (const pattern of amountPatterns) {
      const found = text.match(pattern);
      if (found) matches.push(...found.slice(0, 3));
    }

    if (matches.length === 0) return null;

    // Retourner un extrait de contexte autour des montants trouvés
    // Prendre les 2000 chars autour des premiers matches
    const firstMatchIdx = text.toLowerCase().indexOf(matches[0].toLowerCase());
    if (firstMatchIdx >= 0) {
      const start = Math.max(0, firstMatchIdx - 500);
      const end = Math.min(text.length, firstMatchIdx + 1500);
      return text.substring(start, end);
    }

    return matches.join(" | ");
  } catch {
    return null;
  }
}

// ── Couche 3 : Extraction IA ─────────────────────────────────────────

interface ExtractedAmount {
  amountMin: number | null;
  amountMax: number | null;
  maxFundingRate: number | null;
  amountComment: string | null;
}

async function extractAmountsWithAI(
  title: string,
  apiData: ApiAmountData | null,
  scrapedText: string | null,
  description: string
): Promise<ExtractedAmount | null> {
  const sources: string[] = [];

  if (apiData?.subventionComment) {
    sources.push(`COMMENTAIRE API: "${apiData.subventionComment}"`);
  }
  if (apiData?.rateLower || apiData?.rateUpper) {
    sources.push(`TAUX API: min=${apiData.rateLower || "?"}%, max=${apiData.rateUpper || "?"}%`);
  }
  if (scrapedText) {
    sources.push(`EXTRAIT PAGE WEB: "${scrapedText.substring(0, 2000)}"`);
  }
  if (sources.length === 0) {
    // Fallback: utiliser la description
    sources.push(`DESCRIPTION: "${stripHtml(description).substring(0, 1500)}"`);
  }

  const prompt = `Extrais les informations de montant pour cette subvention culturelle française.

TITRE: "${title}"
${sources.join("\n")}

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "amountMin": <nombre en euros ou null si inconnu>,
  "amountMax": <nombre en euros ou null si inconnu>,
  "maxFundingRate": <pourcentage entier 0-100 ou null si inconnu>,
  "amountComment": "<résumé court du montant en français, max 100 chars, ou null>"
}

RÈGLES STRICTES :
- Ne JAMAIS inventer de chiffres. Si l'info n'est pas dans les sources → null
- Les montants en euros (pas de centimes). Ex: 5000, 50000
- Si "variable selon projet" ou similaire → amountMin=null, amountMax=null, amountComment="Variable selon projet"
- Si un taux (%) est mentionné → maxFundingRate. Ex: "30% max" → 30
- Si un plafond est mentionné → amountMax. Ex: "plafonné à 5000€" → amountMax=5000
- Si un plancher est mentionné → amountMin. Ex: "minimum 1000€" → amountMin=1000`;

  try {
    const response = await callDeepSeek(prompt);

    // Parser le JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validation
    if (parsed.amountMin && (typeof parsed.amountMin !== "number" || parsed.amountMin < 0)) parsed.amountMin = null;
    if (parsed.amountMax && (typeof parsed.amountMax !== "number" || parsed.amountMax < 0)) parsed.amountMax = null;
    if (parsed.maxFundingRate && (typeof parsed.maxFundingRate !== "number" || parsed.maxFundingRate < 0 || parsed.maxFundingRate > 100)) parsed.maxFundingRate = null;

    // Rejeter si tout est null (pas d'info trouvée)
    if (!parsed.amountMin && !parsed.amountMax && !parsed.maxFundingRate && !parsed.amountComment) {
      return null;
    }

    return {
      amountMin: parsed.amountMin || null,
      amountMax: parsed.amountMax || null,
      maxFundingRate: parsed.maxFundingRate || null,
      amountComment: typeof parsed.amountComment === "string" ? parsed.amountComment.substring(0, 200) : null,
    };
  } catch {
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function run() {
  const startTime = Date.now();

  console.log("=".repeat(60));
  console.log("  ENRICHISSEMENT MONTANTS — SubventionMatch");
  if (DRY_RUN) console.log("  (DRY RUN — pas d'écriture en DB)");
  console.log("=".repeat(60));
  console.log();

  // Grants sans montant
  let grantsToEnrich = await db
    .select({
      id: grants.id,
      title: grants.title,
      organization: grants.organization,
      description: grants.description,
      url: grants.url,
      improvedUrl: grants.improvedUrl,
      amount: grants.amount,
      amountMin: grants.amountMin,
      amountMax: grants.amountMax,
      maxFundingRate: grants.maxFundingRate,
    })
    .from(grants)
    .where(
      sql`status = 'active' AND amount IS NULL AND amount_min IS NULL AND amount_max IS NULL`
    );

  console.log(`Grants sans montant: ${grantsToEnrich.length}`);

  if (LIMIT < Infinity) {
    grantsToEnrich = grantsToEnrich.slice(0, LIMIT);
    console.log(`Limite: ${LIMIT}`);
  }
  console.log();

  let updated = 0;
  let fromApi = 0;
  let fromScrape = 0;
  let noData = 0;
  let errors = 0;

  for (let i = 0; i < grantsToEnrich.length; i++) {
    const grant = grantsToEnrich[i];
    const shortTitle = (grant.title || "").substring(0, 50);

    process.stdout.write(`[${i + 1}/${grantsToEnrich.length}] ${shortTitle}... `);

    try {
      // Couche 1: API
      const apiData = await fetchApiAmounts(grant.title);
      let source = apiData ? "api" : "";

      // Couche 2: Scraping si pas assez de l'API
      let scrapedText: string | null = null;
      if (!apiData?.subventionComment) {
        const url = grant.improvedUrl || grant.url;
        if (url) {
          scrapedText = await scrapeAmountFromUrl(url);
          if (scrapedText && !source) source = "scrape";
        }
      }

      // Couche 3: IA
      if (apiData || scrapedText) {
        const extracted = await extractAmountsWithAI(
          grant.title,
          apiData,
          scrapedText,
          grant.description || ""
        );

        if (extracted && (extracted.amountMin || extracted.amountMax || extracted.maxFundingRate)) {
          const updates: Record<string, any> = {};
          if (extracted.amountMin) updates.amountMin = extracted.amountMin;
          if (extracted.amountMax) updates.amountMax = extracted.amountMax;
          if (extracted.maxFundingRate && !grant.maxFundingRate) updates.maxFundingRate = extracted.maxFundingRate;

          if (Object.keys(updates).length > 0) {
            if (!DRY_RUN) {
              await db.update(grants).set({ ...updates, updatedAt: new Date() }).where(eq(grants.id, grant.id));
            }
            updated++;
            if (source === "api") fromApi++;
            else fromScrape++;

            const parts = [];
            if (updates.amountMin) parts.push(`min=${updates.amountMin}€`);
            if (updates.amountMax) parts.push(`max=${updates.amountMax}€`);
            if (updates.maxFundingRate) parts.push(`rate=${updates.maxFundingRate}%`);
            console.log(`✅ ${parts.join(", ")} [${source}]`);
          } else if (extracted.amountComment) {
            // Juste un commentaire, pas de chiffre → skip
            console.log(`⚪ "${extracted.amountComment}" (pas de chiffre)`);
            noData++;
          } else {
            console.log("⚪ rien trouvé");
            noData++;
          }
        } else {
          console.log("⚪ IA n'a rien extrait");
          noData++;
        }
      } else {
        console.log("⚪ pas de source");
        noData++;
      }
    } catch (e: any) {
      console.log(`❌ ${e.message?.substring(0, 60)}`);
      errors++;
    }

    // Pause
    if (i < grantsToEnrich.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }

    // Progress
    if ((i + 1) % 50 === 0) {
      const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
      console.log(`\n--- Progress: ${i + 1}/${grantsToEnrich.length} | ${updated} enrichis | ${elapsed}m ---\n`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log("\n" + "=".repeat(60));
  console.log("  RÉSUMÉ");
  console.log("=".repeat(60));
  console.log(`  Durée: ${elapsed} min`);
  console.log(`  Enrichis: ${updated}/${grantsToEnrich.length}`);
  console.log(`    - depuis API: ${fromApi}`);
  console.log(`    - depuis scraping: ${fromScrape}`);
  console.log(`  Sans données: ${noData}`);
  console.log(`  Erreurs: ${errors}`);

  // Vérif finale
  const [final] = await db
    .select({ withAny: sql<number>`count(*) filter (where amount is not null or amount_min is not null or amount_max is not null)::int` })
    .from(grants)
    .where(sql`status = 'active'`);
  console.log(`\n  Grants avec montant maintenant: ${final.withAny}/264`);
  console.log("=".repeat(60));
}

run()
  .then(() => process.exit(0))
  .catch((e) => { console.error("Erreur fatale:", e); process.exit(1); });
