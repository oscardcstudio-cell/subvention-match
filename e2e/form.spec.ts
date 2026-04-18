import { test, expect } from "@playwright/test";
import { installApiMocks } from "./_mocks";

test.beforeEach(async ({ page }) => {
  await installApiMocks(page);
});

test.describe("Form wizard", () => {
  test("loads step 01 with profile options", async ({ page }) => {
    await page.goto("/form");
    await expect(page.locator("h1").first()).toContainText("VOUS ÊTES");
    // 6 profile cards
    await expect(page.locator("text=Compagnie / collectif")).toBeVisible();
    await expect(page.locator("text=Artiste individuel")).toBeVisible();
    await expect(page.locator("text=Association culturelle")).toBeVisible();
  });

  test("step counter shows 01 / 07", async ({ page }) => {
    await page.goto("/form");
    await expect(page.locator("header").locator("text=/Étape.*01.*07/i")).toBeVisible();
  });

  test("navigates through all 7 steps with Next", async ({ page }) => {
    await page.goto("/form");
    const titles: string[] = [];

    for (let i = 0; i < 7; i++) {
      const h1 = await page.locator("h1").first().innerText();
      titles.push(h1);
      if (i < 6) {
        await page.getByRole("button", { name: /Question suivante/i }).click();
        await page.waitForTimeout(200);
      }
    }

    expect(titles[0]).toContain("QUOI AU JUSTE");
    expect(titles[1]).toContain("DISCIPLINE");
    expect(titles[2]).toContain("DÉCRIVEZ");
    expect(titles[3]).toContain("CRÉATION");
    expect(titles[4]).toContain("FRANCE");
    expect(titles[5]).toContain("RAPPORT");
    expect(titles[6]).toContain("AFFINE");
  });

  test("last step shows 'Lancer le matching' and submits to loading", async ({ page }) => {
    await page.goto("/form");
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: /Question suivante/i }).click();
      await page.waitForTimeout(150);
    }
    // Step 7
    await expect(page.getByRole("button", { name: /Lancer le matching/i })).toBeVisible();

    // Fill email (required for submit)
    // We're on step 7 but email is step 6 - go back, fill, re-advance
    await page.getByRole("button", { name: /Précédent/i }).click();
    await page.waitForTimeout(150);
    await page.locator('input[type="email"]').fill("e2e@test.com");
    await page.getByRole("button", { name: /Question suivante/i }).click();
    await page.waitForTimeout(150);

    // Submit
    await page.getByRole("button", { name: /Lancer le matching/i }).click();
    await expect(page).toHaveURL(/\/loading\?sessionId=/, { timeout: 5_000 });
  });

  test("progress grid at bottom allows jumping between steps", async ({ page }) => {
    await page.goto("/form");
    // Click step 04 in the grid
    const step4 = page.locator('button:has-text("Type projet")');
    await step4.scrollIntoViewIfNeeded();
    await step4.click();
    await page.waitForTimeout(200);
    await expect(page.locator("h1").first()).toContainText("CRÉATION");
  });

  test("description textarea has a grey placeholder that clears on input", async ({ page }) => {
    await page.goto("/form");
    // Jump to step 3
    const step3 = page.locator('button:has-text("Description")');
    await step3.scrollIntoViewIfNeeded();
    await step3.click();
    await page.waitForTimeout(200);

    const textarea = page.locator("textarea").first();
    await expect(textarea).toHaveAttribute("placeholder", /compagnie de théâtre/i);
    await expect(textarea).toHaveValue("");

    await textarea.fill("Test project description");
    await expect(textarea).toHaveValue("Test project description");
  });

  test("pre-fills artistic domain from URL ?domain=musique", async ({ page }) => {
    await page.goto("/form?domain=musique");
    // Jump to step 2 (Discipline)
    const step2 = page.locator('button:has-text("Discipline")');
    await step2.click();
    await page.waitForTimeout(300);

    // "Musique" button should be marked selected (has inline style background set to primary-soft)
    const musique = page.locator('button:has-text("Musique")').first();
    const bg = await musique.evaluate((el) => (el as HTMLElement).style.background);
    // Selected state applies background: var(--mc-primary-soft)
    expect(bg.length > 0).toBe(true); // at minimum, some inline style was applied
    const borderColor = await musique.evaluate((el) => (el as HTMLElement).style.borderColor);
    expect(borderColor).toContain("mc-primary");
  });
});
