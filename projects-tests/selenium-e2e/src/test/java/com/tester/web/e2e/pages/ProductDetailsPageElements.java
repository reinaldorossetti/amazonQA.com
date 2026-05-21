package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class ProductDetailsPageElements extends BasePage {

  protected static final By PRODUCT_IMAGE = By.id("product-details-image");
  protected static final By ACTIONS_WRAPPER = By.id("product-details-actions-wrapper");
  protected static final By QUANTITY_COMBOBOX =
      By.cssSelector("[role='combobox'][aria-labelledby='qty-label']");
  protected static final By ADD_TO_CART_BUTTON =
      By.xpath("//button[contains(normalize-space(.), 'Adicionar ao Carrinho') or contains(normalize-space(.), 'Add to Cart')]");
  protected static final By BACK_BUTTON =
      By.xpath("//button[contains(normalize-space(.), 'Voltar') or contains(normalize-space(.), 'Back')]");

  protected ProductDetailsPageElements(WebDriver driver) {
    super(driver);
  }

  protected static By quantityOption(String quantity) {
    return By.xpath("//li[@role='option' and normalize-space(.)='" + quantity + "']");
  }

  protected static By productHeading(String productName) {
    return By.xpath(
        "//h1[contains(normalize-space(.), '"
            + productName
            + "')] | //h2[contains(normalize-space(.), '"
            + productName
            + "')] | //*[self::h1 or self::h2][contains(normalize-space(.), '"
            + productName
            + "')]");
  }
}
