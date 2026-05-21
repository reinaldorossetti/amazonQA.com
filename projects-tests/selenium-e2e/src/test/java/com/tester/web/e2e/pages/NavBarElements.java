package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Top navigation selectors — aligned with {@code web/e2e/pages/NavComponent.ts}.
 */
public class NavBarElements extends BasePage {

  protected static final By USER_GREETING = By.id("nav-user-greeting");
  protected static final By CART_BUTTON = By.id("nav-cart-btn");
  protected static final By CART_BADGE = By.id("nav-cart-count-badge");
  protected static final By LANGUAGE_TOGGLE = By.id("nav-language-toggle");
  protected static final By LOGOUT_BUTTON = By.id("nav-logout-btn");
  protected static final By SEARCH_INPUT = By.id("nav-search-input");

  protected NavBarElements(WebDriver driver) {
    super(driver);
  }
}
