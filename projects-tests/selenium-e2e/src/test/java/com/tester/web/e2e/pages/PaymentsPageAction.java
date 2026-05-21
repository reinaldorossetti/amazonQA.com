package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.tester.web.e2e.support.CardBrand;

public class PaymentsPageAction extends PaymentsPageElements {

  public PaymentsPageAction(WebDriver driver) {
    super(driver);
  }

  public void whenFillCardNumber(String cardNumber) {
    setInputValueWithJs(CARD_NUMBER_INPUT, cardNumber);
  }

  public void whenClearCardNumber() {
    setInputValueWithJs(CARD_NUMBER_INPUT, "");
  }

  public void whenFillCreditCardDefaults() {
    whenFillCardNumber(CardBrand.VISA.cardNumber());
    setInputValueWithJs(CARD_HOLDER_INPUT, "João da Silva");
    setInputValueWithJs(CARD_EXPIRY_INPUT, "1229");
    setInputValueWithJs(CARD_CVV_INPUT, "123");
    setInputValueWithJs(CARD_INSTALLMENTS_INPUT, "2");
  }

  public void assertBrandsStripHidden() {
    assertTrue(driver.findElements(BRANDS_STRIP).isEmpty());
  }

  public void assertBrandsStripVisible() {
    assertTrue(isVisible(BRANDS_STRIP));
  }

  public void assertBrandVisible(CardBrand brand) {
    assertTrue(isVisible(brandChip(brand.id())));
  }

  public void assertBrandActive(CardBrand brand) {
    assertEquals(
        "true",
        wait.until(ExpectedConditions.visibilityOfElementLocated(brandChip(brand.id())))
            .getDomAttribute("data-active"));
  }

  public void assertAllBrandsVisible() {
    for (CardBrand brand : CardBrand.values()) {
      assertBrandVisible(brand);
    }
  }

  public void attachPreConfirmationScreenshot(CardBrand brand) {
    attachScreenshot("payments-card-data-before-confirmation-" + brand.id());
  }
}
