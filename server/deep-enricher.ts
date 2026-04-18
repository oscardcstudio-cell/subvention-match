/**
 * Deep Enricher — extrait en une seule passe IA tous les champs structurés
 * manquants depuis le texte existant (title + description + eligibility).
 *
 * Contrairement à `ai-enricher.ts` qui ne corrigeait que 4 champs,
 * ce module synthétise simultanément :
 *   - applicationDifficulty  (facile | moyen | difficile)
 *   - preparationAdvice      (2-3 conseils concrets)
 *   - requirements           (pièces à fournir — texte)
 *   - obligatoryDocuments    (array)
 *   - eligibleSectors        (array — musique, audiovisuel, etc.)
 *   - geographicZone         (array — "National", "Île-de-France", "Europe", etc.)
 *   - grantType              (array — création, diffusion, résidence, équipement…)
 *   - amount / amountMin / amountMax (si extractible du texte)
 *   - contactEmail / contactPhone     (si extractible du texte)
 *
 * Principe : on ne demande à l'IA QUE ce qu'on peut inférer depuis le texte
 * fourni. On rejette toute hallucination (montants sortis de nulle part,
 * emails inventés, etc.). Si un champ n'est pas inférable → `null`.
 */

import { db } from "./db";
import { grants } from "@shared/schema";
import { eq } from "drizzle-orm";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "deepseek/deepseek-chat";
const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 5_000;

if (!OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY manquante — deep-enricher désactivé");
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export interface DeepEnrichmentResult {
  grantId: string;
  success: boolean;
  changes: string[];
  error?: string;
}

async function callDeepSeek(prompt: string, retries = MAX_RETRIES): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY manquante");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://subventionmatch.com",
            "X-Title": "SubventionMatch",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              {
                role: "system",
                content:
                  "Tu es un expert en subventions culturelles françaises. Tu analyses des fiches de subvention pour en extraire des métadonnées structurées. " +
                  "Règle d'or : tu n'inventes JAMAIS d'information. Si un élément n'est pas présent dans le texte fourni, tu réponds `null`. " +
                  "Tu réponds uniquement en JSON valide, sans markdown.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.1,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const delay = RETRY_DELAY_MS * (attempt + 1);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(`OpenRouter ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (err) {
      if (attempt < retries && err instanceof TypeError) {
        const delay = RETRY_DELAY_MS * (attempt + 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries atteint");
}

/** Valide qu'un email a bien une forme email. */
function validEmail(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const cleaned = s.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleaned)) return null;
  return cleaned;
}

/** Extrait un nombre depuis un string (retourne null si pas de nombre > 100). */
function parseAmount(s: unknown): number | null {
  if (typeof s === "number" && s > 0) return Math.round(s);
  if (typeof s !== "string") return null;
  const match = s.replace(/\s/g, "").match(/(\d{3,9})/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n >= 100 && n <= 10_000_000 ? n : null;
}

/** Valide une string non-vide, rejette les réponses passe-partout. */
function validString(s: unknown, min = 10, max = 2000): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (t.length < min || t.length > max) return null;
  const lower = t.toLowerCase();
  if (lower === "null" || lower === "non spécifié" || lower === "inconnu") return null;
  return t;
}

function validStringArray(arr: unknown, min = 1, maxItems = 10): string[] | null {
  if (!Array.isArray(arr) || arr.length === 0 || arr.length > maxItems) return null;
  const clean = arr
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length >= min && x.length < 200);
  return clean.length > 0 ? clean : null;
}

function validDifficulty(s: unknown): string | null {
  if (typeof s !== "string") return null;
  const t = s.trim().toLowerCase();
  if (["facile", "moyen", "difficile"].includes(t)) return t;
  return null;
}

/**
 * Enrichit une grant en une seule passe IA.
 */
export async function deepEnrichGrant(grantId: string): Promise<DeepEnrichmentResult> {
  try {
    const [grant] = await db.select().from(grants).where(eq(grants.id, grantId));
    if (!grant) return { grantId, success: false, changes: [], error: "not found" };

    const titleText = grant.title ?? "";
    const descText = stripHtml(grant.description).substring(0, 3000);
    const eligText = stripHtml(grant.eligibility).substring(0, 2000);
    const orgText = grant.organization ?? "";
    const urlText = grant.url ?? "";

    // Champs déjà remplis qu'on ne veut pas écraser (sauf si vides)
    const hasAmount = !!(grant.amount || grant.amountMin || grant.amountMax);
    const hasDifficulty = !!grant.applicationDifficulty;
    const hasAdvice = !!(grant.preparationAdvice && grant.preparationAdvice.length > 30);
    const hasRequirements = !!(grant.requirements && grant.requirements.length > 20);
    const hasDocs = !!(grant.obligatoryDocuments && grant.obligatoryDocuments.length > 0);
    const hasSectors = !!(grant.eligibleSectors && grant.eligibleSectors.length > 0);
    const hasZone = !!(grant.geographicZone && grant.geographicZone.length > 0);
    const hasType = !!(grant.grantType && grant.grantType.length > 0);
    const hasContactEmail = !!grant.contactEmail;
    const hasContactPhone = !!grant.contactPhone;

    // Si tout est déjà rempli, skip
    const allFilled =
      hasAmount &&
      hasDifficulty &&
      hasAdvice &&
      hasRequirements &&
      hasDocs &&
      hasSectors &&
      hasZone &&
      hasType;
    if (allFilled) {
      return { grantId, success: true, changes: [] };
    }

    const prompt = `FICHE SUBVENTION :
Titre : ${titleText}
Organisme : ${orgText}
Description : ${descText}
Éligibilité : ${eligText}
URL : ${urlText}

Tâche : extrais les métadonnées structurées SUIVANTES depuis le texte ci-dessus.
Pour CHAQUE champ, si l'information n'est PAS présente dans le texte, renvoie null.
Tu n'inventes RIEN. Si tu hésites, renvoie null.

Réponds en JSON strict :
{
  "applicationDifficulty": "facile" | "moyen" | "difficile" | null,
  "preparationAdvice": string(100-400 chars, 2-3 conseils PRATIQUES basés sur le dispositif) | null,
  "requirements": string(30-500 chars, description brève des pièces à fournir) | null,
  "obligatoryDocuments": [string, ...] | null  (liste explicite des documents si mentionnée),
  "eligibleSectors": [string, ...] | null  (parmi: "musique","audiovisuel","spectacle-vivant","arts-plastiques","arts-numeriques","ecriture","patrimoine","pluridisciplinaire"),
  "geographicZone": [string, ...] | null  (ex: ["national"] ou ["Île-de-France"] ou ["Europe"] ou ["international"]),
  "grantType": [string, ...] | null  (parmi: "creation","diffusion","residence","production","ecriture","equipement","formation","mobilite","structuration","manifestation"),
  "amountMin": number | null  (montant minimum en euros, si mentionné),
  "amountMax": number | null  (montant maximum en euros, si mentionné),
  "amount": number | null  (montant fixe en euros, si mentionné),
  "contactEmail": string | null  (UNIQUEMENT si présent dans le texte),
  "contactPhone": string | null  (UNIQUEMENT si présent dans le texte)
}

CONSIGNES CRUCIALES :
- difficulty "facile" = dossier simple (formulaire court), "moyen" = pièces justificatives, "difficile" = dossier artistique + budget + suivi complexe.
- preparationAdvice : PAS de formule générique type "préparez bien votre dossier". Sois spécifique à cette aide (ex: "Joignez une maquette de 3 titres", "Démontrez l'ancrage régional par des lettres de partenaires").
- eligibleSectors : coche plusieurs si l'aide est pluri. Si vraiment générique culture → ["pluridisciplinaire"].
- geographicZone : national si État/agence nationale. Régional si nom de région. Europe si UE.
- Si le texte ne contient PAS de montant concret → amount/amountMin/amountMax = null.
- Si email/phone ne sont PAS littéralement dans le texte → null.`;

    const raw = await callDeepSeek(prompt);
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error(`JSON invalide: ${raw.substring(0, 150)}`);
      parsed = JSON.parse(m[0]);
    }

    const updates: Record<string, any> = {};
    const changes: string[] = [];

    // Difficulty
    if (!hasDifficulty) {
      const v = validDifficulty(parsed.applicationDifficulty);
      if (v) { updates.applicationDifficulty = v; changes.push("difficulty"); }
    }

    // Advice
    if (!hasAdvice) {
      const v = validString(parsed.preparationAdvice, 50, 1000);
      if (v) { updates.preparationAdvice = v; changes.push("advice"); }
    }

    // Requirements
    if (!hasRequirements) {
      const v = validString(parsed.requirements, 20, 1500);
      if (v) { updates.requirements = v; changes.push("requirements"); }
    }

    // Obligatory docs
    if (!hasDocs) {
      const v = validStringArray(parsed.obligatoryDocuments, 3, 15);
      if (v) { updates.obligatoryDocuments = v; changes.push("docs"); }
    }

    // Sectors
    if (!hasSectors) {
      const valid = ["musique","audiovisuel","spectacle-vivant","arts-plastiques","arts-numeriques","ecriture","patrimoine","pluridisciplinaire"];
      const raw = Array.isArray(parsed.eligibleSectors) ? parsed.eligibleSectors : [];
      const cleaned = raw.map((x: any) => (typeof x === "string" ? x.toLowerCase().trim() : "")).filter((x: string) => valid.includes(x));
      if (cleaned.length > 0) { updates.eligibleSectors = cleaned; changes.push("sectors"); }
    }

    // Zone
    if (!hasZone) {
      const v = validStringArray(parsed.geographicZone, 2, 5);
      if (v) { updates.geographicZone = v; changes.push("zone"); }
    }

    // Grant type
    if (!hasType) {
      const valid = ["creation","diffusion","residence","production","ecriture","equipement","formation","mobilite","structuration","manifestation"];
      const raw = Array.isArray(parsed.grantType) ? parsed.grantType : [];
      const cleaned = raw.map((x: any) => (typeof x === "string" ? x.toLowerCase().trim() : "")).filter((x: string) => valid.includes(x));
      if (cleaned.length > 0) { updates.grantType = cleaned; changes.push("type"); }
    }

    // Amount(s)
    if (!hasAmount) {
      const aMin = parseAmount(parsed.amountMin);
      const aMax = parseAmount(parsed.amountMax);
      const aFixed = parseAmount(parsed.amount);
      if (aMin) { updates.amountMin = aMin; }
      if (aMax) { updates.amountMax = aMax; }
      if (aFixed && !aMin && !aMax) { updates.amount = aFixed; }
      if (aMin || aMax || aFixed) changes.push("amount");
    }

    // Contact
    if (!hasContactEmail) {
      const v = validEmail(parsed.contactEmail);
      if (v) { updates.contactEmail = v; changes.push("email"); }
    }
    if (!hasContactPhone) {
      const v = typeof parsed.contactPhone === "string" ? parsed.contactPhone.trim() : null;
      if (v && /\d/.test(v) && v.length >= 10 && v.length <= 25) {
        updates.contactPhone = v;
        changes.push("phone");
      }
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(grants)
        .set({
          ...updates,
          enrichmentStatus: "completed",
          enrichmentDate: new Date(),
          enrichmentError: null,
          updatedAt: new Date(),
        })
        .where(eq(grants.id, grantId));
    } else {
      await db
        .update(grants)
        .set({
          enrichmentStatus: "completed",
          enrichmentDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(grants.id, grantId));
    }

    return { grantId, success: true, changes };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    await db
      .update(grants)
      .set({
        enrichmentStatus: "failed",
        enrichmentDate: new Date(),
        enrichmentError: message.substring(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(grants.id, grantId))
      .catch(() => {});
    return { grantId, success: false, changes: [], error: message };
  }
}
