package com.tester.web.e2e.pages;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;

/**
 * Login screen — selectors aligned with {@code web/e2e/pages/LoginPage.ts}.
 *
 * <p>Uses Selenium {@link PageFactory} + {@link FindBy} for HTML UI, following the same pattern
 * described for browser / WebView in the Appium Java client Page Object docs (cross-platform
 * annotations; here only the {@code @FindBy} branch applies).
 */
public class LoginPageAction extends BasePage {

  /** Element {@code id} values — kept for callers and documentation. */
  public static final String EMAIL_INPUT = "login-email";
  public static final String PASSWORD_INPUT = "login-password";
  public static final String SUBMIT_BUTTON = "login-submit-btn";
  public static final String ERROR_ALERT = "login-error-alert";
  public static final String CREATE_ACCOUNT_BUTTON = "login-create-account-btn";
  public static final String FORM_BODY = "login-form-body";

  private static final By ERROR_ALERT_LOCATOR =
      By.cssSelector("#" + ERROR_ALERT + ", [role='alert'], .MuiAlert-root");

  @FindBy(id = EMAIL_INPUT)
  private WebElement emailInput;

  @FindBy(id = PASSWORD_INPUT)
  private WebElement passwordInput;

  @FindBy(id = CREATE_ACCOUNT_BUTTON)
  private WebElement createAccountButton;

  @FindBy(id = FORM_BODY)
  private WebElement formBody;

  // Constructor
  public LoginPageAction(WebDriver driver) {
      super(driver);
      PageFactory.initElements(driver, this);
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
  }

  public void validatedLoginPage(String... texts) {
    LOGGER.info(() -> "Validating login page texts count: " + texts.length);
    assertTextsVisible(texts);
  }

  public void validatedErrorAlertVisible(String message) {
    LOGGER.info(() -> "Validating error alert text equals expected message: " + message);
    assertEquals(errorAlertText(), message);
  }

  public String errorAlertText() {
    var alertWait = new WebDriverWait(driver, Duration.ofSeconds(30));
    alertWait.until(ExpectedConditions.visibilityOfElementLocated(ERROR_ALERT_LOCATOR));
    String text = driver.findElement(ERROR_ALERT_LOCATOR).getText();
    LOGGER.info(() -> "Error alert text: " + text);
    return text;
  }

}
