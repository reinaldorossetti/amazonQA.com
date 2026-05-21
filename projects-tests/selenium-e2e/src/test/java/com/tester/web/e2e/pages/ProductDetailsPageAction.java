package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.tester.web.e2e.config.TestEnvironment;

public class ProductDetailsPageAction extends ProductDetailsPageElements {

  private final NavBarComponent nav;

  public ProductDetailsPageAction(WebDriver driver) {
    super(driver);
    this.nav = new NavBarComponent(driver);
  }

  public void givenUserOnProduct(int productId) {
    driver.navigate().to(TestEnvironment.baseUrl() + "/product/" + productId);
  }

  public void givenUserOnValidProduct(int productId) {
    givenUserOnProduct(productId);
    wait.until(ExpectedConditions.visibilityOfElementLocated(ACTIONS_WRAPPER));
  }

  public void whenSelectQuantity(String quantity) {
    click(QUANTITY_COMBOBOX);
    click(quantityOption(quantity));
  }

  public void whenAddToCart() {
    click(ADD_TO_CART_BUTTON);
  }

  public void whenBackToCatalog() {
    click(BACK_BUTTON);
  }

  public void thenValidatedProductHeadingVisible(String productName) {
    wait.until(ExpectedConditions.visibilityOfElementLocated(productHeading(productName)));
    ensureTextsVisible(productName);
  }

  public void thenValidatedProductImageVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(PRODUCT_IMAGE)).isDisplayed());
  }

  public void thenValidatedPriceVisible(String priceText) {
    ensureTextsVisible(priceText);
  }

  public void thenValidatedNotFoundMessageVisible() {
    ensureTextsVisible("Produto não encontrado");
  }

  public void thenValidatedCartBadgeEquals(String expected) {
    nav.thenValidatedCartBadgeEquals(expected);
  }

  public void thenValidatedUrlIsCatalogHome() {
    wait.until(ExpectedConditions.urlToBe(TestEnvironment.baseUrl() + "/"));
  }
}
