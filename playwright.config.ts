import { defineConfig, devices } from '@playwright/test';

// The app runs on the production build served by `vite preview` with mocked HTTP (ADR-12);
// see apps/frontend/src/main.tsx for how the mock worker is enabled.
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  projects: [
    { name: 'dark-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 }, colorScheme: 'dark' } },
    { name: 'light-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 }, colorScheme: 'light' } },
    { name: 'dark-mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 1100 }, colorScheme: 'dark' } },
    { name: 'light-mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 1100 }, colorScheme: 'light' } },
  ],
  webServer: {
    command: 'npm run preview -w apps/frontend',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
