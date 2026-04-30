const BasePage = require('./BasePage');

class CartPage {
  async expectHasItems() {
    await BasePage.waitForText('Fechar pedido');
    await expect(element(by.text('Fechar pedido'))).toBeVisible();
  }

  async goToCheckout() {
    await BasePage.waitForText('Fechar pedido');
    await element(by.text('Fechar pedido')).tap();
  }
}

module.exports = new CartPage();
