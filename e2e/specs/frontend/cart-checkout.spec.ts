import { mockProducts } from '../../data/products.mock';
import { setAuthenticatedUser } from '../../helpers/auth';
import { selectors } from '../../fixtures/selectors/selectors';
import { expect, test } from '../../fixtures/ui.fixture';

test.describe('Cart and Checkout', () => {
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
  });

  const openCartWithOneItem = async (page, waitForPageLoad) => {
    await page.goto('/');
    await waitForPageLoad(page, 'catalog');
    await page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i }).first().click();
    await page.locator(selectors.nav.cartButton).click();
    await expect(page).toHaveURL('/cart');
  };

  /**
   * Validates the happy path for checkout with an authenticated user.
   * Expected behavior: user adds an item, opens cart, completes checkout,
   * and is redirected to the thank-you page with order summary visible.
   */
  test('TS01 authenticated user should complete checkout and navigate to thank-you page', async ({ page, waitForPageLoad }) => {
    await setAuthenticatedUser(page, {
      id: 101,
      name: 'João',
      lastName: 'Silva',
      email: 'joao@example.com',
      personType: 'PF',
    });

    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    await page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i }).first().click();
    await page.locator(selectors.nav.cartButton).click();
    await expect(page).toHaveURL('/cart');

    await expect(page.locator(selectors.cart.total)).toBeVisible();
    await page.getByRole('button', { name: /Fechar Pedido|Proceed to Checkout/i }).click();

    await expect(page).toHaveURL('/thank-you');
    await expect(page.locator('#thank-you-summary-wrapper')).toBeVisible();
  });

  /**
   * Validates access control when a non-authenticated user tries to checkout.
   * Expected behavior: user is redirected to login with a `next` parameter
   * pointing back to the cart route.
   */
  test('TS02 non-authenticated user should be redirected to login with next parameter', async ({ page, waitForPageLoad }) => {
    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    await page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i }).first().click();
    await page.locator(selectors.nav.cartButton).click();
    await expect(page).toHaveURL('/cart');

    await page.getByRole('button', { name: /Entrar para Finalizar/i }).click();
    await expect(page).toHaveURL(/\/login\?next=(%2Fcart|\/cart)/);
  });

  /**
   * Validates empty cart UX and checkout preconditions.
   * Expected behavior: cart page shows empty-state messaging and guidance
   * to return to catalog before checkout can happen.
   */
  test('TS03 empty cart should keep checkout unavailable', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('body')).toContainText('Meu Carrinho');
    await expect(page.locator('body')).toContainText('Seu carrinho está vazio');
    await expect(page.locator('body')).toContainText('Adicione produtos do catálogo para começar.');
    await expect(page.locator('body')).toContainText('Ir ao Catálogo');
  });

  /**
   * Validates that changing quantity to a valid positive integer updates cart state.
   * Expected behavior: quantity field, order total, and cart badge reflect the new value.
   */
  test('TS04 should update quantity, total and badge for a valid positive value', async ({ page, waitForPageLoad }) => {
    await openCartWithOneItem(page, waitForPageLoad);

    const quantityInput = page.locator('#cart-item-quantity-wrapper input[type="number"]').first();
    await expect(quantityInput).toHaveValue('1');
    await expect(page.locator(selectors.cart.total)).toContainText('R$ 50.99');
    await quantityInput.fill('3');
    await expect(quantityInput).toHaveValue('3');
    await expect(page.locator(selectors.cart.total)).toContainText('R$ 152.97');
    await expect(page.locator(selectors.nav.cartBadge)).toContainText('3');
  });

  /**
   * Validates lower boundary behavior for invalid zero quantity.
   * Expected behavior: quantity remains unchanged because updates only occur when value > 0.
   */
  test('TS05 should keep previous quantity when value is zero', async ({ page, waitForPageLoad }) => {
    await openCartWithOneItem(page, waitForPageLoad);

    const quantityInput = page.locator('#cart-item-quantity-wrapper input[type="number"]').first();
    await expect(quantityInput).toHaveValue('1');

    await quantityInput.fill('0');
    await expect(quantityInput).toHaveValue('1');
    await expect(page.locator(selectors.cart.total)).toContainText('R$ 50.99');
    await expect(page.locator(selectors.nav.cartBadge)).toContainText('1');
  });

  /**
   * Validates lower boundary behavior for negative quantity.
   * Expected behavior: negative values are ignored and current quantity is preserved.
   */
  test('TS06 should keep previous quantity when value is negative', async ({ page, waitForPageLoad }) => {
    await openCartWithOneItem(page, waitForPageLoad);

    const quantityInput = page.locator('#cart-item-quantity-wrapper input[type="number"]').first();
    await expect(quantityInput).toHaveValue('1');

    await quantityInput.fill('-2');

    await expect(quantityInput).toHaveValue('1');
    await expect(page.locator(selectors.cart.total)).toContainText('R$ 50.99');
    await expect(page.locator(selectors.nav.cartBadge)).toContainText('1');
  });

  /**
   * Validates that the component supports larger valid integer quantities.
   * Expected behavior: quantity and financial summary scale correctly for high values.
   */
  test('TS07 should handle larger valid quantity values correctly', async ({ page, waitForPageLoad }) => {
    await openCartWithOneItem(page, waitForPageLoad);

    const quantityInput = page.locator('#cart-item-quantity-wrapper input[type="number"]').first();
    await quantityInput.fill('25');

    await expect(quantityInput).toHaveValue('25');
    await expect(page.locator(selectors.cart.total)).toContainText('R$ 1274.75');
    await expect(page.locator(selectors.nav.cartBadge)).toContainText('25');
  });

  /**
   * Validates numeric normalization when decimal-like input is provided.
   * Expected behavior: parser converts the value to integer and updates quantity accordingly.
   */
  test('TS08 should normalize decimal input to integer quantity', async ({ page, waitForPageLoad }) => {
    await openCartWithOneItem(page, waitForPageLoad);

    const quantityInput = page.locator('#cart-item-quantity-wrapper input[type="number"]').first();
    await quantityInput.fill('2.9');

    await expect(quantityInput).toHaveValue('2');
    await expect(page.locator(selectors.cart.total)).toContainText('R$ 101.98');
    await expect(page.locator(selectors.nav.cartBadge)).toContainText('2');
  });

  /**
   * Validates item deletion behavior for a cart containing a single product.
   * Expected behavior: after deleting the only item, the cart displays the empty-state content.
   */
  test('TS09 should remove a single item and show empty cart state', async ({ page, waitForPageLoad }) => {
    await openCartWithOneItem(page, waitForPageLoad);

    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(1);
    await page.getByRole('button', { name: /delete/i }).first().click();

    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(0);
    await expect(page.locator('body')).toContainText(/Seu carrinho está vazio|Your cart is empty/i);
    await expect(page.locator('body')).toContainText(/Adicione produtos do catálogo para começar\.|Add products from catalog to get started\./i);
  });

  /**
   * Validates removing three different items from the cart until it becomes empty.
   * Expected behavior: all delete actions succeed, no cart items remain, and empty-state UI is shown.
   */
  test('TS10 should add three items, remove all of them, and validate empty cart', async ({ page, waitForPageLoad }) => {
    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    const addButtons = page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i });
    await addButtons.nth(0).click();
    await addButtons.nth(1).click();
    await addButtons.nth(2).click();

    await expect(page.locator(selectors.nav.cartBadge)).toContainText('3');

    await page.locator(selectors.nav.cartButton).click();
    await expect(page).toHaveURL('/cart');

    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(3);

    await page.getByRole('button', { name: /delete/i }).first().click();
    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(2);

    await page.getByRole('button', { name: /delete/i }).first().click();
    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(1);

    await page.getByRole('button', { name: /delete/i }).first().click();
    await expect(page.getByRole('button', { name: /delete/i })).toHaveCount(0);

    await expect(page.locator('body')).toContainText(/Meu Carrinho|My Cart/i);
    await expect(page.locator('body')).toContainText(/Seu carrinho está vazio|Your cart is empty/i);
    await expect(page.locator('body')).toContainText(/Ir ao Catálogo|Go to Catalog/i);
  });
});
