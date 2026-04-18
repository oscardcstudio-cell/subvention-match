import { test, expect } from "@playwright/test";
import { installApiMocks } from "./_mocks";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test.describe("Homepage", () => {
  test("loads with Mecene branding and hero tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Mecene/);

    // Hero title: "VOUS AVEZ L'ŒUVRE. ON TROUVE L'ARGENT."
    const h1 = page.locator("h1").first();
    await expect(h1).toContainText("VOUS AVEZ");
    await expect(h1).toContainText("L'ŒUVRE");
    await expect(h1).toContainText("ON TROUVE");
    await expect(h1).toContainText("L'ARGENT");

    // Beta banner at the top
    await expect(page.locator("text=BETA").first()).toBeVisible();

    // Dark background
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(10, 10, 10)");
  });

  test("shows live stats from mocked API", async ({ page }) => {
    await page.goto("/");
    // 473 subventions
    await expect(page.locator("text=473").first()).toBeVisible();
  });

  test("has 13 'Je suis...' profile cards linking to /form", async ({ page }) => {
    await page.goto("/");
    const badges = page.locator('[data-testid^="badge-"]');
    await expect(badges).toHaveCount(13);
    // Click one should navigate to /form with query params
    await page.locator('[data-testid="badge-musician"]').click();
    await expect(page).toHaveURL(/\/form/);
  });

  test("ChatGPT comparison section is visible", async ({ page }) => {
    await page.goto("/");
    await page.locator('#comparaison').scrollIntoViewIfNeeded();
    await expect(page.locator("text=ET POURQUOI").first()).toBeVisible();
    await expect(page.locator("text=CHATGPT").first()).toBeVisible();
  });

  test("'Comment ça marche' shows 3 steps", async ({ page }) => {
    await page.goto("/");
    await page.locator('#how').scrollIntoViewIfNeeded();
    await expect(page.locator("text=COMMENT")).toBeVisible();
    await expect(page.locator("text=Remplissez le formulaire")).toBeVisible();
    await expect(page.locator("text=Recevez votre top 5 personnalisé")).toBeVisible();
  });

  test("Example grant card renders with ADSV and toggles details", async ({ page }) => {
    await page.goto("/");
    await page.locator('#example').scrollIntoViewIfNeeded();
    // "ADSV" appears in the card header h3
    await expect(page.getByRole("heading", { name: /ADSV/ })).toBeVisible();

    // Toggle details
    const toggleBtn = page.locator('[data-testid="button-toggle-details"]');
    await toggleBtn.click();
    await expect(page.locator("text=Présentation du projet artistique")).toBeVisible();
  });

  test("Waitlist form submits successfully", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-testid="input-waitlist-email"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="input-waitlist-email"]').fill("test@example.com");
    await page.locator('[data-testid="button-waitlist-submit"]').click();
    await expect(page.locator("text=/C'est noté|You're in/").first()).toBeVisible({ timeout: 3_000 });
  });

  test("'Commencer' button navigates to /form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Commencer/i }).first().click();
    await expect(page).toHaveURL(/\/form/);
  });
});
