package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import com.tester.web.e2e.config.TestEnvironment;

/**
 * Login screen — selectors aligned with {@code web/e2e/pages/LoginPage.ts}.
 *
 * <p>Uses Selenium {@link PageFactory} + {@link FindBy} for HTML UI, following the same pattern
 * described for browser / WebView in the Appium Java client Page Object docs (cross-platform
 * annotations; here only the {@code @FindBy} branch applies).
 */
public class LoginPageAction extends LoginPageElements {

  // Constructor
  public LoginPageAction(WebDriver driver) {
    super(driver);
  }

  public void open() {
    String url = TestEnvironment.baseUrl() + "/login";
    LOGGER.info(() -> "Opening login page: " + url);
    driver.navigate().to(url);
  }

  public void fillEmail(String email) {
    LOGGER.fine("Filling email field.");
    isVisible(emailInput);
    emailInput.sendKeys(email);
  }

  public void fillPassword(String password) {
    LOGGER.fine("Filling password field.");
    isVisible(passwordInput);
    fill(passwordInput, password);
  }

  public void submit() {
    LOGGER.fine("Submitting login form.");
    WebElement clickableSubmitButton =
        wait.until(ExpectedConditions.elementToBeClickable(By.id(SUBMIT_BUTTON)));
    clickableSubmitButton.click();
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
    isVisible(driver.findElement(ERROR_ALERT_LOCATOR));
    assertTextsVisible(message);
  }

}
