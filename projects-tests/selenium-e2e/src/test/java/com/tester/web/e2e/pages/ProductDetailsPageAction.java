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

  public void assertProductHeadingVisible(String productName) {
    wait.until(ExpectedConditions.visibilityOfElementLocated(productHeading(productName)));
    assertTextsVisible(productName);
  }

  public void assertProductImageVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(PRODUCT_IMAGE)).isDisplayed());
  }

  public void assertPriceVisible(String priceText) {
    assertTextsVisible(priceText);
  }

  public void assertNotFoundMessageVisible() {
    assertTextsVisible("Produto não encontrado");
  }

  public void assertCartBadgeEquals(String expected) {
    nav.assertCartBadgeEquals(expected);
  }

  public void assertUrlIsCatalogHome() {
    wait.until(ExpectedConditions.urlToBe(TestEnvironment.baseUrl() + "/"));
  }
}
