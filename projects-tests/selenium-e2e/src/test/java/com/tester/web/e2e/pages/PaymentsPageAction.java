package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.WebDriver;

import com.tester.web.e2e.support.CardBrand;

public class PaymentsPageAction extends PaymentsPageElements {

  public PaymentsPageAction(WebDriver driver) {
    super(driver);
  }

  public void whenFillCardNumber(String cardNumber) {
    fill(CARD_NUMBER_INPUT, cardNumber);
  }

  public void whenClearCardNumber() {
    clearField(CARD_NUMBER_INPUT);
  }

  public void whenFillCreditCardDefaults() {
    whenFillCardNumber(CardBrand.VISA.cardNumber());
    setInputValueWithJs(CARD_HOLDER_INPUT, "João da Silva");
    setInputValueWithJs(CARD_EXPIRY_INPUT, "1229");
    setInputValueWithJs(CARD_CVV_INPUT, "123");
    setInputValueWithJs(CARD_INSTALLMENTS_INPUT, "2");
  }

  public void thenValidatedBrandsStripHidden() {
    assertTrue(driver.findElements(BRANDS_STRIP).isEmpty());
  }

  public void thenValidatedBrandsStripVisible() {
    assertTrue(isVisible(BRANDS_STRIP));
  }

  public void thenValidatedBrandVisible(CardBrand brand) {
    assertTrue(isVisible(brandChip(brand.id())));
  }

  public void thenValidatedBrandActive(CardBrand brand) {
    assertTrue(isVisible(brandChipActive(brand.id())));
  }

  public void thenValidatedAllBrandsVisible() {
    for (CardBrand brand : CardBrand.values()) {
      thenValidatedBrandVisible(brand);
    }
  }

  public void attachPreConfirmationScreenshot(CardBrand brand) {
    attachScreenshot("payments-card-data-before-confirmation-" + brand.id());
  }
}
