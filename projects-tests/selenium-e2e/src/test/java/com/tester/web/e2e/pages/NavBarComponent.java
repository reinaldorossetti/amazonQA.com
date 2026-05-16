package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Top navigation — greeting locator aligned with {@code web/e2e/pages/NavComponent.ts}.
 */
public class NavBarComponent extends BasePage {

  public static final String USER_GREETING = "nav-user-greeting";

  public NavBarComponent(WebDriver driver) {
    super(driver);
  }

  public boolean isUserGreetingVisible() {
    return isVisible(driver.findElement(By.id(USER_GREETING)));
  }
}
