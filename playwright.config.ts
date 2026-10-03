import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // The production build is validated by the `build` step; E2E runs against the
  // dev server because `next start` is unsupported with `output: 'standalone'`.
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    // next-intl auto-detects the locale from `Accept-Language`. Pin French so
    // existing specs keep hitting the unprefixed (default-locale) URLs.
    locale: 'fr-FR',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // Cold dev-server compiles can take a while on CI runners.
    timeout: 120_000,
  },
});
