package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class PaymentsPageElements extends BasePage {

  protected static final By CARD_NUMBER_INPUT = By.id("payments-card-number-input");
  protected static final By CARD_HOLDER_INPUT = By.id("payments-card-holder-input");
  protected static final By CARD_EXPIRY_INPUT = By.id("payments-card-expiry-input");
  protected static final By CARD_CVV_INPUT = By.id("payments-card-cvv-input");
  protected static final By CARD_INSTALLMENTS_INPUT = By.id("payments-card-installments-input");
  protected static final By BRANDS_STRIP = By.id("payments-card-brands-strip");

  protected PaymentsPageElements(WebDriver driver) {
    super(driver);
  }

  /** Chip rendered in the accepted-brands strip (any active state). */
  protected static By brandChip(String brandId) {
    return By.id("payments-card-brand-" + brandId);
  }

  /** Chip highlighted for the detected BIN ({@code data-active="true"}). */
  protected static By brandChipActive(String brandId) {
    return By.cssSelector(String.format("div[data-brand=\"%s\"][data-active=\"true\"]", brandId));
  }
}
