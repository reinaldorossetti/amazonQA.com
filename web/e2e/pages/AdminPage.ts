import { Page } from '@playwright/test';
import { PageBase } from '../helpers/PageBase';

export class AdminPage extends PageBase {
  readonly adminHomeWrapper = '#admin-home-wrapper';
  readonly adminProductsWrapper = '#admin-products-wrapper';
  readonly adminUsersWrapper = '#admin-users-wrapper';
  readonly userGreeting = '#nav-user-greeting';
  readonly accountMenuAdminProducts = '#account-menu-minha-conta-admin-produtos';
  readonly accountMenuAdminUsers = '#account-menu-minha-conta-admin-usuarios';

  constructor(page: Page) {
    super(page);
  }

  private async bootstrapAuthenticatedSession() {
    await this.goto('/');
    await this.page.locator(this.userGreeting).waitFor({ state: 'visible', timeout: this.timeOut });
    await this.page.locator(this.userGreeting).click();
  }

  async goToAdminProducts() {
    await this.bootstrapAuthenticatedSession();
    await this.page.locator(this.accountMenuAdminProducts).waitFor({ state: 'visible', timeout: this.timeOut });
    await this.page.locator(this.accountMenuAdminProducts).click();
    await this.page.locator(this.adminProductsWrapper).waitFor({ state: 'visible', timeout: this.timeOut });
  }

  async goToAdminUsers() {
    await this.bootstrapAuthenticatedSession();
    await this.page.locator(this.accountMenuAdminUsers).waitFor({ state: 'visible', timeout: this.timeOut });
    await this.page.locator(this.accountMenuAdminUsers).click();
    await this.page.locator(this.adminUsersWrapper).waitFor({ state: 'visible', timeout: this.timeOut });
  }

  getDeleteProductButtonById(id: number) {
    return this.page.locator(`#admin-products-delete-${id}`);
  }

  getDeleteUserButtonById(id: number) {
    return this.page.locator(`#admin-users-delete-${id}`);
  }
}
