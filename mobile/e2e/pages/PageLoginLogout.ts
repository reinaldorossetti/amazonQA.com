const { TIMEOUTS } = require('./global.page');

class PageLoginLogout {
  loginEmailInput = 'login-email-input';
  loginPasswordInput = 'login-password-input';
  loginSubmitButton = 'login-submit-button';
  loginErrorMessage = 'login-error-message';
  homeScreen = 'home-screen';

  byId(testId: string) {
    return element(by.id(testId));
  }

  async waitVisible(testId: string, timeout: number = TIMEOUTS.default) {
    await waitFor(this.byId(testId)).toBeVisible().withTimeout(timeout);
  }

  async clearText(testId: string) {
    await this.byId(testId).clearText();
  }

  async typeText(testId: string, value: string) {
    await this.byId(testId).typeText(value);
  }

  async tap(testId: string) {
    await this.byId(testId).tap();
  }

  async fillInput(testId: string, value: string) {
    await this.clearText(testId);
    await this.typeText(testId, `${value}\n`);
  }

  async loginWithCredentials(email: string, password: string) {
    await this.waitVisible(this.loginEmailInput);
    await this.fillInput(this.loginEmailInput, email);
    await this.fillInput(this.loginPasswordInput, password);
    await device.pressBack();
    await this.tap(this.loginSubmitButton);
    await this.waitVisible(this.homeScreen, TIMEOUTS.extraLong);
  }
}

module.exports = { PageLoginLogout };
