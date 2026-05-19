package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

/**
 * Top navigation — aligned with {@code web/e2e/pages/NavComponent.ts}.
 */
public class NavBarComponent extends BasePage {

  public static final String USER_GREETING = "nav-user-greeting";
  public static final String CART_BUTTON = "nav-cart-btn";
  public static final String CART_BADGE = "nav-cart-count-badge";
  public static final String LANGUAGE_TOGGLE = "nav-language-toggle";
  public static final String LOGOUT_BUTTON = "nav-logout-btn";
  public static final String SEARCH_INPUT = "nav-search-input";

  private static final By USER_GREETING_LOCATOR = By.id(USER_GREETING);
  private static final By CART_BUTTON_LOCATOR = By.id(CART_BUTTON);
  private static final By CART_BADGE_LOCATOR = By.id(CART_BADGE);
  private static final By LANGUAGE_TOGGLE_LOCATOR = By.id(LANGUAGE_TOGGLE);
  private static final By LOGOUT_BUTTON_LOCATOR = By.id(LOGOUT_BUTTON);
  private static final By SEARCH_INPUT_LOCATOR = By.id(SEARCH_INPUT);

  public NavBarComponent(WebDriver driver) {
    super(driver);
  }

  public boolean isUserGreetingVisible() {
    return !driver.findElements(USER_GREETING_LOCATOR).isEmpty()
        && driver.findElement(USER_GREETING_LOCATOR).isDisplayed();
  }

  public void whenSearchBy(String term) {
    WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(SEARCH_INPUT_LOCATOR));
    input.click();
    input.clear();
    input.sendKeys(term);
    input.sendKeys(Keys.ENTER);
  }

  public void whenOpenCart() {
    waitUntilToastIsGone();
    WebElement cartButton = wait.until(ExpectedConditions.elementToBeClickable(CART_BUTTON_LOCATOR));
    clickElementWithFocus(cartButton);
    waitForUrlContaining("/cart");
  }

  public void whenToggleLanguage() {
    wait.until(ExpectedConditions.elementToBeClickable(LANGUAGE_TOGGLE_LOCATOR)).click();
  }

  public void whenLogout() {
    waitUntilToastIsGone();
    WebElement logout = wait.until(ExpectedConditions.visibilityOfElementLocated(LOGOUT_BUTTON_LOCATOR));
    clickElementWithFocus(logout);
  }

  public void whenOpenAccountFromGreeting() {
    wait.until(ExpectedConditions.elementToBeClickable(USER_GREETING_LOCATOR)).click();
    waitForUrlContaining("/minha-conta");
  }

  public void assertSearchValueEquals(String expected) {
    WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(SEARCH_INPUT_LOCATOR));
    assertEquals(expected, input.getAttribute("value"));
  }

  public void assertCartBadgeEquals(String expected) {
    assertEquals(
        expected, wait.until(ExpectedConditions.visibilityOfElementLocated(CART_BADGE_LOCATOR)).getText().trim());
  }

  public void assertCartBadgeNotZero() {
    String badge = wait.until(ExpectedConditions.visibilityOfElementLocated(CART_BADGE_LOCATOR)).getText().trim();
    assertFalse("0".equals(badge));
  }

  public void assertUserGreetingHidden() {
    assertTrue(driver.findElements(USER_GREETING_LOCATOR).isEmpty()
        || !driver.findElement(USER_GREETING_LOCATOR).isDisplayed());
  }
}
