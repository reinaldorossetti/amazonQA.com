import { Page } from '@playwright/test';
import { PageBase, waitForPageLoad } from '../helpers/PageBase';

export class ThankYouPage extends PageBase {
  readonly summaryWrapper = '#thank-you-summary-wrapper';
  
  constructor(page: Page) {
    super(page);
  }

  async waitForLoad() {
    await waitForPageLoad(this.page, 'thankYou');
  }

  getContinueShoppingButtonLocator() {
    return this.page.getByRole('button', { name: /Continuar Comprando|Continue Shopping/i });
  }

  async clickContinueShopping() {
    await this.getContinueShoppingButtonLocator().click();
  }
}
