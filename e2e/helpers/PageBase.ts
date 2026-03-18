import { Page } from '@playwright/test';

export class PageBase {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
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
    await this.page.fill(selector, text);
  }

  /**
   * Clica em um elemento
   */
  async click(selector: string) {
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
      await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: 10_000 });
    }
  }
}
