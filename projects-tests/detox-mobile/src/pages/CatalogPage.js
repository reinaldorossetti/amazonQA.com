const BasePage = require('./BasePage');

class CatalogPage {
  async expectHeader() {
    await BasePage.waitForId('amazon_header_logo');
  }

  async assertCartBadgeNotExist() {
    // Verifica que o badge não exista quando carrinho está vazio
    await expect(element(by.id('cart_badge_count'))).toNotExist();
  }

  async addFirstProductToCart() {
    // Assume que o botão tem o texto "Adicionar ao carrinho"
    await BasePage.waitForText('Adicionar ao carrinho', 10000);
    await element(by.text('Adicionar ao carrinho')).atIndex(0).tap();
  }

  async openCart() {
    await BasePage.waitForId('cart_icon_button');
    await element(by.id('cart_icon_button')).tap();
  }
}

module.exports = new CatalogPage();
