/**
 * Cascade de résolution d'URL pour qu'un utilisateur ait TOUJOURS un chemin
 * d'action, même quand les données sont incomplètes.
 *
 * Ordre de priorité :
 *   1. improvedUrl si présent ET scoreUrl >= 60 ET URL vivante (HEAD 2xx/3xx)
 *   2. url si présent ET scoreUrl >= 40 ET URL vivante
 *   3. mailto contactEmail avec subject pré-rempli
 *   4. Recherche Google "site:domaine_organisme '[titre]'" (dernier recours)
 *
 * Le résultat indique le `kind` pour que le PDF puisse adapter le wording :
 *   - "direct"  : on envoie sur la page de candidature officielle
 *   - "homepage": on a une URL mais elle n'est pas optimale (page générique)
 *   - "mailto"  : on encourage le contact direct par email
 *   - "search"  : on propose une recherche Google (dernier recours)
 *   - "none"    : aucune option, l'utilisateur devra chercher seul
 */

import type { Grant } from "../shared/schema";
import { scoreUrl, isUrlAlive, extractDomain } from "./url-validator";

export type ApplicationUrlKind = "direct" | "homepage" | "mailto" | "search" | "none";

export interface ApplicationUrl {
  kind: ApplicationUrlKind;
  href: string;
  label: string; // Texte du bouton ("Candidater", "Contacter par email", etc.)
  hint?: string; // Petit texte explicatif sous le bouton ("Lien officiel", "Aucune page directe trouvée")
}

const MAILTO_SUBJECT_PREFIX = "Demande d'informations";

/**
 * Construit un mailto pré-rempli pour contacter l'organisme à propos d'une aide.
 */
function buildMailto(email: string, grantTitle: string, organization: string): string {
  const subject = `${MAILTO_SUBJECT_PREFIX} — ${grantTitle}`;
  const body = [
    `Bonjour,`,
    ``,
    `Je vous contacte au sujet de l'aide intitulée "${grantTitle}" proposée par ${organization}.`,
    ``,
    `Pourriez-vous me transmettre :`,
    `- Les modalités de candidature actuelles`,
    `- La date limite de dépôt du prochain dossier`,
    `- Les pièces à fournir`,
    ``,
    `Je vous remercie par avance.`,
    ``,
    `Cordialement,`,
  ].join("\n");

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body
  )}`;
}

/**
 * Construit une recherche Google "site:domaine '[titre]'" comme dernier recours.
 */
function buildGoogleSearch(grantTitle: string, organization: string, knownUrl?: string | null): string {
  let domain: string | null = null;
  if (knownUrl) {
    domain = extractDomain(knownUrl);
  }

  // Si on a un domaine, on restreint la recherche
  const query = domain
    ? `site:${domain} "${grantTitle}"`
    : `"${grantTitle}" ${organization} candidature`;

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Résout la meilleure URL d'application possible pour une grant donnée.
 *
 * NB : appelle isUrlAlive() (HTTP HEAD avec 5s timeout). À utiliser en parallèle
 * via Promise.all pour ne pas bloquer la génération du PDF (5 grants × 500ms
 * sequential = 2.5s ; en parallèle = ~500ms).
 */
export async function resolveApplicationUrl(grant: Grant): Promise<ApplicationUrl> {
  const grantTitle = grant.title || "cette aide";
  const organization = grant.organization || "l'organisme";

  // 1. Tester improvedUrl si présent et bien scoré
  if (grant.improvedUrl && scoreUrl(grant.improvedUrl) >= 60) {
    const alive = await isUrlAlive(grant.improvedUrl);
    if (alive) {
      return {
        kind: "direct",
        href: grant.improvedUrl,
        label: "Candidater maintenant",
        hint: "Page officielle de candidature",
      };
    }
  }

  // 2. Tester url si présent et au moins moyennement scoré
  if (grant.url) {
    const score = scoreUrl(grant.url);
    if (score >= 40) {
      const alive = await isUrlAlive(grant.url);
      if (alive) {
        return {
          kind: score >= 60 ? "direct" : "homepage",
          href: grant.url,
          label: score >= 60 ? "Candidater maintenant" : "Voir sur le site officiel",
          hint:
            score >= 60
              ? "Page officielle de candidature"
              : "Page générale — chercher la rubrique dédiée à cette aide",
        };
      }
    }
  }

  // 3. Mailto si on a un contact email
  if (grant.contactEmail && grant.contactEmail.includes("@")) {
    return {
      kind: "mailto",
      href: buildMailto(grant.contactEmail, grantTitle, organization),
      label: "Contacter l'organisme",
      hint: `Aucune page de candidature directe trouvée — email pré-rempli vers ${grant.contactEmail}`,
    };
  }

  // 4. Recherche Google avec le domaine si on en a un
  // (On exploite l'URL même cassée pour récupérer le domaine de l'organisme)
  const fallbackUrl = grant.improvedUrl || grant.url;
  if (fallbackUrl || organization !== "l'organisme") {
    return {
      kind: "search",
      href: buildGoogleSearch(grantTitle, organization, fallbackUrl),
      label: "Rechercher cette aide",
      hint: "Aucun lien direct disponible — recherche Google pré-remplie",
    };
  }

  // 5. Aucune option
  return {
    kind: "none",
    href: "#",
    label: "Information à compléter",
    hint: "Contact non disponible — nous essayons de retrouver les coordonnées",
  };
}

/**
 * Résout les URLs d'application pour plusieurs grants en parallèle.
 * Renvoie une Map grantId → ApplicationUrl.
 */
export async function resolveApplicationUrls(
  grants: Grant[]
): Promise<Map<string, ApplicationUrl>> {
  const results = await Promise.all(
    grants.map(async (grant) => ({
      id: grant.id,
      resolved: await resolveApplicationUrl(grant),
    }))
  );

  const map = new Map<string, ApplicationUrl>();
  for (const { id, resolved } of results) {
    map.set(id, resolved);
  }

  // Log résumé des kinds pour visibilité
  const kindCounts = new Map<ApplicationUrlKind, number>();
  results.forEach(({ resolved }) => {
    kindCounts.set(resolved.kind, (kindCounts.get(resolved.kind) || 0) + 1);
  });
  const summary = Array.from(kindCounts.entries())
    .map(([kind, count]) => `${kind}=${count}`)
    .join(" ");
  console.log(`🔗 URL fallback résolu pour ${grants.length} grants : ${summary}`);

  return map;
}
