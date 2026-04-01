import { Page } from '@playwright/test';
import { PageBase } from '../helpers/PageBase';

export class PaymentsPage extends PageBase {
  readonly cardNumberInput = '#payments-card-number-input';
  readonly holderNameInput = '#payments-card-holder-input';
  readonly expiryInput = '#payments-card-expiry-input';
  readonly cvvInput = '#payments-card-cvv-input';
  readonly installmentsInput = '#payments-card-installments-input';
  readonly payNowButton = 'button:has-text("Pagar agora"), button:has-text("Pay now")';
  readonly brandsStrip = '#payments-card-brands-strip';

  constructor(page: Page) {
    super(page);
  }

  getBrandCardLocator(brandId: string) {
    return this.page.locator(`#payments-card-brand-${brandId}`);
  }

  async fillCardNumber(cardNumber: string) {
    await this.fill(this.cardNumberInput, cardNumber);
  }

  async fillCardHolderName(holderName: string) {
    await this.fill(this.holderNameInput, holderName);
  }

  async fillExpiry(expiry: string) {
    await this.fill(this.expiryInput, expiry);
  }

  async fillCvv(cvv: string) {
    await this.fill(this.cvvInput, cvv);
  }

  async fillInstallments(installments: string) {
    await this.fill(this.installmentsInput, installments);
  }

  async takePreConfirmationScreenshot(path: string) {
    await this.page.screenshot({ path, fullPage: true });
  }

  async clearCardNumber() {
    await this.page.locator(this.cardNumberInput).clear();
  }
}
