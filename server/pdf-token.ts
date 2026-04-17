import crypto from "node:crypto";

/**
 * Tokens signés HMAC pour les liens de téléchargement PDF.
 *
 * Objectif: quand l'admin copie-colle un lien de PDF (ex: dans Slack ou
 * un mail), on veut que ce lien expire rapidement et ne révèle PAS le
 * sessionId brut. Ça limite l'impact d'une fuite de lien.
 *
 * Le secret est dérivé de ADMIN_TOKEN (via HMAC avec un label dédié) pour
 * éviter une variable d'environnement supplémentaire. Dérivation != réutilisation
 * directe, les clés ne se croisent pas.
 */

const SECRET: Buffer | null = process.env.ADMIN_TOKEN
  ? crypto
      .createHmac("sha256", process.env.ADMIN_TOKEN)
      .update("pdf-token-v1")
      .digest()
  : null;

const DEFAULT_TTL_SECONDS = 15 * 60; // 15 minutes

/**
 * Crée un token signé pour accéder à un PDF.
 * Format: `<sessionId>.<expUnixSeconds>.<signatureBase64url>`
 * Retourne `null` si ADMIN_TOKEN n'est pas configuré (aucun token admin possible).
 */
export function createPdfToken(
  sessionId: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
): string | null {
  if (!SECRET) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${sessionId}.${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

/**
 * Vérifie un token et retourne le `sessionId` s'il est valide, `null` sinon.
 * Échoue si: format invalide, expiré, ou signature invalide.
 * Utilise `timingSafeEqual` pour éviter les attaques par timing.
 */
export function verifyPdfToken(token: string): { sessionId: string } | null {
  if (!SECRET) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [sessionId, expStr, sig] = parts;

  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return null;

  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(`${sessionId}.${exp}`)
    .digest("base64url");

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return null;
  try {
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { sessionId };
}
