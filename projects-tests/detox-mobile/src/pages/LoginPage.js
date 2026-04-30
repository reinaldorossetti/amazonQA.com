const BasePage = require('./BasePage');

class LoginPage {
  async expectLoginScreen() {
    await BasePage.waitForId('login_email_field');
    await BasePage.waitForId('login_password_field');
  }

  async enterEmail(email) {
    await BasePage.waitForId('login_email_field');
    await element(by.id('login_email_field')).tap();
    await element(by.id('login_email_field')).replaceText(email);
  }

  async enterPassword(password) {
    await BasePage.waitForId('login_password_field');
    await element(by.id('login_password_field')).replaceText(password);
  }

  async tapContinue() {
    await BasePage.waitForText('Continuar');
    await element(by.text('Continuar')).tap();
  }

  async tapSkip() {
    await BasePage.waitForText('Entrar como visitante');
    await element(by.text('Entrar como visitante')).tap();
  }

  async tapRegister() {
    await BasePage.waitForText('Não tem conta? Comece aqui.');
    await element(by.text('Não tem conta? Comece aqui.')).tap();
  }

  async performLogin(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapContinue();
    // aguarda navegar ao catálogo
    await BasePage.waitForId('amazon_header_logo', 15000);
  }
}

module.exports = new LoginPage();
