import posthog from "posthog-js";

// --- PostHog (analytics produit + funnels) ---
// PostHog = analytics open-source avec funnels, session replays, feature flags.
// Free tier : 1M events/mois — largement suffisant pour une beta.
//
// Setup : crée un projet sur https://eu.posthog.com (instance EU pour RGPD),
// copie la clé API, et ajoute dans Railway :
//   VITE_POSTHOG_KEY=phc_xxx
//   VITE_POSTHOG_HOST=https://eu.i.posthog.com  (ou us si tu préfères)

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://eu.i.posthog.com";

const CONSENT_KEY = "sm_cookie_consent"; // "accepted" | "refused" | absent

let initialized = false;

/** Vérifie si l'utilisateur a donné son consentement cookies */
export function hasAnalyticsConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === "accepted"; } catch { return false; }
}

/** Enregistre le choix de l'utilisateur */
export function setAnalyticsConsent(accepted: boolean) {
  try { localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "refused"); } catch { /* noop */ }
  if (accepted) initAnalytics();
}

/** Retourne true si le choix a déjà été fait (accepté OU refusé) */
export function hasConsentBeenDecided(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) !== null; } catch { return true; }
}

/** Initialise PostHog — ne fait rien si pas de consentement ou pas de clé */
export function initAnalytics() {
  if (initialized || !POSTHOG_KEY || !hasAnalyticsConsent()) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
    autocapture: false,
  });
  initialized = true;
}

/** Initialise Sentry côté client — ne fait rien si pas de consentement */
export function initSentryIfConsented() {
  if (!hasAnalyticsConsent() || !import.meta.env.VITE_SENTRY_DSN) return;
  import("@sentry/react").then((Sentry) => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.2,
    });
  });
}

// --- Events du funnel principal ---
// Chaque event correspond à une étape que tu pourras visualiser dans
// PostHog > Funnels : form_started → form_submitted → results_viewed →
// checkout_started → payment_completed → email_delivered

export function trackFormStarted() {
  posthog.capture("form_started");
}

export function trackFormSubmitted(data: { artisticDomain?: string; region?: string }) {
  posthog.capture("form_submitted", data);
}

export function trackResultsViewed(data: { matchCount: number; sessionId: string }) {
  posthog.capture("results_viewed", data);
}

export function trackCheckoutStarted(data: { sessionId: string }) {
  posthog.capture("checkout_started", data);
}

export function trackPaymentCompleted(data: { sessionId: string }) {
  posthog.capture("payment_completed", data);
}

export function trackPdfDownloaded(data: { sessionId: string }) {
  posthog.capture("pdf_downloaded", data);
}

// --- Events secondaires (feedback qualité matches) ---
export function trackMatchFeedback(data: {
  grantId: string;
  sessionId: string;
  rating: "relevant" | "not_relevant";
}) {
  posthog.capture("match_feedback", data);
}
