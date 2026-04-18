import { test, expect } from "@playwright/test";
import { installApiMocks } from "./_mocks";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test.describe("Legal pages", () => {
  test("Mentions légales renders", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(page.locator("h1").first()).toContainText("MENTIONS LÉGALES");
    await expect(page.locator("text=Éditeur du site")).toBeVisible();
    await expect(page.locator("text=Hébergement")).toBeVisible();
  });

  test("CGV renders", async ({ page }) => {
    await page.goto("/cgv");
    await expect(page.locator("h1").first()).toContainText("CONDITIONS GÉNÉRALES");
    await expect(page.locator("text=1. Objet")).toBeVisible();
  });

  test("Confidentialité renders", async ({ page }) => {
    await page.goto("/confidentialite");
    await expect(page.locator("h1").first()).toContainText("POLITIQUE DE CONFIDENTIALITÉ");
    await expect(page.locator("text=Ce qu'on collecte")).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("renders on unknown route", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-1234");
    await expect(page.locator("h1").first()).toContainText("404");
    await expect(page.locator("text=CETTE PAGE")).toBeVisible();
    await expect(page.getByRole("link", { name: /Retour à l'accueil/ })).toBeVisible();
  });
});

test.describe("Feedback widget", () => {
  test("toggles open/close", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: /Donner un retour/i });
    await expect(btn).toBeVisible();

    // Panel closed initially
    await expect(page.locator("text=Dites-nous tout")).not.toBeVisible();

    await btn.click();
    await expect(page.locator("text=Dites-nous tout")).toBeVisible();

    // Suggestion/Bug toggle visible
    await expect(page.getByRole("button", { name: "Suggestion" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Bug" })).toBeVisible();
  });

  test("Bug tab changes placeholder", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Donner un retour/i }).click();
    const ta = page.locator('[data-testid="feedback-textarea"]');
    await expect(ta).toBeVisible();

    // Default is Suggestion → click Bug
    await page.getByRole("button", { name: "Bug" }).click();
    await expect(ta).toHaveAttribute("placeholder", /problème/i);
  });

  test("submits feedback to /api/beta-feedback", async ({ page }) => {
    let called = false;
    await page.route("**/api/beta-feedback", (route) => {
      called = true;
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) });
    });
    await page.goto("/");
    await page.getByRole("button", { name: /Donner un retour/i }).click();
    const ta = page.locator('[data-testid="feedback-textarea"]');
    await expect(ta).toBeVisible();
    await ta.fill("test feedback message");
    await page.getByRole("button", { name: "Envoyer" }).click();
    await page.waitForTimeout(500);
    expect(called).toBe(true);
    await expect(page.locator("text=MERCI")).toBeVisible();
  });
});

test.describe("Accessibility basics", () => {
  test("has a main h1 on every page", async ({ page }) => {
    const pages = ["/", "/form", "/mentions-legales", "/cgv", "/confidentialite", "/missing"];
    for (const p of pages) {
      await page.goto(p);
      const count = await page.locator("h1").count();
      expect(count, `${p} should have ≥1 h1`).toBeGreaterThanOrEqual(1);
    }
  });

  test("feedback button has aria-label", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator('[aria-label="Donner un retour"]');
    await expect(btn).toBeVisible();
  });
});
