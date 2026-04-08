import { Page } from '@playwright/test';
import { PageBase } from '../helpers/PageBase';

export class NavComponent extends PageBase {
  readonly cartButton = 'nav-cart-btn';
  readonly cartBadge = 'nav-cart-count-badge';
  readonly languageToggle = 'nav-language-toggle';
  readonly userGreeting = 'nav-user-greeting';
  readonly logoutButton = 'nav-logout-btn';
  readonly searchInput = 'nav-search-input';
  
  constructor(page: Page) {
    super(page);
  }

  getCartButtonLocator() {
    return this.page.getByTestId('nav-cart-btn');
  }

  getCartBadgeLocator() {
    return this.page.getByTestId('nav-cart-count-badge');
  }

  getLanguageToggleLocator() {
    return this.page.getByTestId('nav-language-toggle');
  }

  getLogoutLocator() {
    return this.page.getByTestId('nav-logout-btn');
  }

  getSearchInputLocator() {
    return this.page.getByTestId('nav-search-input');
  }

  getUserGreetingLocator() {
    return this.page.getByTestId('nav-user-greeting');
  }

  async clickCartButton() {
    await this.getCartButtonLocator().click();
  }

  async clickLanguageToggle() {
    await this.getLanguageToggleLocator().click();
  }

  async clickLogout() {
    await this.getLogoutLocator().click();
  }

  async search(term: string) {
    await this.getSearchInputLocator().fill(term);
    await this.page.keyboard.press('Enter');
  }
}
