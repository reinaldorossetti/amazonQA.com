package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CatalogPageElements extends BasePage {

  protected static final By CATALOG_HEADER = By.id("catalog-header-wrapper");
  protected static final By CATALOG_EMPTY = By.id("catalog-empty-wrapper");
  protected static final By ADD_TO_CART_BUTTONS =
      By.xpath("//button[contains(normalize-space(.), 'Adicionar ao Carrinho') or contains(normalize-space(.), 'Add to Cart')]");

  protected CatalogPageElements(WebDriver driver) {
    super(driver);
  }

  protected static By productImageWrapper(int productId) {
    return By.id("product-card-image-wrapper-" + productId);
  }

  protected static By categoryChip(String category) {
    return By.xpath(
        "//*[@role='button' and normalize-space(.)='"
            + category
            + "'] | //div[contains(@class, 'MuiChip-root') and normalize-space(.)='"
            + category
            + "']");
  }
}
