import { faker } from '@faker-js/faker';
import { Page } from '@playwright/test';
import { PageBase } from './PageBase';
import { selectors } from '../fixtures/selectors/selectors';

export class RegisterPage extends PageBase {
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
    await this.fill('#register-first-name', userData.firstName);
    await this.fill('#register-last-name', userData.lastName);
    await this.fill('#register-cpf', userData.cpf);
    await this.fill('#register-email', userData.email);
    await this.fill('#register-phone', userData.phone);
    await this.fill('#register-password', userData.password);
    await this.fill('#register-confirm-password', userData.confirmPassword);
  }

  /**
   * Clica no botão "Próximo"
   */
  async clickNext() {
    await this.click(selectors.register.next);
  }

  /**
   * Preenche o endereço
   */
  async fillAddress(zipCode: string = '01001-000', number: string = '100') {
    const addressNumber = number || faker.number.int({ min: 1, max: 9999 }).toString();
    await this.fill('#register-address-zip', zipCode);
    await this.fill('#register-address-number', addressNumber);
  }

  /**
   * Clica no botão "Enviar"
   */
  async clickSubmit() {
    await this.click(selectors.register.submit);
  }

  /**
   * Aguarda uma mensagem de sucesso
   */
  async waitForSuccessMessage(timeout: number = 8_000) {
    await this.page.locator('text=/sucesso|bem-vindo|cadastro realizado/i').waitFor({ state: 'visible', timeout });
  }

  /**
   * Navega para a página de registro
   */
  async goToRegister() {
    await this.goto('/register');
  }
}
