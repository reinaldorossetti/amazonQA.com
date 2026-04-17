import { expect, test as base, type Page } from '@playwright/test';
import { PageBase } from '../helpers/PageBase';

type WaitForPageLoad = (page: Page) => Promise<void>;

export const test = base.extend<{ waitForPageLoad: WaitForPageLoad; pageBase: PageBase }>({
  waitForPageLoad: async ({ }, use) => {
    const fn: WaitForPageLoad = async (page) => {
      await page.waitForLoadState('networkidle');
    };

    await use(fn);
  },
  pageBase: async ({ page }, use) => {
    await use(new PageBase(page));
  },
});

test.afterEach(async ({ page }, testInfo) => {
  const safeName = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await testInfo.attach(`screenshot-${safeName}-${testInfo.status}`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

export { expect };
