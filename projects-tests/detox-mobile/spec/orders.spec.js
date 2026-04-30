const { device, expect, element, by } = require('detox');
const LoginPage = require('../src/pages/LoginPage');
const CatalogPage = require('../src/pages/CatalogPage');
const CartPage = require('../src/pages/CartPage');
const CheckoutPage = require('../src/pages/CheckoutPage');

describe('Orders / Checkout (Detox)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('Add product to cart and show cart screen', async () => {
    await LoginPage.tapSkip();
    await CatalogPage.addFirstProductToCart();
    await CatalogPage.openCart();
    await CartPage.expectHasItems();
  });

  it('Checkout screen shows payment options and requires login to confirm', async () => {
    // Partimos do carrinho com itens (assume teste anterior ou setup equivalente)
    await LoginPage.tapSkip();
    await CatalogPage.addFirstProductToCart();
    await CatalogPage.openCart();

    await CartPage.goToCheckout();
    await CheckoutPage.expectCheckoutElements();

    // Tenta confirmar sem estar logado — espera erro de login
    await CheckoutPage.confirmPayment();
    await expect(element(by.id('login_error_message'))).toBeVisible();
  });
});
