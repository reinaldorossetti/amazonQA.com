const { TIMEOUTS } = require('./global.page');

class PageCart {
  cartTabButton = 'tab-cart-button';
  addToCartButton1 = 'add-to-cart-button-1';
  addToCartButton2 = 'add-to-cart-button-2';
  addToCartButton3 = 'add-to-cart-button-3';
  cartCheckoutButton = 'cart-checkout-button';
  checkoutSubmitButton = 'checkout-submit-button';
  paymentsConfirmButton = 'payments-confirm-button';
  thankYouTitle = 'thank-you-title';
  cartEmptyState = 'cart-empty-state';
  cartEmptyText = 'cart-empty-text';
  cartItemDelete1 = 'cart-item-delete-1';
  cartItemDelete2 = 'cart-item-delete-2';
  cartItemDelete3 = 'cart-item-delete-3';

  byId(testId: string) {
    return element(by.id(testId));
  }

  async waitVisible(testId: string, timeout: number = TIMEOUTS.default) {
    await waitFor(this.byId(testId)).toBeVisible().withTimeout(timeout);
  }

  async tap(testId: string) {
    await this.byId(testId).tap();
  }

  async goToCartTab() {
    await this.waitVisible(this.cartTabButton);
    await this.tap(this.cartTabButton);
  }

  async addItem1() {
    await this.waitVisible(this.addToCartButton1);
    await this.tap(this.addToCartButton1);
  }

  async addItems123() {
    await this.waitVisible(this.addToCartButton1);
    await this.tap(this.addToCartButton1);
    await this.tap(this.addToCartButton2);
    await this.tap(this.addToCartButton3);
  }

  async clearCartIfNeeded(maxAttempts: number = 8) {
    const deleteButtons = [this.cartItemDelete1, this.cartItemDelete2, this.cartItemDelete3];

    for (let i = 0; i < maxAttempts; i += 1) {
      let removed = false;

      for (const buttonId of deleteButtons) {
        try {
          await this.tap(buttonId);
          removed = true;
          break;
        } catch (_err) {
          // tenta o próximo botão
        }
      }

      if (!removed) {
        break;
      }
    }
  }
}

module.exports = { PageCart };
