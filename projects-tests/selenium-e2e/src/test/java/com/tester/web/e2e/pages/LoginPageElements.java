package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

/**
 * Login screen elements — selectors aligned with {@code web/e2e/pages/LoginPage.ts}.
 */
public class LoginPageElements extends BasePage {

  /** Element {@code id} values — kept for callers and documentation. */
  public static final String EMAIL_INPUT = "login-email";
  public static final String PASSWORD_INPUT = "login-password";
  public static final String SUBMIT_BUTTON = "login-submit-btn";
  public static final String ERROR_ALERT = "login-error-alert";
  public static final String CREATE_ACCOUNT_BUTTON = "login-create-account-btn";
  public static final String FORM_BODY = "login-form-body";

  protected static final By ERROR_ALERT_LOCATOR =
      By.cssSelector("#" + ERROR_ALERT + ", [role='alert'], .MuiAlert-root");

  @FindBy(id = EMAIL_INPUT)
  protected WebElement emailInput;

  @FindBy(id = PASSWORD_INPUT)
  protected WebElement passwordInput;

  @FindBy(id = CREATE_ACCOUNT_BUTTON)
  protected WebElement createAccountButton;

  @FindBy(id = FORM_BODY)
  protected WebElement formBody;

  // Constructor
  public LoginPageElements(WebDriver driver) {
    super(driver);
    PageFactory.initElements(driver, this);
  }
}
