import { Page } from '@playwright/test';
import { PageBase, waitForPageLoad } from '../helpers/PageBase';

export class CatalogPage extends PageBase {
  readonly header = '#catalog-header-wrapper';
  readonly filters = '#catalog-search-filters-wrapper';
  readonly emptyState = '#catalog-empty-wrapper';
  readonly loading = '#catalog-loading-wrapper';
  
  constructor(page: Page) {
    super(page);
  }

  async goToCatalog() {
    await this.goto('/');
    await waitForPageLoad(this.page, 'catalog');
  }

  getProductImageSelector(id: number) {
    return `#product-card-image-wrapper-${id}`;
  }

  async clickProductImage(id: number) {
    await this.click(this.getProductImageSelector(id));
  }

  getAddToCartButtonLocator() {
    return this.page.getByRole('button', { name: /Adicionar ao Carrinho|Add to Cart/i });
  }

  async clickAddToCartFirstProduct() {
    await this.getAddToCartButtonLocator().first().click();
  }
}
