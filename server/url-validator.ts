/**
 * Validation et amélioration des URLs de candidature
 */

// URLs génériques à éviter (homepages)
const GENERIC_URL_PATTERNS = [
  /^https?:\/\/[^\/]+\/?$/,  // Juste le domaine sans path
  /\/accueil\/?$/i,
  /\/home\/?$/i,
  /\/index\.(html|php)\/?$/i,
];

// Mots-clés positifs indiquant une page de candidature spécifique
const GOOD_URL_KEYWORDS = [
  'candidat',
  'demande',
  'dossier',
  'formulaire',
  'aides',
  'subvention',
  'appel',
  'projet',
  'demarches-simplifiees',
  'commencer',
];

// Mots-clés négatifs indiquant une page générique
const BAD_URL_KEYWORDS = [
  'contact',
  'mentions-legales',
  'cgu',
  'a-propos',
];

/**
 * Score une URL pour déterminer sa qualité (0-100)
 */
export function scoreUrl(url: string): number {
  if (!url || url.trim() === '') return 0;
  
  let score = 50; // Score de base
  
  const urlLower = url.toLowerCase();
  
  // Pénalité pour URLs génériques
  for (const pattern of GENERIC_URL_PATTERNS) {
    if (pattern.test(url)) {
      score -= 40;
      break;
    }
  }
  
  // Bonus pour mots-clés positifs
  for (const keyword of GOOD_URL_KEYWORDS) {
    if (urlLower.includes(keyword)) {
      score += 10;
    }
  }
  
  // Pénalité pour mots-clés négatifs  
  for (const keyword of BAD_URL_KEYWORDS) {
    if (urlLower.includes(keyword)) {
      score -= 15;
    }
  }
  
  // Bonus pour URLs avec path spécifique (pas juste le domaine)
  const pathDepth = url.split('/').length - 3; // Enlever https://, domaine
  if (pathDepth > 0) {
    score += Math.min(pathDepth * 5, 20);
  }
  
  // Bonus pour demarches-simplifiees.fr (plateforme officielle)
  if (urlLower.includes('demarches-simplifiees.fr/commencer')) {
    score += 30;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Sélectionne la meilleure URL parmi plusieurs options
 */
export function selectBestUrl(...urls: (string | null | undefined)[]): string | null {
  const validUrls = urls.filter((url): url is string => !!url && url.trim() !== '');
  
  if (validUrls.length === 0) return null;
  if (validUrls.length === 1) return validUrls[0];
  
  // Scorer toutes les URLs
  const scoredUrls = validUrls.map(url => ({
    url,
    score: scoreUrl(url),
  }));
  
  // Trier par score décroissant
  scoredUrls.sort((a, b) => b.score - a.score);
  
  // Log pour debug
  console.log('🔗 Sélection de la meilleure URL:');
  scoredUrls.forEach(({ url, score }) => {
    console.log(`   ${score}/100: ${url.substring(0, 80)}...`);
  });
  
  return scoredUrls[0].url;
}

/**
 * Valide qu'une URL n'est pas morte (test HTTP HEAD)
 */
export async function isUrlAlive(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    return response.ok || response.status === 405; // 405 = méthode non autorisée mais page existe
  } catch (error) {
    return false;
  }
}

/**
 * Extrait le domaine d'une URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}
