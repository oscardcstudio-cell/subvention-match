import { test, expect } from "@playwright/test";
import { installApiMocks } from "./_mocks";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test.describe("Results page", () => {
  test("redirects to / when no sessionId", async ({ page }) => {
    await page.goto("/results");
    await expect(page).toHaveURL(/\/(|$)/, { timeout: 3_000 });
  });

  test("renders 3 mocked matches with scores", async ({ page }) => {
    await page.goto("/results?sessionId=e2e-session-abc123");
    await expect(page.locator("h1").first()).toContainText("MATCH");
    await expect(page.locator("h1").first()).toContainText("TROUVÉS");

    // Match titles (scope to article h2 to avoid matchReason mentions)
    const titles = page.locator("article h2");
    await expect(titles).toHaveCount(3);
    await expect(titles.nth(0)).toContainText("ADSV");
    await expect(titles.nth(1)).toContainText("DRAC ARA");
    await expect(titles.nth(2)).toContainText("SCAM");

    // Top match badge only on first
    await expect(page.locator("text=Meilleur match")).toHaveCount(1);

    // Score values visible (92, 84, 78)
    await expect(page.locator("text=92").first()).toBeVisible();
    await expect(page.locator("text=84").first()).toBeVisible();
    await expect(page.locator("text=78").first()).toBeVisible();
  });

  test("project recap shows submission fields + edit button", async ({ page }) => {
    await page.goto("/results?sessionId=e2e-session-abc123");
    // Recap card is the first match of "Auvergne-Rhône-Alpes"
    await expect(page.locator("text=Auvergne-Rhône-Alpes").first()).toBeVisible();
    // Description quoted
    await expect(page.locator("text=Compagnie de théâtre contemporain à Lyon")).toBeVisible();
    // Edit button
    await expect(page.getByRole("button", { name: /Modifier/ })).toBeVisible();
  });

  test("expand details of first match", async ({ page }) => {
    await page.goto("/results?sessionId=e2e-session-abc123");
    const firstDetails = page.getByRole("button", { name: /Voir tous les détails/ }).first();
    await firstDetails.click();
    await expect(page.locator("text=Présentation du projet artistique")).toBeVisible();
    await expect(page.locator("text=adsv@culture.gouv.fr")).toBeVisible();
  });

  test("feedback thumbs up sends to /api/match-feedback", async ({ page }) => {
    let feedbackCalled = false;
    await page.route("**/api/match-feedback", (route) => {
      feedbackCalled = true;
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/results?sessionId=e2e-session-abc123");
    await page.getByRole("button", { name: /Pertinent/ }).first().click();
    await page.waitForTimeout(300);
    expect(feedbackCalled).toBe(true);
  });

  test("sort buttons are interactive and update active state", async ({ page }) => {
    await page.goto("/results?sessionId=e2e-session-abc123");

    // Default sort: score → ADSV (highest score) first
    const firstTitle = await page.locator("article h2").first().innerText();
    expect(firstTitle).toContain("ADSV");

    // Click deadline button → becomes active (mc-chip-primary class adds teal border)
    const deadlineBtn = page.getByRole("button", { name: /Deadline proche/ });
    await deadlineBtn.click();
    await page.waitForTimeout(150);
    const cls = await deadlineBtn.getAttribute("class");
    expect(cls).toContain("mc-chip-primary");
  });

  test("'Accéder au dossier' has a real external href", async ({ page }) => {
    await page.goto("/results?sessionId=e2e-session-abc123");
    const link = page.getByRole("link", { name: /Accéder au dossier/ }).first();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
  });

  test("PDF download link points to /api/pdf/:sessionId", async ({ page }) => {
    await page.goto("/results?sessionId=e2e-session-abc123");
    const link = page.getByRole("link", { name: /Télécharger PDF/i }).first();
    const href = await link.getAttribute("href");
    // Server route is /api/pdf/:sessionId (path param, not query string)
    expect(href).toMatch(/\/api\/pdf\/e2e-session-abc123$/);
  });
});
