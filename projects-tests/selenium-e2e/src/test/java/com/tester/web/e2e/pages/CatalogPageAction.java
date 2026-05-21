package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.tester.web.e2e.config.TestEnvironment;

public class CatalogPageAction extends CatalogPageElements {

  private final NavBarComponent nav;

  public CatalogPageAction(WebDriver driver) {
    super(driver);
    this.nav = new NavBarComponent(driver);
  }

  public void givenUserOnCatalog() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/");
    wait.until(ExpectedConditions.visibilityOfElementLocated(CATALOG_HEADER));
  }

  public void whenSearchBy(String term) {
    nav.whenSearchBy(term);
    wait.until(
        ExpectedConditions.or(
            ExpectedConditions.visibilityOfElementLocated(CATALOG_EMPTY),
            ExpectedConditions.visibilityOfElementLocated(textContaining(term))));
  }

  public void whenSelectCategory(String category) {
    click(categoryChip(category));
  }

  public void whenClickProductImage(int productId) {
    click(productImageWrapper(productId));
  }

  public void whenAddFirstProductToCart() {
    clickFirst(ADD_TO_CART_BUTTONS);
    waitUntilToastCycleCompletes();
  }

  public void thenValidatedProductImageVisible(int productId) {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(productImageWrapper(productId))).isDisplayed());
  }

  public void thenValidatedProductImageHidden(int productId) {
    assertTrue(driver.findElements(productImageWrapper(productId)).isEmpty());
  }

  public void thenValidatedProductsFoundTextContains(String expected) {
    wait.until(ExpectedConditions.visibilityOfElementLocated(CATALOG_PRODUCTS_FOUND_TEXT));
    ensureTextsVisible(expected);
  }

  public void thenValidatedEmptyStateVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CATALOG_EMPTY)).isDisplayed());
  }

  public void thenValidatedUrlEndsWith(String pathSuffix) {
    wait.until(webDriver -> webDriver.getCurrentUrl().endsWith(pathSuffix));
    assertTrue(driver.getCurrentUrl().endsWith(pathSuffix));
  }

  public void thenValidatedSearchValueEquals(String expected) {
    nav.thenValidatedSearchValueEquals(expected);
  }

  public void thenValidatedCatalogHeadingVisible(String heading) {
    ensureTextsVisible(heading);
  }
}
