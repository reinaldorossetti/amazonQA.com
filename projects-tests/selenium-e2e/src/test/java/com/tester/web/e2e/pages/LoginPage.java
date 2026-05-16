package com.tester.web.e2e.pages;

import com.tester.web.e2e.config.TestEnvironment;
import java.time.Duration;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.pagefactory.AjaxElementLocatorFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Login screen — selectors aligned with {@code web/e2e/pages/LoginPage.ts}.
 *
 * <p>Uses Selenium {@link PageFactory} + {@link FindBy} for HTML UI, following the same pattern
 * described for browser / WebView in the Appium Java client Page Object docs (cross-platform
 * annotations; here only the {@code @FindBy} branch applies).
 */
public class LoginPage extends BasePage {

  /** {@code data-testid} value — kept for callers and documentation. */
  public static final String EMAIL_INPUT = "login-email";

  public static final String PASSWORD_INPUT = "login-password";
  public static final String SUBMIT_BUTTON = "login-submit-btn";
  public static final String ERROR_ALERT = "login-error-alert";
  public static final String CREATE_ACCOUNT_BUTTON = "login-create-account-btn";
  public static final String FORM_BODY = "login-form-body";

  @FindBy(css = "[data-testid='" + EMAIL_INPUT + "']")
  private WebElement emailInput;

  @FindBy(css = "[data-testid='" + PASSWORD_INPUT + "']")
  private WebElement passwordInput;

  @FindBy(css = "[data-testid='" + SUBMIT_BUTTON + "']")
  private WebElement submitButton;

  @FindBy(css = "[data-testid='" + ERROR_ALERT + "']")
  private WebElement errorAlert;

  @FindBy(css = "[data-testid='" + CREATE_ACCOUNT_BUTTON + "']")
  private WebElement createAccountButton;

  @FindBy(css = "[data-testid='" + FORM_BODY + "']")
  private WebElement formBody;

  public LoginPage(WebDriver driver) {
    super(driver);
    int ajaxTimeoutSeconds = (int) TestEnvironment.defaultWait().toSeconds();
    PageFactory.initElements(new AjaxElementLocatorFactory(driver, ajaxTimeoutSeconds), this);
  }

  public void open() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/login");
    wait.until(ExpectedConditions.visibilityOf(formBody));
  }

  public void fillEmail(String email) {
    fill(emailInput, email);
  }

  public void fillPassword(String password) {
    fill(passwordInput, password);
  }

  public void submit() {
    wait.until(ExpectedConditions.elementToBeClickable(submitButton));
    submitButton.click();
  }

  /** Opens registration from the login screen when the flow needs it. */
  public void clickCreateAccount() {
    wait.until(ExpectedConditions.elementToBeClickable(createAccountButton));
    createAccountButton.click();
  }

  /**
   * Fills credentials when provided, then submits.
   */
  public void login(String email, String password) {
    if (email != null && !email.isBlank()) {
      fillEmail(email);
    }
    if (password != null && !password.isBlank()) {
      fillPassword(password);
    }
    submit();
  }

  public boolean isErrorAlertVisible() {
    try {
      var shortWait = new WebDriverWait(driver, Duration.ofSeconds(3));
      shortWait.until(ExpectedConditions.visibilityOf(errorAlert));
      return true;
    } catch (TimeoutException e) {
      return false;
    }
  }

  public String errorAlertText() {
    wait.until(ExpectedConditions.visibilityOf(errorAlert));
    return errorAlert.getText();
  }

  private void fill(WebElement field, String text) {
    wait.until(ExpectedConditions.visibilityOf(field));
    field.click();
    field.clear();
    field.sendKeys(text);
  }
}
