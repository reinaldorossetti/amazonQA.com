package com.tester.web.e2e.pages;

import java.io.ByteArrayInputStream;
import java.time.Duration;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.By;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;
import com.tester.web.e2e.support.Selectors;

import io.qameta.allure.Allure;

/**
 * Shared Selenium helpers for page objects: waits, input, clicks, toast
 * handling, and assertions.
 */
public abstract class BasePage {

  /**
   * Logger for page-level diagnostics (waits, clicks, validation).
   */
  protected static final Logger LOGGER = Logger.getLogger(BasePage.class.getName());

  /** Locator for react-toastify message body. */
  protected static final By TOAST_BODY = By.cssSelector(".Toastify__toast-body");
  private static final Duration TOAST_DISMISS_TIMEOUT = Duration.ofSeconds(5);
  private static final Duration DEFAULT_IS_VISIBLE_TIMEOUT = Duration.ofSeconds(15);
  private static final Duration MAX_IS_VISIBLE_TIMEOUT = Duration.ofSeconds(30);

  protected final WebDriver driver;
  protected final WebDriverWait wait;

  /**
   * Binds the page to a driver and a default explicit wait from
   * {@link TestEnvironment}.
   * @param driver active WebDriver session
   */
  protected BasePage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, TestEnvironment.defaultWait());
  }

  /**
   * Returns whether the element is visible within the default timeout.
   */
  protected boolean isVisible(By locator) {
    LOGGER.info(() -> "isVisible: locator " + locator);
    return isVisible(locator, DEFAULT_IS_VISIBLE_TIMEOUT);
  }

  /**
   * Waits until clickable, then clicks (falls back to JS if intercepted).
   */
  protected void click(By locator) {
    LOGGER.info(() -> "click: locator " + locator);
    clickOnElement(wait.until(ExpectedConditions.elementToBeClickable(locator)));
  }

  /**
   * Clicks the element, using JavaScript when a native click is blocked by
   * overlays.
   */
  private void clickOnElement(WebElement element) {
    LOGGER.info(() -> "clickOnElement: element " + element);
    moveFocusToElementJS(element);
    try {
      element.click();
    } catch (ElementClickInterceptedException exception) {
      LOGGER.warning(() -> "Native click intercepted, falling back to JavaScript click: "
              + exception.getMessage());
      if (driver instanceof JavascriptExecutor javascriptExecutor) {
        javascriptExecutor.executeScript("arguments[0].click();", element);
      } else {
        LOGGER.warning(() -> "Error on clickOnElement: ${element}"
                + exception.getMessage());
        throw exception;
      }
    }
  }

  /**
   * Returns whether the element becomes visible within {@code timeout}
   * (capped at {@link #MAX_IS_VISIBLE_TIMEOUT}).
   */
  protected boolean isVisible(By locator, Duration timeout) {
    Duration effectiveTimeout = capVisibleTimeout(timeout);
    LOGGER.info(() -> "isVisible: locator " + locator + ", timeout " + effectiveTimeout);
    try {
      moveFocusToElement(locator);
      new WebDriverWait(driver, effectiveTimeout)
              .until(ExpectedConditions.visibilityOfElementLocated(locator));
      return true;
    } catch (TimeoutException exception) {
      return false;
    }
  }

  /**
   * Returns whether the element is present in the DOM within the default
   * timeout.
   */
  protected boolean isPresent(By locator) {
    LOGGER.info(() -> "isPresent: locator " + locator);
    return isPresent(locator, DEFAULT_IS_VISIBLE_TIMEOUT);
  }

  /**
   * Returns whether the element is present in the DOM within {@code timeout}
   * (capped at {@link #MAX_IS_VISIBLE_TIMEOUT}).
   */
  protected boolean isPresent(By locator, Duration timeout) {
    Duration effectiveTimeout = capVisibleTimeout(timeout);
    LOGGER.info(() -> "isPresent: locator " + locator + ", timeout " + effectiveTimeout);
    try {
      new WebDriverWait(driver, effectiveTimeout)
          .until(ExpectedConditions.presenceOfElementLocated(locator));
      return true;
    } catch (TimeoutException exception) {
      return false;
    }
  }

  /** {@link #isPresent(By, Duration)} with timeout in seconds. */
  protected boolean isPresent(By locator, long timeoutSeconds) {
    LOGGER.info(() -> "isPresent: locator " + locator + ", timeoutSeconds " + timeoutSeconds);
    return isPresent(locator, Duration.ofSeconds(timeoutSeconds));
  }

  /** Builds a {@code data-testid} CSS locator. */
  protected By byTestId(String testId) {
    By locator = Selectors.byTestId(testId);
    LOGGER.info(() -> "byTestId: locator " + locator);
    return locator;
  }

  /** Waits until the element with the given test id is visible. */
  protected WebElement waitVisible(String testId) {
    By locator = byTestId(testId);
    LOGGER.info(() -> "waitVisible: locator " + locator);
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
  }

  /** Clears and types into the field identified by {@code data-testid}. */
  protected void fillTestId(String testId, String text) {
    By locator = byTestId(testId);
    LOGGER.info(
        () ->
            String.format(
                "fillTestId: locator %s, text length %d", locator, text == null ? 0 : text.length()));
    fill(locator, text);
  }

  /** Clicks the element identified by {@code data-testid}. */
  protected void clickTestId(String testId) {
    By locator = byTestId(testId);
    LOGGER.info(() -> "clickTestId: locator " + locator);
    click(locator);
  }

  /** Clicks the first matching element for a multi-match locator. */
  protected void clickFirst(By locator) {
    LOGGER.info(() -> "clickFirst: locator " + locator);
    WebElement element =
        wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator)).getFirst();
    element.click();
  }

  /** Focuses, clears, and sends keys to a visible input or textarea. */
  protected void fill(By locator, String text) {
    LOGGER.info(
        () ->
            String.format(
                "fill: locator %s, text length %d", locator, text == null ? 0 : text.length()));
    WebElement field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    moveFocusToElementJS(field);
    clearField(locator);
    field.click();
    field.sendKeys(text);
  }

  /**
   * Clears an input by id via JavaScript ({@code element.value = ''}), with an
   * {@code input} event for controlled React/MUI fields.
   *
   * @param elementId value of the HTML {@code id} attribute
   */
  protected void clearFieldById(String elementId) {
    LOGGER.info(() -> "clearFieldById: locator " + By.id(elementId));
    if (!(driver instanceof JavascriptExecutor javascriptExecutor)) {
      wait.until(ExpectedConditions.visibilityOfElementLocated(By.id(elementId))).clear();
      return;
    }
    javascriptExecutor.executeScript(
        "const el = document.getElementById(arguments[0]);"
            + "if (el) {"
            + "  el.value = '';"
            + "  el.dispatchEvent(new Event('input', { bubbles: true }));"
            + "}",
        elementId);
  }

  /**
   * Clears a visible field: uses {@link #clearFieldById(String)} when the
   * element has an {@code id}, otherwise sets {@code value = ''} on the node.
   */
  protected void clearField(By locator) {
    LOGGER.info(() -> "clearField: locator " + locator);
    WebElement field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    String elementId = field.getDomAttribute("id");
    if (elementId != null && !elementId.isBlank()) {
      clearFieldById(elementId);
      return;
    }
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "arguments[0].value = '';"
              + "arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
          field);
    } else {
      field.clear();
    }
  }

  /** Fills the field and submits with Enter (e.g. header search). */
  protected void fillAndPressEnter(By locator, String text) {
    LOGGER.info(
        () ->
            String.format(
                "fillAndPressEnter: locator %s, text length %d",
                locator,
                text == null ? 0 : text.length()));
    fill(locator, text);
    wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).sendKeys(Keys.ENTER);
  }

  /** Returns the {@code value} attribute of a visible input. */
  protected String inputValue(By locator) {
    LOGGER.info(() -> "inputValue: locator " + locator);
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getAttribute("value");
  }

  /** Returns the {@code value} attribute of the first matching input. */
  protected String firstInputValue(By locator) {
    LOGGER.info(() -> "firstInputValue: locator " + locator);
    return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator))
        .getFirst()
        .getAttribute("value");
  }

  /** Returns trimmed visible text of the element. */
  protected String textOf(By locator) {
    LOGGER.info(() -> "textOf: locator " + locator);
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getText().trim();
  }

  /** Scrolls the located element into view and moves focus to it. */
  protected void moveFocusToElement(By locator) {
    LOGGER.info(() -> "moveFocusToElement: locator " + locator);
    moveFocusToElement(wait.until(ExpectedConditions.presenceOfElementLocated(locator)));
  }

  /** Scrolls the element into view and moves focus to it. */
  protected void moveFocusToElement(WebElement element) {
    LOGGER.info(() -> "moveFocusToElement: element " + element);
    moveFocusToElementJS(element);
  }

  /** {@link #isVisible(By, Duration)} with timeout in seconds. */
  protected boolean isVisible(By locator, long timeoutSeconds) {
    LOGGER.info(() -> "isVisible: locator " + locator + ", timeoutSeconds " + timeoutSeconds);
    return isVisible(locator, Duration.ofSeconds(timeoutSeconds));
  }

  /** Normalizes visibility timeouts to a safe default and maximum. */
  private static Duration capVisibleTimeout(Duration timeout) {
    if (timeout == null || timeout.isNegative()) {
      return DEFAULT_IS_VISIBLE_TIMEOUT;
    }
    if (timeout.compareTo(MAX_IS_VISIBLE_TIMEOUT) > 0) {
      return MAX_IS_VISIBLE_TIMEOUT;
    }
    return timeout;
  }

  /**
   * Waits for the current toast to disappear; tolerates no toast (short wait
   * for appearance first).
   */
  protected void waitUntilToastIsGone() {
    LOGGER.info(() -> "waitUntilToastIsGone: locator " + TOAST_BODY);
    try {
      WebDriverWait toastWait = new WebDriverWait(driver, TOAST_DISMISS_TIMEOUT);
      if (isPresent(TOAST_BODY, TOAST_DISMISS_TIMEOUT)) {
        toastWait.until(ExpectedConditions.invisibilityOfElementLocated(TOAST_BODY));
      }
    } catch (TimeoutException exception) {
      LOGGER.info("waitUntilToastIsGone: no toast to dismiss");
    }
  }

  /** Dismisses the toast only when one is currently visible. */
  protected void waitUntilToastCycleCompletes() {
    LOGGER.info(() -> "waitUntilToastCycleCompletes: locator " + TOAST_BODY);
    waitUntilToastIsGone();
  }

  /** Blocks until the browser URL contains {@code path}. */
  protected void waitForUrlContaining(String path) {
    LOGGER.info(() -> "waitForUrlContaining: path " + path);
    wait.until(ExpectedConditions.urlContains(path));
  }

  /** Asserts each text snippet is visible somewhere in the DOM. */
  protected void ensureTextsVisible(String... texts) {
    for (String text : texts) {
      By locator = By.xpath("//*[contains(normalize-space(.), '" + text + "')]");
      LOGGER.info(() -> "ensureTextsVisible: locator " + locator);
      wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }
  }

  /** Asserts the page body contains at least one of the given strings. */
  protected void ensurePageContainsOneOf(String... texts) {
    LOGGER.info(() -> "ensurePageContainsOneOf: locator " + By.tagName("body"));
    String body =
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))).getText();
    for (String text : texts) {
      if (body.contains(text)) {
        return;
      }
    }
    throw new AssertionError("Page body did not contain any of: " + String.join(", ", texts));
  }

  /** Asserts the visible toast message contains {@code text}. */
  protected void ensureToastContains(String text) {
    LOGGER.info(() -> "ensureToastContains: locator " + TOAST_BODY);
    WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
    String toastText = toast.getText();
    assertTrue(
        toastText.contains(text),
        () -> "Toast did not contain \"" + text + "\", got: " + toastText);
  }

  /**
   * Asserts the visible toast message contains at least one expected phrase.
   *
   * @param texts candidate substrings (e.g. PT and EN API messages)
   */
  protected void ensureToastContainsOneOf(String... texts) {
    LOGGER.info(() -> "ensureToastContainsOneOf: locator " + TOAST_BODY);
    WebElement toastElement =
        wait.until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
    String toastText = toastElement.getText();
    boolean matched = false;
    for (String expected : texts) {
      if (toastText.contains(expected)) {
        matched = true;
        break;
      }
    }
    assertTrue(
        matched,
        () ->
            "Toast did not contain any of: "
                + String.join(", ", texts)
                + ", got: "
                + toastText);
  }

  /**
   * Sets an input value via focus + fill (for controlled React/MUI fields).
   */
  protected void setInputValueWithJs(By locator, String value) {
    LOGGER.info(
        () ->
            String.format(
                "setInputValueWithJs: locator %s, value length %d",
                locator,
                value == null ? 0 : value.length()));
    moveFocusToElement(locator);
    fill(locator, value);
  }

  /**
   * Sets the first matching input via the native value setter and
   * {@code input} event (bypasses {@code maxLength} limits).
   */
  protected void setFirstInputValueWithJs(By locator, String value) {
    LOGGER.info(
        () ->
            String.format(
                "setFirstInputValueWithJs: locator %s, value length %d",
                locator,
                value == null ? 0 : value.length()));
    WebElement input =
        wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator)).getFirst();
    moveFocusToElement(input);
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "const input = arguments[0];"
              + "const value = arguments[1];"
              + "const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;"
              + "setter.call(input, value);"
              + "input.dispatchEvent(new Event('input', { bubbles: true }));",
          input,
          value);
      input.sendKeys(Keys.TAB);
    } else {
      fill(locator, value);
      input.sendKeys(Keys.TAB);
    }
  }

  /** Scrolls into view and focuses the element using JavaScript. */
  protected void moveFocusToElementJS(WebElement element) {
    LOGGER.info(() -> "moveFocusToElementJS: element " + element);
    if (!(driver instanceof JavascriptExecutor javascriptExecutor)) {
      return;
    }
    try {
      javascriptExecutor.executeScript(
          "arguments[0].scrollIntoView({block: 'center', inline: 'center'});"
              + "if (typeof arguments[0].focus === 'function') { arguments[0].focus({preventScroll: true}); }",
          element);
    } catch (RuntimeException exception) {
      LOGGER.warning(() -> "Could not move focus to element: " + exception.getMessage());
    }
  }

  /** Attaches a PNG screenshot to the current Allure report step. */
  protected void attachScreenshot(String name) {
    LOGGER.info(() -> "attachScreenshot: name " + name);
    if (driver instanceof TakesScreenshot takesScreenshot) {
      byte[] screenshot = takesScreenshot.getScreenshotAs(OutputType.BYTES);
      Allure.addAttachment(name, "image/png", new ByteArrayInputStream(screenshot), ".png");
    }
  }
}
