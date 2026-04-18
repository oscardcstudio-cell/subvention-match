import type { Page, BrowserContext } from "@playwright/test";

/**
 * Dismiss the cookie banner before the app mounts so it doesn't intercept
 * clicks at the bottom-right (feedback button, etc.).
 */
export async function dismissCookieBanner(context: BrowserContext) {
  await context.addInitScript(() => {
    try {
      localStorage.setItem("sm_cookie_consent", "refused");
    } catch {}
  });
}

/**
 * Mock all /api/* routes with deterministic fixtures for E2E tests.
 * Attach this once at the start of every test that needs API data.
 */
export async function installApiMocks(page: Page) {
  // Also dismiss the cookie banner via page-level init (covers single-page tests)
  await page.addInitScript(() => {
    try {
      localStorage.setItem("sm_cookie_consent", "refused");
    } catch {}
  });
  // Grants stats (used by homepage + form)
  await page.route("**/api/grants/stats", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        total: 473,
        frenchGrants: 473,
        euGrants: 0,
        withDeadline: 241,
        withUrl: 420,
      }),
    })
  );

  // Form submit
  await page.route("**/api/submit-form", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ sessionId: "e2e-session-abc123", ok: true }),
    })
  );

  // Results
  await page.route("**/api/results**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: MOCK_GRANTS,
        isPaid: true,
        submission: {
          projectDescription: "Compagnie de théâtre contemporain à Lyon.",
          status: ["compagnie"],
          artisticDomain: ["spectacle-vivant", "audiovisuel"],
          projectType: ["creation", "production"],
          region: "Auvergne-Rhône-Alpes",
          isInternational: "tournee",
        },
      }),
    })
  );

  // Waitlist
  await page.route("**/api/waitlist", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  );

  // Feedback
  await page.route("**/api/beta-feedback", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  );
  await page.route("**/api/match-feedback", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    })
  );

  // PDF — return a minimal PDF stub for both /api/pdf/:sessionId and legacy /api/pdf?sessionId=
  await page.route("**/api/pdf/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: Buffer.from("%PDF-1.4\n%%EOF"),
    })
  );
  await page.route("**/api/example-pdf**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: Buffer.from("%PDF-1.4\n%%EOF"),
    })
  );

  // API status, data quality, etc. (best-effort)
  await page.route("**/api/api-status**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ status: "ok" }) })
  );

  // Payment intent (checkout)
  await page.route("**/api/create-payment-intent", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ clientSecret: "pi_test_secret_xxx" }),
    })
  );
}

export const MOCK_GRANTS = [
  {
    id: "grant-1",
    title: "ADSV — Aides aux équipes indépendantes",
    organization: "Ministère de la Culture",
    amount: "Variable selon projet",
    deadline: "Permanente",
    isRecurring: true,
    region: "National",
    description: "Le dispositif ADSV constitue le socle de la politique du ministère de la Culture.",
    eligibility: "Artistes, collectifs, compagnies ou ensembles professionnels en danse, musique, théâtre, cirque.",
    obligatoryDocuments: [
      "Présentation du projet artistique",
      "Budget prévisionnel",
      "Calendrier de diffusion",
      "Partenariats avec lieux de spectacle",
    ],
    url: "https://www.culture.gouv.fr/fr/catalogue-des-demarches-et-subventions/subvention/aides-aux-equipes-independantes-aides-deconcentrees-au-spectacle-vivant-adsv",
    applicationUrl: "https://www.culture.gouv.fr/adsv",
    contactEmail: "adsv@culture.gouv.fr",
    applicationDifficulty: "Modérée",
    matchScore: 92,
    matchReason:
      "Votre projet pluridisciplinaire (théâtre + vidéo + musique) correspond parfaitement aux critères ADSV. Budget 45 k€ cohérent avec la distribution moyenne 2021.",
  },
  {
    id: "grant-2",
    title: "DRAC ARA — Aide à la création",
    organization: "DRAC Auvergne-Rhône-Alpes",
    amount: "15 000 € – 60 000 €",
    deadline: "23 juin 2026",
    region: "Auvergne-Rhône-Alpes",
    description: "Soutient les projets de création dans la région Auvergne-Rhône-Alpes.",
    eligibility: "Structures basées en Auvergne-Rhône-Alpes.",
    url: "https://www.culture.gouv.fr/regions/drac-auvergne-rhone-alpes/aides-et-demarches",
    matchScore: 84,
    matchReason:
      "Compagnie basée à Lyon = zone de couverture directe. Aide dédiée à la création pluridisciplinaire régionale.",
  },
  {
    id: "grant-3",
    title: "SCAM — Brouillon d'un rêve",
    organization: "SCAM",
    amount: "8 000 € – 30 000 €",
    deadline: "15 septembre 2026",
    region: "National",
    description: "Bourse d'aide à l'écriture documentaire.",
    matchScore: 78,
    matchReason: "Projet de création originale : éligible au fonds SCAM.",
  },
];
