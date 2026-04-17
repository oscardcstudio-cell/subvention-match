/**
 * Quality gate pour les subventions.
 *
 * Avant qu'une grant n'arrive dans les résultats utilisateur, on vérifie qu'elle
 * a un minimum d'infos exploitables. Une grant qui ne passe pas le gate est :
 *   - soit éjectée (champs critiques manquants : title, organization)
 *   - soit candidate à l'enrichissement IA à la volée si score < 80
 *
 * Le score est sur 100 :
 *   - title + organization : +20 (sinon éjection immédiate)
 *   - description ≥ 200 chars : +20
 *   - eligibility ≥ 100 chars : +20
 *   - amount renseigné (any of amount/min/max) : +15
 *   - deadline OU frequency : +15
 *   - URL avec scoreUrl() ≥ 60 : +10
 *
 * Seuil de passage : 60. Au-dessous, la grant est filtrée AVANT le matching IA
 * (pas la peine de demander à DeepSeek de matcher une fiche cassée).
 */

import type { Grant } from "../shared/schema";
import type { GrantResult } from "../shared/schema";
import { scoreUrl } from "./url-validator";

// Seuil abaissé à 35 pour la beta — beaucoup de grants ont des descriptions
// courtes ou absentes. L'enrichissement IA à la volée comble les lacunes.
// À remonter à 60 une fois la base enrichie.
export const QUALITY_GATE_THRESHOLD = 35;
export const ENRICHMENT_THRESHOLD = 80; // En dessous, on tente d'enrichir à la volée

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

export interface QualityBreakdown {
  score: number;
  hasTitle: boolean;
  hasOrganization: boolean;
  hasDescription: boolean;
  hasEligibility: boolean;
  hasAmount: boolean;
  hasDeadlineOrFrequency: boolean;
  hasGoodUrl: boolean;
  missing: string[];
}

/**
 * Calcule un score de qualité 0-100 pour une grant.
 * Accepte aussi bien Grant (DB) que GrantResult (formaté).
 */
export function calculateQualityScore(grant: Grant | GrantResult): QualityBreakdown {
  const missing: string[] = [];
  let score = 0;

  // Title + organization : critères ÉLIMINATOIRES
  const title = (grant.title || "").trim();
  const organization = (grant.organization || "").trim();
  const hasTitle = title.length >= 5;
  const hasOrganization =
    organization.length >= 3 &&
    organization.toLowerCase() !== "inconnu" &&
    organization.toLowerCase() !== "non spécifié";

  if (hasTitle && hasOrganization) {
    score += 20;
  }
  if (!hasTitle) missing.push("titre");
  if (!hasOrganization) missing.push("organisme");

  // Description
  const descText = stripHtml(grant.description);
  const hasDescription =
    descText.length >= 200 && !descText.toLowerCase().includes("non spécifié");
  if (hasDescription) score += 20;
  else missing.push("description");

  // Eligibility
  const eligText = stripHtml(grant.eligibility);
  const hasEligibility =
    eligText.length >= 100 && !eligText.toLowerCase().includes("non spécifié");
  if (hasEligibility) score += 20;
  else missing.push("éligibilité");

  // Amount — accepte amount/min/max, ou une mention dans le texte
  // (Grant a des numbers, GrantResult a un string `amount` formaté)
  const grantAny = grant as any;
  const hasNumericAmount =
    !!grantAny.amount || !!grantAny.amountMin || !!grantAny.amountMax;
  // Pour GrantResult, amount est un string déjà formaté ("5000€" ou "Variable selon projet")
  const hasStringAmount =
    typeof grantAny.amount === "string" &&
    grantAny.amount.length > 0 &&
    !grantAny.amount.toLowerCase().includes("non spécifié");
  const hasAmount = hasNumericAmount || hasStringAmount;
  if (hasAmount) score += 15;
  else missing.push("montant");

  // Deadline ou frequency (l'un ou l'autre suffit)
  const hasDeadlineOrFrequency = !!(
    (grant.deadline && grant.deadline.trim() !== "") ||
    (grant.frequency && grant.frequency.trim() !== "")
  );
  if (hasDeadlineOrFrequency) score += 15;
  else missing.push("deadline/fréquence");

  // URL : doit exister ET scorer ≥ 60 (page spécifique, pas homepage)
  const grantUrl = grant.improvedUrl || grant.url || "";
  const hasGoodUrl = !!grantUrl && scoreUrl(grantUrl) >= 60;
  if (hasGoodUrl) score += 10;
  else if (grantUrl) missing.push("url spécifique (homepage générique)");
  else missing.push("url");

  return {
    score,
    hasTitle,
    hasOrganization,
    hasDescription,
    hasEligibility,
    hasAmount,
    hasDeadlineOrFrequency,
    hasGoodUrl,
    missing,
  };
}

/**
 * Une grant passe le gate si elle a title+organization (critères éliminatoires)
 * ET un score >= QUALITY_GATE_THRESHOLD.
 *
 * En d'autres termes : on garantit que toute grant proposée à l'utilisateur a
 * au minimum un titre, un organisme, et 40 points sur les 80 restants — soit
 * au moins 2-3 des champs (description, eligibility, amount, deadline, url).
 */
export function passesQualityGate(grant: Grant | GrantResult): boolean {
  const breakdown = calculateQualityScore(grant);
  // Critères ÉLIMINATOIRES
  if (!breakdown.hasTitle || !breakdown.hasOrganization) return false;
  return breakdown.score >= QUALITY_GATE_THRESHOLD;
}

/**
 * Indique si une grant pourrait bénéficier d'un enrichissement IA à la volée.
 * Utilisé après le matching, sur le top 5-10 uniquement.
 */
export function needsEnrichment(grant: Grant | GrantResult): boolean {
  const breakdown = calculateQualityScore(grant);
  return breakdown.score < ENRICHMENT_THRESHOLD;
}

/**
 * Filtre un tableau de grants en gardant uniquement celles qui passent le gate.
 * Logue un résumé pour debug.
 */
export function filterByQualityGate<T extends Grant | GrantResult>(
  grants: T[]
): { passed: T[]; rejected: T[]; rejectionReasons: Map<string, string[]> } {
  const passed: T[] = [];
  const rejected: T[] = [];
  const rejectionReasons = new Map<string, string[]>();

  for (const grant of grants) {
    const breakdown = calculateQualityScore(grant);
    if (
      breakdown.hasTitle &&
      breakdown.hasOrganization &&
      breakdown.score >= QUALITY_GATE_THRESHOLD
    ) {
      passed.push(grant);
    } else {
      rejected.push(grant);
      rejectionReasons.set(grant.id, breakdown.missing);
    }
  }

  console.log(
    `🚦 Quality gate : ${passed.length}/${grants.length} grants passent le seuil ${QUALITY_GATE_THRESHOLD}/100`
  );
  if (rejected.length > 0) {
    // Top 3 raisons de rejet pour repérer les patterns
    const reasonCounts = new Map<string, number>();
    rejectionReasons.forEach((reasons) => {
      reasons.forEach((r) => reasonCounts.set(r, (reasonCounts.get(r) || 0) + 1));
    });
    const topReasons = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason, count]) => `${reason} (${count})`)
      .join(", ");
    console.log(`   ↳ Top raisons de rejet : ${topReasons}`);
  }

  return { passed, rejected, rejectionReasons };
}
