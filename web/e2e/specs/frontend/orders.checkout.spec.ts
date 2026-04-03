import { setAuthenticatedUser } from '../../helpers/auth';
import { expect, test } from '../../fixtures/ui.fixture';
import { mockProducts } from '../../data/products.mock';
import { CartPage } from '../../pages/CartPage';
import { CatalogPage } from '../../pages/CatalogPage';
import { NavComponent } from '../../pages/NavComponent';


test.describe('Frontend Checkout with Orders API', () => {
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

  test('deve chamar POST /api/orders e concluir pagamento antes de ir para thank-you', async ({ page, waitForPageLoad }) => {
    const cartPage = new CartPage(page);
    const navComponent = new NavComponent(page);
    const catalogPage = new CatalogPage(page);

    let orderRequests = 0;
    let orderRequestBody: any = null;

    await page.route('**/api/orders', async (route) => {
      orderRequests += 1;
      orderRequestBody = route.request().postDataJSON();

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          order_number: 'ORD-20260327-000001',
          status: 'created',
          subtotal: 50.99,
          shipping_total: 0,
          discount_total: 0,
          grand_total: 50.99,
          items: [
            {
              id: 1,
              order_id: 1,
              product_id: mockProducts[0].id,
              product_name_snapshot: mockProducts[0].name,
              unit_price_snapshot: mockProducts[0].price,
              quantity: 1,
              line_total: mockProducts[0].price,
            },
          ],
        }),
      });
    });

    await page.route('**/api/orders/*/payments', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 11,
          order_id: 1,
          method: 'credit',
          amount: 50.99,
          status: 'authorized',
        }),
      });
    });

    await setAuthenticatedUser(page, {
      id: 700,
      name: 'Order',
      lastName: 'E2E',
      email: 'order.e2e@example.com',
      personType: 'PF',
    });

    await catalogPage.goToCatalog();
    await waitForPageLoad(page, 'catalog');

    await catalogPage.clickAddToCartFirstProduct();
    await navComponent.clickCartButton();
    await waitForPageLoad(page, 'cart');

    await cartPage.clickProceedToCheckout();
    await expect(page).toHaveURL('/payments');

    await page.getByRole('button', { name: /Pagar agora|Pay now/i }).click();

    await expect(page).toHaveURL('/thank-you');
    await waitForPageLoad(page, 'thankYou');

    expect(orderRequests).toBe(1);
    expect(orderRequestBody).toBeTruthy();
    expect(orderRequestBody.shippingTotal).toBe(0);
    expect(orderRequestBody.discountTotal).toBe(0);
  });

  test('deve permanecer no carrinho quando POST /api/orders falhar', async ({ page, waitForPageLoad }) => {
    const cartPage = new CartPage(page);

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Falha ao criar pedido' }),
      });
    });

    await setAuthenticatedUser(page, {
      id: 701,
      name: 'Order',
      lastName: 'Error',
      email: 'order.error@example.com',
      personType: 'PF',
    });

    await cartPage.openCartWithOneItem(waitForPageLoad);
    await cartPage.clickProceedToCheckout();

    await expect(page).toHaveURL('/cart');
    await expect(page.locator('body')).toContainText(/Falha ao criar pedido|Erro ao processar checkout/i);
  });
});
