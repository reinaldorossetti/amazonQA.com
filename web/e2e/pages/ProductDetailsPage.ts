import { Page } from '@playwright/test';
import { PageBase, waitForPageLoad } from '../helpers/PageBase';

export class ProductDetailsPage extends PageBase {
  readonly image = '#product-details-image';
  readonly actionsWrapper = '#product-details-actions-wrapper';
  
  constructor(page: Page) {
    super(page);
  }

  async goToProduct(productId: number) {
    await this.goto(`/product/${productId}`);
    await waitForPageLoad(this.page, 'productDetails');
  }

  getAddToCartButtonLocator() {
    return this.page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i });
  }

  async clickAddToCart() {
    await this.getAddToCartButtonLocator().click();
  }
}
