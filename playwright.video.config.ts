import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './web/e2e/specs',
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  outputDir: './img/demo-videos',
  reporter: [['list']],
  use: {
    trace: 'off',
    screenshot: 'on',
    // 'on' records every test and keeps it regardless of outcome
    video: { mode: 'on', size: { width: 1280, height: 720 } },
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    // slowMo makes actions visible in the recorded video
    launchOptions: { slowMo: 400 },
  },
  projects: [
    {
      name: 'purchase flow',
      testMatch: /frontend\/real-purchase-flow\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:5174',
        headless: true,
      },
    },
  ],
});
