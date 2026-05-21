package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.WebDriver;

/**
 * Top navigation actions — aligned with {@code web/e2e/pages/NavComponent.ts}.
 */
public class NavBarComponent extends NavBarElements {

  public NavBarComponent(WebDriver driver) {
    super(driver);
  }

  public boolean isUserGreetingVisible() {
    return isVisible(USER_GREETING);
  }

  public void whenSearchBy(String term) {
    fillAndPressEnter(SEARCH_INPUT, term);
  }

  public void whenOpenCart() {
    waitUntilToastIsGone();
    click(CART_BUTTON);
    waitForUrlContaining("/cart");
  }

  public void whenToggleLanguage() {
    click(LANGUAGE_TOGGLE);
  }

  public void whenLogout() {
    waitUntilToastIsGone();
    click(LOGOUT_BUTTON);
  }

  public void whenOpenAccountFromGreeting() {
    click(USER_GREETING);
    waitForUrlContaining("/minha-conta");
  }

  public void thenValidatedSearchValueEquals(String expected) {
    assertEquals(expected, inputValue(SEARCH_INPUT));
  }

  public void thenValidatedCartBadgeEquals(String expected) {
    assertEquals(expected, textOf(CART_BADGE));
  }

  public void thenValidatedCartBadgeNotZero() {
    assertFalse("0".equals(textOf(CART_BADGE)));
  }

  public void thenValidatedUserGreetingHidden() {
    assertTrue(driver.findElements(USER_GREETING).isEmpty()
        || !driver.findElement(USER_GREETING).isDisplayed());
  }
}
