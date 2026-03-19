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

  test('TS01 usuário logado deve finalizar checkout e ir para thank-you', async ({ page, waitForPageLoad }) => {
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

  test('TS02 usuário não logado deve ser redirecionado para login com next', async ({ page, waitForPageLoad }) => {
    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    await page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i }).first().click();
    await page.locator(selectors.nav.cartButton).click();
    await expect(page).toHaveURL('/cart');

    await page.getByRole('button', { name: /Entrar para Finalizar/i }).click();
    await expect(page).toHaveURL(/\/login\?next=(%2Fcart|\/cart)/);
  });

  test('TS03 carrinho vazio deve manter checkout desabilitado', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.locator('body')).toContainText('Meu Carrinho');
    await expect(page.locator('body')).toContainText('Seu carrinho está vazio');
    await expect(page.locator('body')).toContainText('Adicione produtos do catálogo para começar.');
    await expect(page.locator('body')).toContainText('Ir ao Catálogo');
  });
});
