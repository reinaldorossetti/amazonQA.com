import { defineConfig, devices } from '@playwright/test';

const isCI = !!(globalThis as { process?: { env?: { CI?: string } } }).process?.env?.CI;

export default defineConfig({
  testDir: './web/e2e/specs',
  timeout: 45_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 3 : 6,
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
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'frontend-chromium',
      testMatch: /frontend\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://localhost:5174',
        headless: isCI,
        screenshot: 'only-on-failure',
      },
    },


    
    {
      name: 'frontend-webkit',
      testMatch: /frontend\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://localhost:5174',
        headless: isCI,
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'frontend-edge',
      testMatch: /frontend\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Edge'],
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://localhost:5174',
        headless: isCI,
        screenshot: 'only-on-failure',
      },
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: 'http://127.0.0.1:3001/api/',
      },
    },
  ],
});
