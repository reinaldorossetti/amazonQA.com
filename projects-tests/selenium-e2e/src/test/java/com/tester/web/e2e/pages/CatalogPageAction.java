package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(normalize-space(.), '" + term + "')]"))));
  }

  public void whenSelectCategory(String category) {
    wait.until(ExpectedConditions.elementToBeClickable(categoryChip(category))).click();
  }

  public void whenClickProductImage(int productId) {
    WebElement image =
        wait.until(ExpectedConditions.elementToBeClickable(productImageWrapper(productId)));
    clickElementWithFocus(image);
  }

  public void whenAddFirstProductToCart() {
    clickElementWithFocus(
        wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(ADD_TO_CART_BUTTONS)).getFirst());
  }

  public void assertProductImageVisible(int productId) {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(productImageWrapper(productId))).isDisplayed());
  }

  public void assertProductImageHidden(int productId) {
    assertTrue(driver.findElements(productImageWrapper(productId)).isEmpty());
  }

  public void assertProductsFoundTextContains(String expected) {
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("catalog-products-found-text")));
    assertTextsVisible(expected);
  }

  public void assertEmptyStateVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CATALOG_EMPTY)).isDisplayed());
  }

  public void assertUrlEndsWith(String pathSuffix) {
    wait.until(webDriver -> webDriver.getCurrentUrl().endsWith(pathSuffix));
    assertTrue(driver.getCurrentUrl().endsWith(pathSuffix));
  }

  public void assertSearchValueEquals(String expected) {
    nav.assertSearchValueEquals(expected);
  }

  public void assertCatalogHeadingVisible(String heading) {
    assertTextsVisible(heading);
  }
}
