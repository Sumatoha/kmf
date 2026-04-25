import { defineConfig } from "@playwright/test";

// Smoke E2E for the public surface (landing, signup, login). Dashboard is
// gated by a real backend + DB so we leave deeper coverage to integration
// tests once Supabase is connected.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 800 },
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
