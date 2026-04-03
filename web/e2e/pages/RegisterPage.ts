import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';
import { PageBase } from '../helpers/PageBase';

export class RegisterPage extends PageBase {
  readonly body = '#register-form-body';
  readonly firstNameInput = '#register-first-name';
  readonly lastNameInput = '#register-last-name';
  readonly cpfInput = '#register-cpf';
  readonly emailInput = '#register-email';
  readonly phoneInput = '#register-phone';
  readonly passwordInput = '#register-password';
  readonly confirmPasswordInput = '#register-confirm-password';
  readonly nextButton = '#register-next-btn';
  readonly submitButton = '#register-submit-btn';
  readonly errorAlert = '#register-error-alert';
  readonly errorFirstName = '#register-first-name-helper-text';
  readonly errorLastName = '#register-last-name-helper-text';
  readonly errorCpf = '#register-cpf-helper-text';
  readonly errorEmail = '#register-email-helper-text';
  readonly errorPhone = '#register-phone-helper-text';
  readonly errorPassword = '#register-password-helper-text';
  readonly errorConfirmPassword = '#register-confirm-password-helper-text';
  readonly zipCodeInput = '#register-address-zip';
  readonly streetInput = '#register-address-street';
  readonly numberInput = '#register-address-number';
  readonly successMessageLocator = 'text=/sucesso|bem-vindo|cadastro realizado/i';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Preenche o formulário de registro com dados dinâmicos
   */
  async fillRegistrationForm() {
    const firstName = faker.person.firstName('female');
    const lastName = faker.person.lastName();
    const dynamicCPF = this.generateValidCPF();
    const dynamicEmail = faker.internet.email();
    const phone = `(${faker.number.int({ min: 11, max: 99 })}) ${faker.number.int({ min: 90000, max: 99999 })}-${faker.number.int({ min: 1000, max: 9999 })}`;
    const password = 'Senha@1234';

    return {
      firstName,
      lastName,
      cpf: dynamicCPF,
      email: dynamicEmail,
      phone,
      password,
      confirmPassword: password,
    };
  }

  /**
   * Preenche o primeiro passo do registro (dados pessoais)
   */
  async fillPersonalData(userData: any) {
    await this.fill(this.firstNameInput, userData.firstName);
    await this.fill(this.lastNameInput, userData.lastName);
    await this.fill(this.cpfInput, userData.cpf);
    await this.fill(this.emailInput, userData.email);
    await this.fill(this.phoneInput, userData.phone);
    await this.fill(this.passwordInput, userData.password);
    await this.fill(this.confirmPasswordInput, userData.confirmPassword);
  }

  /**
   * Clica no botão "Próximo"
   */
  async clickNext() {
    await this.click(this.nextButton);
  }

  /**
   * Preenche o endereço
   */
  async fillAddress(zipCode: string = '01001-000', number: string = '100') {
    const addressNumber = number || faker.number.int({ min: 1, max: 9999 }).toString();
    await this.fill(this.zipCodeInput, zipCode);
    await this.fill(this.numberInput, addressNumber);
  }

  /**
   * Clica no botão "Enviar"
   */
  async clickSubmit() {
    await this.click(this.submitButton);
  }

  /**
   * Aguarda uma mensagem de sucesso
   */
  async waitForSuccessMessage(timeout: number = 8_000) {
    await this.page.locator(this.successMessageLocator).waitFor({ state: 'visible', timeout });
  }

  /**
   * Navega para a página de registro
   */
  async goToRegister() {
    await this.goto('/register');
  }
}
