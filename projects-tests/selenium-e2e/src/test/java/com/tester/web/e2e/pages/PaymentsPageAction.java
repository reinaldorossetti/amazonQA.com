package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.tester.web.e2e.support.CardBrand;

public class PaymentsPageAction extends PaymentsPageElements {

  public PaymentsPageAction(WebDriver driver) {
    super(driver);
  }

  public void whenFillCardNumber(String cardNumber) {
    setInputValue(CARD_NUMBER_INPUT, cardNumber);
  }

  public void whenClearCardNumber() {
    setInputValue(CARD_NUMBER_INPUT, "");
  }

  public void whenFillCreditCardDefaults() {
    whenFillCardNumber(CardBrand.VISA.cardNumber());
    setInputValue(CARD_HOLDER_INPUT, "João da Silva");
    setInputValue(CARD_EXPIRY_INPUT, "1229");
    setInputValue(CARD_CVV_INPUT, "123");
    setInputValue(CARD_INSTALLMENTS_INPUT, "2");
  }

  public void assertBrandsStripHidden() {
    assertTrue(driver.findElements(BRANDS_STRIP).isEmpty());
  }

  public void assertBrandsStripVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(BRANDS_STRIP)).isDisplayed());
  }

  public void assertBrandVisible(CardBrand brand) {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(brandChip(brand.id()))).isDisplayed());
  }

  public void assertBrandActive(CardBrand brand) {
    WebElement chip = wait.until(ExpectedConditions.visibilityOfElementLocated(brandChip(brand.id())));
    assertEquals("true", chip.getDomAttribute("data-active"));
  }

  public void assertAllBrandsVisible() {
    for (CardBrand brand : CardBrand.values()) {
      assertBrandVisible(brand);
    }
  }

  public void attachPreConfirmationScreenshot(CardBrand brand) {
    attachScreenshot("payments-card-data-before-confirmation-" + brand.id());
  }

  private void setInputValue(org.openqa.selenium.By locator, String value) {
    WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    moveFocusToElement(input);
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "const input = arguments[0];"
              + "const value = arguments[1];"
              + "const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;"
              + "setter.call(input, value);"
              + "input.dispatchEvent(new Event('input', { bubbles: true }));",
          input,
          value);
    } else {
      fill(input, value);
    }
  }
}
