import { mockProducts } from '../../data/products.mock';
import { expect, test } from '../../fixtures/ui.fixture';
import { ProductDetailsPage } from '../../pages/ProductDetailsPage';
import { NavComponent } from '../../pages/NavComponent';

test.describe('Product Details', () => {
  test.beforeEach(async ({ page }) => {
    // Mock all product list requests
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

    // Mock individual product requests by ID
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

  test('TS01 deve exibir dados principais do produto', async ({ page, waitForPageLoad }) => {
    const productDetailsPage = new ProductDetailsPage(page);
    await productDetailsPage.goToProduct(1);

    // Verify product heading
    await expect(page.getByRole('heading', { name: /Relógio Elegante/i })).toBeVisible();
    // Verify product image is rendered
    await expect(page.locator(productDetailsPage.image)).toBeVisible();
    // Verify price is displayed
    await expect(page.getByText('R$ 50.99')).toBeVisible();
  });

  test('TS02/TS03 deve permitir adicionar ao carrinho e atualizar badge', async ({ page, waitForPageLoad }) => {
    const productDetailsPage = new ProductDetailsPage(page);
    const navComponent = new NavComponent(page);
    await productDetailsPage.goToProduct(1);

    // Open MUI quantity dropdown using ARIA attributes for resilience
    await page.locator('[role="combobox"][aria-labelledby="qty-label"]').click();

    // Select quantity option "2" from the dropdown
    await page.locator('[role="option"]').filter({ hasText: '2' }).click();

    // Add product to cart
    await productDetailsPage.clickAddToCart();

    // Verify cart badge shows correct quantity
    await expect(page.locator(navComponent.cartBadge)).toContainText('2');
  });

  test('TS04 deve tratar ID inválido', async ({ page }) => {
    // Navigate to non-existent product
    await page.goto('/product/99999');
    // Verify error message is displayed
    await expect(page.getByText(/Produto não encontrado|Product not found/i)).toBeVisible();
  });

  test('TS05 deve voltar para catálogo', async ({ page, waitForPageLoad }) => {
    const productDetailsPage = new ProductDetailsPage(page);
    await productDetailsPage.goToProduct(1);

    // Click back button to return to catalog
    await page.getByRole('button', { name: /Voltar|Back/i }).first().click();
    // Verify redirected to home/catalog
    await expect(page).toHaveURL('/');
  });
});
