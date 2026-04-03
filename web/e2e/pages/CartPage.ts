import { Page } from '@playwright/test';
import { PageBase, waitForPageLoad } from '../helpers/PageBase';
import { NavComponent } from './NavComponent';
import { CatalogPage } from './CatalogPage';

export class CartPage extends PageBase {
  readonly contentWrapper = '#cart-content-wrapper';
  readonly totalAmount = '#cart-order-total';
  readonly quantityInputProxy = '#cart-item-quantity-wrapper input[type="number"]';
  
  constructor(page: Page) {
    super(page);
  }

  async goToCart() {
    await this.goto('/cart');
  }

  getProceedToCheckoutButtonLocator() {
    return this.page.getByRole('button', { name: /Fechar Pedido|Proceed to Checkout/i });
  }

  getLoginToCheckoutButtonLocator() {
    return this.page.getByRole('button', { name: /Entrar para Finalizar/i });
  }

  async openCartWithOneItem(waitForPageLoad: any) {
    const catalogPage = new CatalogPage(this.page);
    const navComponent = new NavComponent(this.page);

    await catalogPage.goToCatalog();
    await waitForPageLoad(this.page, 'catalog');
    await catalogPage.clickAddToCartFirstProduct();
    await navComponent.clickCartButton();
    await waitForPageLoad(this.page, 'cart');
  };

  getDeleteButtonLocator() {
    return this.page.getByRole('button', { name: /delete/i });
  }

  async clickProceedToCheckout() {
    await this.getProceedToCheckoutButtonLocator().click();
  }

  async clickLoginToCheckout() {
    await this.getLoginToCheckoutButtonLocator().click();
  }
}
