package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.tester.web.e2e.config.TestEnvironment;
import com.tester.web.e2e.support.LoginUiCopy;

/**
 * Login screen actions — selectors in {@link LoginPageElements}.
 */
public class LoginPageAction extends LoginPageElements {

  private static final int MAX_CREDENTIAL_LENGTH = 30;

  public LoginPageAction(WebDriver driver) {
    super(driver);
  }

  public void open() {
    openWithNextPath(null);
  }

  public void openWithNextPath(String nextPath) {
    String path = nextPath == null || nextPath.isBlank() ? "/login" : "/login?next=" + nextPath;
    String url = TestEnvironment.baseUrl() + path;
    LOGGER.info(() -> "Opening login page: " + url);
    driver.navigate().to(url);
  }

  public void fillEmail(String email) {
    LOGGER.fine("Filling email field.");
    isVisible(EMAIL_INPUT);
    fill(EMAIL_INPUT, email == null ? "" : email);
  }

  public void fillPassword(String password) {
    LOGGER.fine("Filling password field.");
    isVisible(PASSWORD_INPUT);
    fill(PASSWORD_INPUT, password);
  }

  public void submit() {
    LOGGER.fine("Submitting login form.");
    click(SUBMIT_BUTTON);
  }

  /**
   * Fills credentials when provided, then submits.
   */
  public void loginAction(String email, String password, Boolean confirm) {
    LOGGER.info(() -> "Login action started. Submit after fill: " + confirm);
    fillEmail(email);
    fillPassword(password);
    if (confirm) {
      submit();
    }
  }

  public void validatedLoginInPage(String... texts) {
    LOGGER.info("Validating login success page.");
    waitForUrlContaining("/minha-conta");
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    assertTextsVisible(texts);
    attachScreenshot("validatedLoginInPage");
  }

  public void validatedLoginPage(String... texts) {
    LOGGER.info(() -> "Validating login page texts count: " + texts.length);
    assertTextsVisible(texts);
    attachScreenshot("validatedLoginPage");
  }

  public void validatedErrorAlertVisible(String message) {
    LOGGER.info(() -> "Validating error alert text equals expected message: " + message);
    moveFocusToElement(ERROR_ALERT);
    assertTextsVisible(message);
  }

  public void thenValidatedRedirectToCartWithGreeting(String firstName) {
    waitForUrlContaining("/cart");
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    assertTextsVisible(firstName);
    attachScreenshot("validatedLoginRedirectToCart");
  }

  public void thenValidatedSessionPersistsAfterReload(String firstName) {
    driver.navigate().refresh();
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    assertTextsVisible(firstName);
    attachScreenshot("validatedSessionAfterReload");
  }

  public void thenValidatedAccountLayoutVisible(String firstName) {
    waitForUrlContaining("/minha-conta");
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(ACCOUNT_LAYOUT)).isDisplayed());
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    assertTextsVisible(firstName);
    attachScreenshot("validatedAccountLayout");
  }

  public void thenValidatedStillOnLoginPage() {
    waitForUrlContaining("/login");
    attachScreenshot("validatedStillOnLogin");
  }

  public void thenValidatedInvalidCredentialsError() {
    moveFocusToElement(ERROR_ALERT);
    String alertText = textOf(ERROR_ALERT);
    assertTrue(
        LoginUiCopy.INVALID_CREDENTIALS.matcher(alertText).find(),
        () -> "Expected invalid credentials message, got: " + alertText);
    attachScreenshot("validatedInvalidCredentials");
  }

  public void thenValidatedEmailPasswordMaxLength(String longPayload) {
    fillEmail(longPayload);
    fillPassword(longPayload);
    String emailValue = inputValue(EMAIL_INPUT);
    String passwordValue = inputValue(PASSWORD_INPUT);
    String expected = longPayload.substring(0, Math.min(MAX_CREDENTIAL_LENGTH, longPayload.length()));
    assertTrue(emailValue.length() <= MAX_CREDENTIAL_LENGTH);
    assertTrue(passwordValue.length() <= MAX_CREDENTIAL_LENGTH);
    assertEquals(expected, emailValue);
    assertEquals(expected, passwordValue);
    attachScreenshot("validatedCredentialMaxLength");
  }
}
