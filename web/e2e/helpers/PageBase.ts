import { Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

type PageName = 'catalog' | 'productDetails' | 'cart' | 'login' | 'register' | 'thankYou';


const readinessSelectorByPage: Record<PageName, string[]> = {
  catalog: ['#catalog-header-wrapper'],
  productDetails: ['#product-details-actions-wrapper'],
  cart: ['#cart-content-wrapper', 'text=Seu carrinho está vazio', 'text=Your cart is empty'],
  login: ['#login-form-body'],
  register: ['#register-form-body'],
  thankYou: ['#thank-you-summary-wrapper', 'text=Obrigado pela sua compra!', 'text=Thank you for your purchase!'],
};

export async function waitForPageLoad(page: Page, pageName: PageName): Promise<void> {
  const selectors = readinessSelectorByPage[pageName];

  let lastError: unknown;
  for (const selector of selectors) {
    try {
      await page.locator(selector).first().waitFor({ state: 'visible', timeout: 30_000 });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

export class PageBase {
  generateUserData() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Aa1@',
    };
  }
  protected page: Page;
  timeOut = 20_000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Generate invalid email (no @ symbol)
   */
  generateInvalidEmail() {
    return faker.lorem.word() + faker.lorem.word() + '.com';
  }

  /**
   * Generate password shorter than 8 chars (fails local validation)
   */
  generateShortPassword() {
    return faker.string.alphanumeric(5);
  }

  /**
   * Generate different password for mismatch test
   */
  generateDifferentPassword() {
    return faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Bb2@';
  }

  /**
   * Gera um CPF válido com dígitos verificadores corretos
   */
  generateValidCPF(): string {
    const randomNumbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

    // Calcula primeiro dígito verificador
    let sum = randomNumbers.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
    let firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    // Calcula segundo dígito verificador
    const numbersWithFirst = [...randomNumbers, firstDigit];
    sum = numbersWithFirst.reduce((acc, digit, i) => acc + digit * (11 - i), 0);
    let secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    const cpfArray = [...randomNumbers, firstDigit, secondDigit];
    return `${cpfArray.slice(0, 3).join('')}.${cpfArray.slice(3, 6).join('')}.${cpfArray.slice(6, 9).join('')}-${cpfArray.slice(9).join('')}`;
  }

  /**
   * Navega para uma URL
   */
  async goto(url: string) {
    await this.page.goto(url);
  }

  /**
   * Preenche um campo de texto
   */
  async fill(selector: string, text: string) {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: this.timeOut });
    await this.page.click(selector);
    await this.page.fill(selector, text);
  }

  /**
   * Clica em um elemento
   */
  async click(selector: string) {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: this.timeOut });
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.locator(selector).first().focus();
    await this.page.click(selector);
  }

  /**
   * Aguarda para que a página carregue completamente
   */
  async waitForLoad(context: string) {
    // Aguarda elementos específicos de contexto
    const selectors: { [key: string]: string } = {
      register: '#register-first-name',
      catalog: '.product-card',
      cart: '.cart-item',
      checkout: '#checkout-button',
    };

    const selector = selectors[context];
    if (selector) {
      await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: this.timeOut });
    }
  }

}
