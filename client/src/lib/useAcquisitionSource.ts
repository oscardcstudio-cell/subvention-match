// Capture la source d'acquisition à l'arrivée et la mémorise pour la session.
// Lit ?source= ou ?utm_source= depuis l'URL au mount, puis persiste dans
// sessionStorage pour que la valeur soit dispo au moment de la soumission
// même si l'utilisateur navigue entre pages.

const STORAGE_KEY = "acquisition_source";

export function captureAcquisitionSource(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("source") ?? params.get("utm_source");
  if (fromUrl) {
    sessionStorage.setItem(STORAGE_KEY, fromUrl);
    return fromUrl;
  }
  return sessionStorage.getItem(STORAGE_KEY);
}

export function getAcquisitionSource(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}
