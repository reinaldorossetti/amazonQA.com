import { expect, test } from '../../fixtures/ui.fixture';
import { selectors } from '../../fixtures/selectors/selectors';
import { mockProducts } from '../../data/products.mock';

test.describe('Security / Access Control', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the products API as usual
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });
  });

  test('SE01 - Não logado tentando fazer checkout deve redirecionar para login', async ({ page, waitForPageLoad }) => {
    // Go to catalog and wait for it to load
    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    // Add product to cart
    await page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i }).first().click();
    
    // Go to cart
    await page.locator(selectors.nav.cartButton).click();
    await expect(page).toHaveURL('/cart');

    // Try to checkout
    const checkoutBtn = page.getByRole('button', { name: /Entrar para Finalizar/i });
    await checkoutBtn.click();

    // Should redirect to login with the correct next parameter
    await expect(page).toHaveURL(/\/login\?next=(%2Fcart|\/cart)/);
  });

  test('SE02 - Tentar acessar a página de confirmação (/thank-you) diretamente sem estar logado deve redirecionar', async ({ page }) => {
    // Access thank-you page directly
    await page.goto('/thank-you');

    // It should not allow access and instead redirect to login or home
    // Currently, standard behavior for an unauthenticated user hitting a protected route
    // is to redirect to /login
    await expect(page).toHaveURL(/\/login|^\/$/);
  });
});
