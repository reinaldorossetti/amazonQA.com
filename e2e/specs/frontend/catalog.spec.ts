import { mockProducts } from '../../data/products.mock';
import { selectors } from '../../helpers/selectors';
import { expect, test } from '../../fixtures/ui.fixture';

test.describe('Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

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

    await page.goto('/');
  });

  test('TS01 deve listar produtos ao carregar página', async ({ page, waitForPageLoad }) => {
    await waitForPageLoad(page, 'catalog');
    await expect(page.locator(selectors.catalog.productImageById(1))).toBeVisible();
    await expect(page.locator(selectors.catalog.productImageById(2))).toBeVisible();
  });

  test('TS02 deve permitir busca por texto e atualizar contagem', async ({ page, waitForPageLoad }) => {
    await waitForPageLoad(page, 'catalog');
    await page.fill(selectors.nav.searchInput, 'Smartphone');

    await expect(page.locator(selectors.catalog.productImageById(2))).toBeVisible();
    await expect(page.locator(selectors.catalog.productImageById(1))).toHaveCount(0);
    await expect(page.getByText(/1 produto encontrado|1 product found/i)).toBeVisible();
  });

  test('TS03 deve aplicar filtro por categoria', async ({ page, waitForPageLoad }) => {
    await waitForPageLoad(page, 'catalog');
    await page.getByRole('button', { name: 'Acessórios' }).click();

    await expect(page.locator(selectors.catalog.productImageById(1))).toBeVisible();
    await expect(page.locator(selectors.catalog.productImageById(2))).toHaveCount(0);
  });

  test('TS04 deve mostrar estado vazio quando busca não retorna itens', async ({ page, waitForPageLoad }) => {
    await waitForPageLoad(page, 'catalog');
    await page.fill(selectors.nav.searchInput, 'PRODUTO_INEXISTENTE_123');

    await expect(page.locator(selectors.catalog.empty)).toBeVisible();
  });

  test('TS05 deve navegar para detalhes ao clicar no produto', async ({ page, waitForPageLoad }) => {
    await waitForPageLoad(page, 'catalog');
    await page.locator(selectors.catalog.productImageById(1)).click();

    await expect(page).toHaveURL(/\/product\/1$/);
    await expect(page.locator(selectors.productDetails.image)).toBeVisible();
  });
});
