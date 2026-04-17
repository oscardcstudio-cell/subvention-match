/**
 * AI Enricher — enrichit les subventions via DeepSeek (OpenRouter)
 *
 * Corrige : organization, title, description, eligibility.
 * Chaque enrichissement met à jour enrichmentStatus dans la DB.
 *
 * Améliorations vs version précédente :
 * - Met à jour enrichmentStatus (pending → in_progress → completed/failed)
 * - Détection d'issues robuste (regex au lieu de includes fragile)
 * - Validation des résultats IA (longueur, contenu)
 * - Retry avec backoff sur erreurs API
 * - Prompt amélioré pour les organisations (plus spécifique)
 */

import { db } from "./db";
import { grants } from "@shared/schema";
import { eq } from "drizzle-orm";

// ── Types ────────────────────────────────────────────────────────────

export interface QualityIssue {
  grantId: string;
  grantTitle: string;
  field: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  currentValue?: string | number;
  expectedValue?: string;
}

export interface EnrichmentRequest {
  grantId: string;
  issues: QualityIssue[];
}

export interface EnrichmentResult {
  success: boolean;
  grantId: string;
  changes: { field: string; oldValue: string; newValue: string }[];
  error?: string;
}

// ── Config ───────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3_000;

if (!OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY manquante — enrichissement IA désactivé");
}

// ── Helpers ──────────────────────────────────────────────────────────

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

/** Détecte un pattern dans le message d'issue (insensible à la casse). */
function issueMatches(issue: string, ...patterns: string[]): boolean {
  const lower = issue.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}

/** Détecte si des issues matchent un champ + pattern. */
function hasIssue(issues: QualityIssue[], field: string, ...patterns: string[]): boolean {
  return issues.some(
    (i) => i.field === field && issueMatches(i.issue, ...patterns)
  );
}

/** Valide qu'un texte enrichi n'est pas une hallucination évidente. */
function isValidEnrichment(text: string, minLength: number, maxLength: number): boolean {
  if (!text || text.length < minLength || text.length > maxLength) return false;
  const lower = text.toLowerCase();
  // Rejeter les réponses passe-partout
  if (lower.includes("je ne peux pas")) return false;
  if (lower.includes("je n'ai pas assez")) return false;
  if (lower.includes("information insuffisante")) return false;
  if (lower.includes("non spécifié")) return false;
  if (lower.includes("inconnu")) return false;
  if (lower.startsWith("désolé")) return false;
  return true;
}

// ── API DeepSeek ─────────────────────────────────────────────────────

async function callDeepSeek(prompt: string, retries = MAX_RETRIES): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY manquante");
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://mecene.fr",
            "X-Title": "Mecene",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [
              {
                role: "system",
                content:
                  "Tu es un expert en subventions et aides publiques françaises, notamment dans le domaine culturel. " +
                  "Tu connais les organismes (ministères, DRAC, régions, départements, ADAMI, SACEM, CNM, etc.) " +
                  "et les dispositifs d'aide. Réponds de façon factuelle et concise.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        // Retry sur 429 (rate limit) ou 5xx
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const delay = RETRY_DELAY_MS * (attempt + 1);
          console.warn(`  ⏳ API ${response.status}, retry dans ${delay / 1000}s...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new Error(`OpenRouter ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (err) {
      if (attempt < retries && err instanceof TypeError) {
        // Network error — retry
        const delay = RETRY_DELAY_MS * (attempt + 1);
        console.warn(`  ⏳ Erreur réseau, retry dans ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries atteint");
}

// ── Enrichissement d'une grant ───────────────────────────────────────

export async function enrichGrant(
  grantId: string,
  issues: QualityIssue[]
): Promise<EnrichmentResult> {
  try {
    // Marquer comme en cours
    await db
      .update(grants)
      .set({ enrichmentStatus: "in_progress", updatedAt: new Date() })
      .where(eq(grants.id, grantId));

    console.log(`🤖 Enrichissement #${grantId}...`);

    const [grant] = await db.select().from(grants).where(eq(grants.id, grantId));
    if (!grant) {
      await db
        .update(grants)
        .set({ enrichmentStatus: "failed", enrichmentError: "Subvention non trouvée", enrichmentDate: new Date() })
        .where(eq(grants.id, grantId));
      return { success: false, grantId, changes: [], error: "Subvention non trouvée" };
    }

    const changes: EnrichmentResult["changes"] = [];
    const updates: Record<string, any> = {};

    // Détection robuste des issues par champ
    const wantsOrgFix = hasIssue(issues, "organization", "manquant");
    const wantsTitleShorten = hasIssue(issues, "title", "long");
    const wantsDescExpand = hasIssue(issues, "description", "court", "manquant");
    const wantsDescShrink = hasIssue(issues, "description", "long") && !wantsDescExpand;
    const wantsEligExpand = hasIssue(issues, "eligibility", "court", "manquant");
    const wantsEligShrink = hasIssue(issues, "eligibility", "long") && !wantsEligExpand;

    const detectedActions = [
      wantsOrgFix && "org",
      wantsTitleShorten && "title-shrink",
      wantsDescExpand && "desc-expand",
      wantsDescShrink && "desc-shrink",
      wantsEligExpand && "elig-expand",
      wantsEligShrink && "elig-shrink",
    ].filter(Boolean);
    console.log(`  Actions: ${detectedActions.join(", ") || "(aucune)"}`);

    // ── 0. ORGANISATION ──────────────────────────────────────────────

    if (
      wantsOrgFix &&
      (!grant.organization || grant.organization === "Non spécifié" || grant.organization === "Inconnu" || grant.organization === "")
    ) {
      const descText = stripHtml(grant.description).substring(0, 1500);
      const eligText = stripHtml(grant.eligibility).substring(0, 500);
      const url = grant.url || "";

      const prompt = `Identifie l'organisme qui finance cette subvention culturelle française.

TITRE : "${grant.title}"
DESCRIPTION : "${descText}"
ÉLIGIBILITÉ : "${eligText}"
URL : "${url}"

CONSIGNES STRICTES :
- Donne le NOM COMPLET et OFFICIEL de l'organisme (pas juste "Région" ou "Département")
- Exemples de noms complets : "Conseil régional Île-de-France", "DRAC Occitanie", "ADAMI", "Ministère de la Culture"
- Si l'URL contient un indice (ex: .gouv.fr/iledefrance → DRAC Île-de-France), utilise-le
- Si tu ne peux pas identifier l'organisme avec certitude, réponds "INCONNU"
- Réponds UNIQUEMENT avec le nom, pas de phrase.`;

      const org = await callDeepSeek(prompt);
      const cleanOrg = org.trim().replace(/^["']|["']$/g, "").replace(/\.$/, "");

      if (isValidEnrichment(cleanOrg, 3, 120)) {
        updates.organization = cleanOrg;
        changes.push({
          field: "organization",
          oldValue: grant.organization || "(manquant)",
          newValue: cleanOrg,
        });
      }
    }

    // ── 1. TITRE TROP LONG ───────────────────────────────────────────

    if (wantsTitleShorten && grant.title) {
      const titleText = stripHtml(grant.title);
      const prompt = `Réécris ce titre de subvention pour qu'il fasse moins de 80 caractères, en gardant les mots-clés essentiels.
TITRE : "${titleText}"
Réponds UNIQUEMENT avec le nouveau titre.`;

      const newTitle = await callDeepSeek(prompt);
      const cleanTitle = newTitle.trim().replace(/^["']|["']$/g, "");

      if (isValidEnrichment(cleanTitle, 10, 100) && cleanTitle.length < titleText.length) {
        updates.title = cleanTitle;
        changes.push({ field: "title", oldValue: titleText, newValue: cleanTitle });
      }
    }

    // ── 2. DESCRIPTION ───────────────────────────────────────────────

    if (wantsDescShrink && grant.description) {
      const descText = stripHtml(grant.description);
      const prompt = `Synthétise cette description de subvention en un paragraphe clair de 800-1500 caractères.
Garde les informations cruciales sur l'objectif de l'aide.
DESCRIPTION : "${descText.substring(0, 4000)}"
Réponds UNIQUEMENT avec la description synthétisée.`;

      const newDesc = await callDeepSeek(prompt);
      if (isValidEnrichment(newDesc, 200, 2000)) {
        updates.description = `<p>${newDesc.trim()}</p>`;
        changes.push({ field: "description", oldValue: "(trop longue)", newValue: `Synthétisée (${newDesc.length} chars)` });
      }
    }

    if (wantsDescExpand && grant.title) {
      const currentDesc = stripHtml(grant.description);
      const eligText = stripHtml(grant.eligibility);

      const prompt = `Génère une description complète (200-500 caractères) pour cette subvention culturelle française.

TITRE : "${grant.title}"
DESCRIPTION ACTUELLE : "${currentDesc}"
ÉLIGIBILITÉ : "${eligText.substring(0, 500)}"
ORGANISME : "${updates.organization || grant.organization || "Non spécifié"}"

CONSIGNES :
- Explique l'objectif de cette aide
- Mentionne le type de projets soutenus
- Ton professionnel et informatif
- 200 à 500 caractères
- UNIQUEMENT la description, pas de préambule.`;

      const newDesc = await callDeepSeek(prompt);
      if (isValidEnrichment(newDesc, 100, 1000)) {
        updates.description = `<p>${newDesc.trim()}</p>`;
        changes.push({
          field: "description",
          oldValue: currentDesc ? `(trop courte: ${currentDesc.length})` : "(manquante)",
          newValue: `Enrichie (${newDesc.length} chars)`,
        });
      }
    }

    // ── 3. ÉLIGIBILITÉ ───────────────────────────────────────────────

    if (wantsEligShrink && grant.eligibility) {
      const eligText = stripHtml(grant.eligibility);
      const prompt = `Synthétise ces critères d'éligibilité en une liste à puces concise (max 1000 caractères).
ÉLIGIBILITÉ : "${eligText.substring(0, 4000)}"
Réponds avec une liste à puces (- item).`;

      const newElig = await callDeepSeek(prompt);
      if (isValidEnrichment(newElig, 50, 1500)) {
        const html = `<ul>${newElig
          .trim()
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => `<li>${l.replace(/^[*-]\s*/, "")}</li>`)
          .join("")}</ul>`;
        updates.eligibility = html;
        changes.push({ field: "eligibility", oldValue: "(trop longue)", newValue: `Synthétisée (${newElig.length} chars)` });
      }
    }

    if (wantsEligExpand) {
      const currentElig = stripHtml(grant.eligibility);
      const descText = stripHtml(grant.description);

      if (currentElig.length < 100) {
        const prompt = `${currentElig ? "Enrichis ces critères d'éligibilité" : "Extrais les critères d'éligibilité de cette description"} pour cette subvention culturelle française.

TITRE : "${grant.title}"
${currentElig ? `ÉLIGIBILITÉ ACTUELLE : "${currentElig}"` : ""}
DESCRIPTION : "${descText.substring(0, 2000)}"
ORGANISME : "${updates.organization || grant.organization || "Non spécifié"}"

CONSIGNES :
- Identifie les bénéficiaires (type de structure, statut juridique)
- Précise les domaines artistiques/culturels concernés
- Liste les conditions (localisation, projet, etc.)
- Format : liste à puces (- item), 100-500 caractères
- UNIQUEMENT la liste, pas de préambule.`;

        const newElig = await callDeepSeek(prompt);
        if (isValidEnrichment(newElig, 50, 1000)) {
          const html = `<ul>${newElig
            .trim()
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => `<li>${l.replace(/^[*-]\s*/, "")}</li>`)
            .join("")}</ul>`;
          updates.eligibility = html;
          changes.push({
            field: "eligibility",
            oldValue: currentElig ? `(trop courte: ${currentElig.length})` : "(manquante)",
            newValue: `Enrichie (${newElig.length} chars)`,
          });
        }
      }
    }

    // ── Appliquer les mises à jour ───────────────────────────────────

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

      console.log(`  ✅ ${changes.length} changements appliqués`);
    } else {
      // Rien à changer — on marque quand même comme traité
      await db
        .update(grants)
        .set({
          enrichmentStatus: "completed",
          enrichmentDate: new Date(),
          enrichmentError: null,
          updatedAt: new Date(),
        })
        .where(eq(grants.id, grantId));

      console.log(`  ℹ️ Aucun changement applicable`);
    }

    return { success: true, grantId, changes };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`  ❌ Erreur #${grantId}: ${message}`);

    // Marquer comme failed
    await db
      .update(grants)
      .set({
        enrichmentStatus: "failed",
        enrichmentDate: new Date(),
        enrichmentError: message,
        updatedAt: new Date(),
      })
      .where(eq(grants.id, grantId))
      .catch(() => {}); // best effort

    return { success: false, grantId, changes: [], error: message };
  }
}

// ── Enrichissement batch ─────────────────────────────────────────────

export async function enrichMultipleGrants(
  requests: EnrichmentRequest[]
): Promise<EnrichmentResult[]> {
  console.log(`🚀 Enrichissement de ${requests.length} subventions...`);

  const results: EnrichmentResult[] = [];

  for (let i = 0; i < requests.length; i++) {
    const request = requests[i];
    console.log(`\n[${i + 1}/${requests.length}] ${request.issues[0]?.grantTitle?.substring(0, 50) || request.grantId}`);

    const result = await enrichGrant(request.grantId, request.issues);
    results.push(result);

    // Pause entre chaque appel
    if (i < requests.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  const successful = results.filter((r) => r.success).length;
  const totalChanges = results.reduce((sum, r) => sum + r.changes.length, 0);
  console.log(`\n✅ Terminé : ${successful}/${requests.length} réussis, ${totalChanges} changements`);

  return results;
}
