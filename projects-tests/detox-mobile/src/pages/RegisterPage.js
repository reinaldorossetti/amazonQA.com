const BasePage = require('./BasePage');

class RegisterPage {
  async expectRegisterScreen() {
    // Valida alguns campos básicos do formulário de cadastro
    await BasePage.waitForText('Nome *');
    await expect(element(by.text('CPF *'))).toBeVisible();
  }

  async fillStep1({ firstname, lastname, cpf, email, phone, password }) {
    // Espera o primeiro campo do passo estar visível e depois preenche os demais
    await BasePage.waitForId('register_firstname_field');
    if (firstname) await element(by.id('register_firstname_field')).replaceText(firstname);
    if (lastname) { await BasePage.waitForId('register_lastname_field'); await element(by.id('register_lastname_field')).replaceText(lastname); }
    if (cpf) { await BasePage.waitForId('register_cpf_field'); await element(by.id('register_cpf_field')).replaceText(cpf); }
    if (email) { await BasePage.waitForId('register_email_field'); await element(by.id('register_email_field')).replaceText(email); }
    if (phone) { await BasePage.waitForId('register_phone_field'); await element(by.id('register_phone_field')).replaceText(phone); }
    if (password) { await BasePage.waitForId('register_password_field'); await element(by.id('register_password_field')).replaceText(password); }
    if (password) { await BasePage.waitForId('register_confirm_password_field'); await element(by.id('register_confirm_password_field')).replaceText(password); }
  }

  async goToNextStep() {
    await BasePage.waitForId('register_submit_button');
    await element(by.id('register_submit_button')).tap();
  }

  async fillAddress({ cep, number }) {
    await BasePage.waitForId('register_cep_field');
    if (cep) await element(by.id('register_cep_field')).replaceText(cep);
    if (number) { await BasePage.waitForId('register_number_field'); await element(by.id('register_number_field')).replaceText(number); }
  }

  async submit() {
    await BasePage.waitForId('register_submit_button');
    await element(by.id('register_submit_button')).tap();
  }
}

module.exports = new RegisterPage();
