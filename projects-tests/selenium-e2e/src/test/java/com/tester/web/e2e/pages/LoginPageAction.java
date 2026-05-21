package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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
    ensureTextsVisible(texts);
    attachScreenshot("validatedLoginInPage");
  }

  public void validatedLoginPage(String... texts) {
    LOGGER.info(() -> "Validating login page texts count: " + texts.length);
    ensureTextsVisible(texts);
    attachScreenshot("validatedLoginPage");
  }

  public void validatedErrorAlertVisible(String message) {
    LOGGER.info(() -> "Validating error alert text equals expected message: " + message);
    moveFocusToElement(ERROR_ALERT);
    ensureTextsVisible(message);
  }

  public void thenValidatedRedirectToCartWithGreeting(String firstName) {
    waitForUrlContaining("/cart");
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    ensureTextsVisible(firstName);
    attachScreenshot("validatedLoginRedirectToCart");
  }

  public void thenValidatedSessionPersistsAfterReload(String firstName) {
    driver.navigate().refresh();
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    ensureTextsVisible(firstName);
    attachScreenshot("validatedSessionAfterReload");
  }

  public void thenValidatedAccountLayoutVisible(String firstName) {
    waitForUrlContaining("/minha-conta");
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(ACCOUNT_LAYOUT)).isDisplayed());
    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
    ensureTextsVisible(firstName);
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
    typeUpToMaxLength(EMAIL_INPUT, longPayload);
    typeUpToMaxLength(PASSWORD_INPUT, longPayload);
    String emailValue = inputValue(EMAIL_INPUT);
    String passwordValue = inputValue(PASSWORD_INPUT);
    String expected = longPayload.substring(0, Math.min(MAX_CREDENTIAL_LENGTH, longPayload.length()));
    assertEquals(MAX_CREDENTIAL_LENGTH, emailValue.length());
    assertEquals(MAX_CREDENTIAL_LENGTH, passwordValue.length());
    assertEquals(expected, emailValue);
    assertEquals(expected, passwordValue);
    attachScreenshot("validatedCredentialMaxLength");
  }

  private void typeUpToMaxLength(By locator, String text) {
    WebElement field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    click(locator);
    field.clear();
    for (int index = 0; index < text.length(); index++) {
      String current = field.getAttribute("value");
      if (current != null && current.length() >= MAX_CREDENTIAL_LENGTH) {
        break;
      }
      field.sendKeys(String.valueOf(text.charAt(index)));
    }
  }
}
