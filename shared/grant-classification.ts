import type { Grant } from "./schema";

/**
 * Classification heuristique "aide européenne" vs "aide française".
 *
 * Ancienne version (à bannir): `organization.includes("Commission Européenne")`.
 *   Problèmes:
 *     - Faux positif possible : "Antenne française de la Commission Européenne"
 *     - Faux négatif sur variantes : "Commission Europeenne" (sans accent),
 *       "Programme LEADER (Union européenne)", "FEADER", "Creative Europe", etc.
 *
 * Stratégie actuelle:
 *   1) Si `geographicZone` contient un marqueur EU/FR, on l'utilise (source
 *      structurée). Rarement renseigné dans la base actuelle, donc fallback.
 *   2) Sinon, match sur patterns regex couvrant les organismes EU connus
 *      dans les données réelles, en tolérant variantes d'accent/casse.
 *
 * Limite assumée: les heuristiques sur `organization` ne sont jamais parfaites.
 * TODO: migration du schéma pour ajouter un `fundingSource` enum (FR/EU/MIXED)
 * renseigné à l'import → supprime toute heuristique.
 */

const EU_ORG_PATTERNS: readonly RegExp[] = [
  /\bcommission\s+europ[eé]enne\b/i,
  /\bunion\s+europ[eé]enne\b/i,
  /\bprogramme\s+leader\b/i,
  /\bfeader\b/i,
  /\bcreative\s+europe\b/i,
  /\beurope\s+cr[eé]ative\b/i,
  /\brelais\s+culture\s+europe\b/i,
  // Acronyme du programme EU LEADER (toujours en majuscules dans les données),
  // pour attraper "Programme européen LEADER", "GAL ... LEADER 2023-2027", etc.
  // Sans /i: évite de matcher des noms d'entreprise avec "leader" minuscule.
  /\bLEADER\b/,
];

export function isEuropeanGrant(
  grant: Pick<Grant, "organization" | "geographicZone">,
): boolean {
  // 1) Zone géographique structurée — source de vérité quand renseignée.
  const zones = grant.geographicZone ?? [];
  if (zones.length > 0) {
    const normalized = zones.map((z) => z.toLowerCase());
    if (
      normalized.some(
        (z) => z === "europe" || z === "ue" || z === "union européenne",
      )
    ) {
      return true;
    }
    if (normalized.some((z) => z.startsWith("france") || z === "national")) {
      return false;
    }
  }

  // 2) Fallback: patterns sur le nom d'organisation.
  const org = grant.organization ?? "";
  return EU_ORG_PATTERNS.some((re) => re.test(org));
}
