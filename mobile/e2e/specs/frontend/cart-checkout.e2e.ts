const { TIMEOUTS, hasValidCredentials, getLoginCredentials } = require('../../pages/global.page');
const { PageCart } = require('../../pages/PageCart');
const { PageLoginLogout } = require('../../pages/PageLoginLogout');

describe('Frontend parity - Cart and Checkout', () => {
  const credentials = getLoginCredentials();
  const pageCart = new PageCart();
  const pageLoginLogout = new PageLoginLogout();

  async function loginWithValidCredentials() {
    await pageLoginLogout.loginWithCredentials(credentials.email, credentials.password);
  }

    async function clearCartIfNeeded() {
    await pageCart.clearCartIfNeeded();
  }

  it('TS01 authenticated user should complete checkout and navigate to thank-you page', async () => {
    await device.launchApp({ newInstance: true });
    await loginWithValidCredentials();
    await pageCart.addItem1();
    await pageCart.goToCartTab();
    await pageCart.waitVisible(pageCart.cartCheckoutButton, TIMEOUTS.default);
    await pageCart.tap(pageCart.cartCheckoutButton);
    await pageCart.waitVisible(pageCart.checkoutSubmitButton, TIMEOUTS.default);
    await pageCart.tap(pageCart.checkoutSubmitButton);
    await pageCart.waitVisible(pageCart.paymentsConfirmButton, TIMEOUTS.default);
    await pageCart.tap(pageCart.paymentsConfirmButton);
    await pageCart.waitVisible(pageCart.thankYouTitle, TIMEOUTS.extraLong);
  });

  it('TS02 non-authenticated user should be redirected to login with next parameter', async () => {
    await device.launchApp({ newInstance: true, delete: true });
    await pageLoginLogout.waitVisible(pageLoginLogout.loginEmailInput, TIMEOUTS.default);
    await expect(pageLoginLogout.byId(pageLoginLogout.loginSubmitButton)).toBeVisible();
  });

  it('TS03 empty cart should keep checkout unavailable', async () => {
    await device.launchApp({ newInstance: true });
    await loginWithValidCredentials();
    await pageCart.goToCartTab();
    await clearCartIfNeeded();

    await pageCart.waitVisible(pageCart.cartEmptyState, TIMEOUTS.default);
    await expect(pageCart.byId(pageCart.cartEmptyText)).toBeVisible();
  });

  it.todo('TS04 should update quantity, total and badge for a valid positive value');
  it.todo('TS05 should keep previous quantity when value is zero');
  it.todo('TS06 should keep previous quantity when value is negative');
  it.todo('TS07 should handle larger valid quantity values correctly');
  it.todo('TS08 should normalize decimal input to integer quantity');

  it('TS09 should remove a single item and show empty cart state', async () => {
    await device.launchApp({ newInstance: true });
    await loginWithValidCredentials();

    await pageCart.addItem1();

    await pageCart.goToCartTab();
    await pageCart.waitVisible(pageCart.cartItemDelete1, TIMEOUTS.default);
    await pageCart.tap(pageCart.cartItemDelete1);
    await pageCart.waitVisible(pageCart.cartEmptyState, TIMEOUTS.default);
  });

  it('TS10 should add three items, remove all of them, and validate empty cart', async () => {
    await device.launchApp({ newInstance: true });
    await loginWithValidCredentials();
    await pageCart.addItems123();
    await pageCart.goToCartTab();
    await clearCartIfNeeded();
    await pageCart.waitVisible(pageCart.cartEmptyState, TIMEOUTS.default);
  });

  it.todo('TS11 should clear cart after successful checkout when leaving thank-you page');
  it.todo('TS12 should decrement cart badge after each item removal');
});
