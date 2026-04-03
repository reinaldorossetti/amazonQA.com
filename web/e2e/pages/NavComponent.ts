import { Page } from '@playwright/test';
import { PageBase } from '../helpers/PageBase';

export class NavComponent extends PageBase {
  readonly cartButton = '#nav-cart-btn';
  readonly cartBadge = '#nav-cart-count-badge';
  readonly languageToggle = '#nav-language-toggle';
  readonly userGreeting = '#nav-user-greeting';
  readonly logoutButton = '#nav-logout-btn';
  readonly searchInput = '#nav-search-input';
  
  constructor(page: Page) {
    super(page);
  }

  async clickCartButton() {
    await this.click(this.cartButton);
  }

  async clickLanguageToggle() {
    await this.click(this.languageToggle);
  }

  async clickLogout() {
    await this.click(this.logoutButton);
  }

  async search(term: string) {
    await this.fill(this.searchInput, term);
    await this.page.keyboard.press('Enter');
  }
}
