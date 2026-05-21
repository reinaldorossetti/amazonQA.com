package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Login screen selectors — aligned with {@code web/e2e/pages/LoginPage.ts}.
 */
public class LoginPageElements extends BasePage {

  protected static final By EMAIL_INPUT = By.id("login-email");
  protected static final By PASSWORD_INPUT = By.id("login-password");
  protected static final By SUBMIT_BUTTON = By.id("login-submit-btn");
  protected static final By CREATE_ACCOUNT_BUTTON = By.id("login-create-account-btn");
  protected static final By FORM_BODY = By.id("login-form-body");
  protected static final By ACCOUNT_LAYOUT = By.id("account-layout-wrapper");

  protected static final By ERROR_ALERT =
      By.cssSelector("#login-error-alert, [role='alert'], .MuiAlert-root");

  protected LoginPageElements(WebDriver driver) {
    super(driver);
  }
}
