import { mockProducts } from '../../data/products.mock';
import { setAuthenticatedUser } from '../../helpers/auth';
import { expect, test } from '../../fixtures/ui.fixture';
import { CartPage } from '../../pages/CartPage';
import { PaymentsPage } from '../../pages/PaymentsPage';
import type { Page } from '@playwright/test';

const CARD_NUMBERS_BY_BRAND = [
  { id: 'visa', number: '4111111111111111' },
  { id: 'mastercard', number: '5555555555554444' },
  { id: 'elo', number: '6362970000457013' },
  { id: 'amex', number: '378282246310005' },
  { id: 'hipercard', number: '6062825624254001' },
  { id: 'hiper', number: '6370950000000000' },
  { id: 'cabal', number: '6376010000000000' },
  { id: 'verdecard', number: '5899000000000000' },
  { id: 'unionpay', number: '6240008631401148' },
  { id: 'diners', number: '30569309025904' },
] as const;

async function goToPayments(page: Page, waitForPageLoad: any) {
  const cartPage = new CartPage(page);

  await setAuthenticatedUser(page, {
    id: 303,
    name: 'Payment',
    lastName: 'Tester',
    email: 'payment.tester@example.com',
    personType: 'PF',
  });

  await cartPage.openCartWithOneItem(waitForPageLoad);
  await cartPage.clickProceedToCheckout();
  await expect(page).toHaveURL('/payments');
}

test.describe('Payments - Card Brands', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

    await page.route('**/api/products/*', async (route) => {
      const id = Number(route.request().url().split('/').pop());
      const item = mockProducts.find((p) => p.id === id);

      if (!item) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Produto não encontrado' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(item),
      });
    });

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 9001,
          order_number: 'ORD-9001',
          status: 'created',
          subtotal: 50.99,
          shipping_total: 0,
          discount_total: 0,
          grand_total: 50.99,
          items: [],
        }),
      });
    });
  });

  /**
   * Validates card brands strip progressive disclosure.
   * Expected behavior: strip is hidden before card number input and visible after typing.
   */
  test('TS01 should hide brands initially and show strip after typing card number', async ({ page, waitForPageLoad }) => {
    const paymentsPage = new PaymentsPage(page);

    await goToPayments(page, waitForPageLoad);

    await expect(page.locator(paymentsPage.brandsStrip)).toHaveCount(0);

    await paymentsPage.fillCardNumber('4111111111111111');
    await expect(page.locator(paymentsPage.brandsStrip)).toBeVisible();
  });

  /**
   * Validates active-brand highlight for each supported card brand.
   * Expected behavior: each typed card number highlights its corresponding brand chip.
   */
  test('TS02 should activate each card brand when matching number is typed', async ({ page, waitForPageLoad }) => {
    const paymentsPage = new PaymentsPage(page);

    await goToPayments(page, waitForPageLoad);

    for (const brand of CARD_NUMBERS_BY_BRAND) {
      await paymentsPage.clearCardNumber();
      await paymentsPage.fillCardNumber(brand.number);
      await expect(page.locator(paymentsPage.brandsStrip)).toBeVisible();
      await expect(paymentsPage.getBrandCardLocator(brand.id)).toBeVisible();

      await expect(paymentsPage.getBrandCardLocator(brand.id)).toHaveAttribute('data-active', 'true');
    }
  });

  /**
   * Validates that every configured brand is rendered in the accepted brands strip.
   * Expected behavior: all 10 required card brands are visible in the payment screen.
   */
  test('TS03 should render all required card brands in accepted list', async ({ page, waitForPageLoad }) => {
    const paymentsPage = new PaymentsPage(page);

    await goToPayments(page, waitForPageLoad);

    await paymentsPage.fillCardNumber('4111111111111111');

    for (const brand of CARD_NUMBERS_BY_BRAND) {
      await expect(paymentsPage.getBrandCardLocator(brand.id)).toBeVisible();
    }
  });

  /**
   * Captures visual snapshots for every supported card brand before confirmation.
   * Expected behavior: for each brand, strip and logo are visible, active flag is true,
   * and screenshot is taken pre-submit.
   */
  test('TS04 should capture screenshot for each card brand before confirmation', async ({ page, waitForPageLoad }, testInfo) => {
    const paymentsPage = new PaymentsPage(page);

    await goToPayments(page, waitForPageLoad);

    await paymentsPage.fillCardHolderName('João da Silva');
    await paymentsPage.fillExpiry('1229');
    await paymentsPage.fillCvv('123');
    await paymentsPage.fillInstallments('2');

    await expect(page.locator(paymentsPage.payNowButton)).toBeVisible();

    for (const brand of CARD_NUMBERS_BY_BRAND) {
      await paymentsPage.clearCardNumber();
      await paymentsPage.fillCardNumber(brand.number);

      await expect(page.locator(paymentsPage.brandsStrip)).toBeVisible();
      await expect(paymentsPage.getBrandCardLocator(brand.id)).toBeVisible();
      await expect(paymentsPage.getBrandCardLocator(brand.id)).toHaveAttribute('data-active', 'true');

      const screenshotPath = testInfo.outputPath(`payments-card-data-before-confirmation-${brand.id}.png`);
      await paymentsPage.takePreConfirmationScreenshot(screenshotPath);
      await testInfo.attach(`payments-card-data-before-confirmation-${brand.id}`, {
        path: screenshotPath,
        contentType: 'image/png',
      });
    }
  });
});
