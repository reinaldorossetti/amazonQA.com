import { expect, test } from '../../fixtures/ui.fixture';
import { NavComponent } from '../../pages/NavComponent';
import { mockProducts } from '../../data/products.mock';
import { setAuthenticatedUser } from '../../helpers/auth';

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
    const navComponent = new NavComponent(page);
    // Go to catalog and wait for it to load
    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    // Add product to cart
    await page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i }).first().click();
    
    // Go to cart
    await page.locator(navComponent.cartButton).click();
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

  /**
   * Validates that logout removes access to protected routes.
   * Expected behavior: after logout, direct access to /thank-you redirects to login.
   */
  test('SE03 - Should revoke protected access after logout', async ({ page, waitForPageLoad }) => {
    const navComponent = new NavComponent(page);
    await setAuthenticatedUser(page, {
      id: 700,
      name: 'Security',
      lastName: 'Tester',
      email: 'security@example.com',
      personType: 'PF',
    });

    await page.goto('/');
    await waitForPageLoad(page, 'catalog');
    await expect(page.locator(navComponent.userGreeting)).toBeVisible();

    await page.locator(navComponent.logoutButton).click();
    await expect(page.locator(navComponent.userGreeting)).not.toBeVisible();

    await page.goto('/thank-you');
    await expect(page).toHaveURL(/\/login\?next=(%2Fthank-you|\/thank-you)/);
  });
});
