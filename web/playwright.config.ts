import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const isCI = !!(globalThis as { process?: { env?: { CI?: string } } }).process?.env?.CI;

export default defineConfig({
  testDir: './e2e/specs',
  timeout: 50_000,
  expect: {
    timeout: 25_000,
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
    actionTimeout: 25_000,
    navigationTimeout: 50_000,
    testIdAttribute: 'data-element-id',
  },
  projects: [
    {
      name: 'frontend-chromium',
      testMatch: /frontend\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        baseURL: 'http://127.0.0.1:5174',
        headless: isCI,
        screenshot: 'only-on-failure',
      },
    },
    
    // {
    //   name: 'frontend-webkit',
    //   testMatch: /frontend\/.*\.spec\.ts/,
    //   use: {
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1920, height: 1080 },
    //     baseURL: 'http://localhost:5174',
    //     headless: isCI,
    //     screenshot: 'only-on-failure',
    //   },
    // },
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
