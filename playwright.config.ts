import { defineConfig, devices } from "@playwright/test";

/**
 * Mecene E2E tests.
 *
 * Runs against the Vite-built static bundle served on port 4173 with SPA fallback.
 * A small Node server (scripts/e2e-server.mjs) serves dist/public/ with
 * `index.html` fallback so wouter routes work.
 *
 * All /api/* routes are mocked per-test with page.route().
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: "http://localhost:4174",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "node scripts/e2e-server.mjs",
    port: 4174,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
