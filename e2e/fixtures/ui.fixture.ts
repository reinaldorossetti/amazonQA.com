import { expect, test as base, type Page } from '@playwright/test';

type PageName = 'catalog' | 'productDetails' | 'cart' | 'login' | 'register' | 'thankYou';

type WaitForPageLoad = (page: Page, pageName: PageName) => Promise<void>;

const readinessSelectorByPage: Record<PageName, string[]> = {
  catalog: ['#catalog-header-wrapper'],
  productDetails: ['#product-details-actions-wrapper'],
  cart: ['#cart-content-wrapper', 'text=Seu carrinho está vazio', 'text=Your cart is empty'],
  login: ['#login-form-body'],
  register: ['#register-form-body'],
  thankYou: ['#thank-you-summary-wrapper', 'text=Obrigado pela sua compra!', 'text=Thank you for your purchase!'],
};

async function waitForLoadingTransition(page: Page, pageName: PageName) {
  const loadingSelector = pageName === 'catalog' ? '#catalog-loading-wrapper' : '#loading';
  const loading = page.locator(loadingSelector);

  try {
    await loading.waitFor({ state: 'visible', timeout: 1_200 });
    await loading.waitFor({ state: 'hidden', timeout: 10_000 });
  } catch {
    // Não bloqueia quando o loading é rápido ou não existe na página.
  }
}

export const test = base.extend<{ waitForPageLoad: WaitForPageLoad }>({
  waitForPageLoad: async ({}, use) => {
    const fn: WaitForPageLoad = async (page, pageName) => {
      await waitForLoadingTransition(page, pageName);
      const selectors = readinessSelectorByPage[pageName];

      let lastError: unknown;
      for (const selector of selectors) {
        try {
          await page.locator(selector).first().waitFor({ state: 'visible', timeout: 8_000 });
          return;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError;
    };

    await use(fn);
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
