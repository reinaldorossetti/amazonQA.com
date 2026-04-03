import { Page } from '@playwright/test';
import { PageBase, waitForPageLoad } from '../helpers/PageBase';

export class LoginPage extends PageBase {
  readonly emailInput = '#login-email';
  readonly passwordInput = '#login-password';
  readonly submitButton = '#login-submit-btn';
  readonly errorAlert = '#login-error-alert';
  readonly createAccountButton = '#login-create-account-btn';
  
  constructor(page: Page) {
    super(page);
  }

  async goToLogin() {
    await this.goto('/login');
    await waitForPageLoad(this.page, 'login');
  }

  async fillEmail(email: string) {
    await this.fill(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.fill(this.passwordInput, password);
  }

  async login(email?: string, password?: string) {
    if (email) await this.fillEmail(email);
    if (password) await this.fillPassword(password);
    await this.submit();
  }

  async submit() {
    await this.click(this.submitButton);
  }

  async clickCreateAccount() {
    await this.click(this.createAccountButton);
  }
}
