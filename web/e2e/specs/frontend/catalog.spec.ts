import { mockProducts } from '../../data/products.mock';
import { expect, test } from '../../fixtures/ui.fixture';
import { CatalogPage } from '../../pages/CatalogPage';
import { NavComponent } from '../../pages/NavComponent';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';

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
    const catalogPage = new CatalogPage(page);
    await waitForPageLoad(page, 'catalog');
    await expect(page.locator(catalogPage.getProductImageSelector(1))).toBeVisible();
    await expect(page.locator(catalogPage.getProductImageSelector(2))).toBeVisible();
  });

  test('TS02 deve permitir busca por texto e atualizar contagem', async ({ page, waitForPageLoad }) => {
    const catalogPage = new CatalogPage(page);
    const navComponent = new NavComponent(page);
    await waitForPageLoad(page, 'catalog');
    await page.fill(navComponent.searchInput, 'Smartphone');

    await expect(page.locator(catalogPage.getProductImageSelector(2))).toBeVisible();
    await expect(page.locator(catalogPage.getProductImageSelector(1))).toHaveCount(0);
    await expect(page.getByText(/1 produto encontrado|1 product found/i)).toBeVisible();
  });

  test('TS03 deve aplicar filtro por categoria', async ({ page, waitForPageLoad }) => {
    const catalogPage = new CatalogPage(page);
    await waitForPageLoad(page, 'catalog');
    await page.getByRole('button', { name: 'Acessórios' }).click();

    await expect(page.locator(catalogPage.getProductImageSelector(1))).toBeVisible();
    await expect(page.locator(catalogPage.getProductImageSelector(2))).toHaveCount(0);
  });

  test('TS04 deve mostrar estado vazio quando busca não retorna itens', async ({ page, waitForPageLoad }) => {
    const catalogPage = new CatalogPage(page);
    const navComponent = new NavComponent(page);
    await waitForPageLoad(page, 'catalog');
    await page.fill(navComponent.searchInput, 'PRODUTO_INEXISTENTE_123');

    await expect(page.locator(catalogPage.emptyState)).toBeVisible();
  });

  test('TS05 deve navegar para detalhes ao clicar no produto', async ({ page, waitForPageLoad }) => {
    const catalogPage = new CatalogPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    await waitForPageLoad(page, 'catalog');
    await catalogPage.clickProductImage(1);

    await expect(page).toHaveURL(/\/product\/1$/);
    await expect(page.locator(productDetailsPage.image)).toBeVisible();
  });

  /**
   * Validates search context persistence across navigation.
   * Expected behavior: after filtering catalog, opening product details and returning,
   * search term and filtered result set should remain the same.
   */
  test('TS06 should preserve search filter after navigating to details and back', async ({ page, waitForPageLoad }) => {
    const catalogPage = new CatalogPage(page);
    const productDetailsPage = new ProductDetailsPage(page);
    const navComponent = new NavComponent(page);
    
    await waitForPageLoad(page, 'catalog');
    await page.fill(navComponent.searchInput, 'Smartphone');

    await expect(page.locator(catalogPage.getProductImageSelector(2))).toBeVisible();
    await expect(page.locator(catalogPage.getProductImageSelector(1))).toHaveCount(0);

    await catalogPage.clickProductImage(2);
    await expect(page).toHaveURL(/\/product\/2$/);
    await waitForPageLoad(page, 'productDetails');

    await page.getByRole('button', { name: /Voltar|Back/i }).first().click();
    await expect(page).toHaveURL('/');
    await waitForPageLoad(page, 'catalog');

    await expect(page.locator(navComponent.searchInput)).toHaveValue('Smartphone');
    await expect(page.locator(catalogPage.getProductImageSelector(2))).toBeVisible();
    await expect(page.locator(catalogPage.getProductImageSelector(1))).toHaveCount(0);
  });
});
