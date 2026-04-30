const BasePage = require('./BasePage');

class CheckoutPage {
  async expectCheckoutElements() {
    await BasePage.waitForText('Pagamento');
    await BasePage.waitForText('PIX');
    await BasePage.waitForText('Cartão de Crédito');
    await BasePage.waitForText('Confirmar e Pagar');
    await expect(element(by.text('Pagamento'))).toBeVisible();
    await expect(element(by.text('PIX'))).toBeVisible();
    await expect(element(by.text('Cartão de Crédito'))).toBeVisible();
    await expect(element(by.text('Confirmar e Pagar'))).toBeVisible();
  }

  async confirmPayment() {
    await BasePage.waitForText('Confirmar e Pagar');
    await element(by.text('Confirmar e Pagar')).tap();
  }
}

module.exports = new CheckoutPage();
