/**
 * Valide qu'une URL externe est sûre à mettre dans un <a href>.
 *
 * Bloque les schémas dangereux (javascript:, data:, vbscript:) qui peuvent
 * exécuter du code si on clique. Les URLs viennent de scrapers / APIs tierces
 * (ADAMI, CNM, Aides Territoires, etc.) — on ne contrôle pas leur contenu.
 *
 * Retourne l'URL normalisée si http(s), `undefined` sinon. Côté consumer:
 * on peut désactiver le bouton ou cacher le lien si le retour est undefined.
 */
export function safeExternalUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  // Parse permissif puis check explicite du protocole.
  let parsed: URL;
  try {
    parsed = new URL(url, window.location.origin);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return undefined;
  }
  return parsed.href;
}
