import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs/frontend',
  // Glob patterns or regular expressions to ignore test files.
  testIgnore: 'api/**/*.spec.ts',
  timeout: 45_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? undefined : 7,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'junit-report.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'frontend-chromium',
      testMatch: /frontend\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://localhost:5174',
        headless: false,
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://127.0.0.1:3001/api',
      },
    },
  ],
});
