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

public abstract class BasePage {

  protected static final Logger LOGGER = Logger.getLogger(BasePage.class.getName());
  protected static final By TOAST_BODY = By.cssSelector(".Toastify__toast-body");
  private static final Duration TOAST_DISMISS_TIMEOUT = Duration.ofSeconds(7);
  private static final Duration DEFAULT_IS_VISIBLE_TIMEOUT = Duration.ofSeconds(5);
  private static final Duration MAX_IS_VISIBLE_TIMEOUT = Duration.ofSeconds(10);
  protected final WebDriver driver;
  protected final WebDriverWait wait;

  protected BasePage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, TestEnvironment.defaultWait());
  }

  protected By byTestId(String testId) {
    return Selectors.byTestId(testId);
  }

  protected WebElement waitVisible(String testId) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(byTestId(testId)));
  }

  protected void fillTestId(String testId, String text) {
    fill(byTestId(testId), text);
  }

  protected void clickTestId(String testId) {
    click(byTestId(testId));
  }

  protected void click(By locator) {
    clickOnElement(wait.until(ExpectedConditions.elementToBeClickable(locator)));
  }

  protected void clickFirst(By locator) {
    WebElement element =
        wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator)).getFirst();
    clickOnElement(wait.until(ExpectedConditions.elementToBeClickable(element)));
  }

  protected void fill(By locator, String text) {
    WebElement field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    LOGGER.fine(
        () ->
            String.format(
                "Filling locator %s with text length: %d", locator, text == null ? 0 : text.length()));
    click(locator);
    field.clear();
    if (text != null && !text.isEmpty()) {
      field.sendKeys(text);
    }
  }

  protected void fillAndPressEnter(By locator, String text) {
    fill(locator, text);
    wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).sendKeys(Keys.ENTER);
  }

  protected String inputValue(By locator) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getAttribute("value");
  }

  protected String firstInputValue(By locator) {
    return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(locator))
        .getFirst()
        .getAttribute("value");
  }

  protected String textOf(By locator) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getText().trim();
  }

  protected void moveFocusToElement(By locator) {
    moveFocusToElement(wait.until(ExpectedConditions.presenceOfElementLocated(locator)));
  }

  protected boolean isVisible(By locator) {
    return isVisible(locator, DEFAULT_IS_VISIBLE_TIMEOUT);
  }

  protected boolean isVisible(By locator, Duration timeout) {
    Duration effectiveTimeout = capVisibleTimeout(timeout);
    if (effectiveTimeout.isZero()) {
      return driver.findElements(locator).stream().anyMatch(WebElement::isDisplayed);
    }
    try {
      moveFocusToElement(locator);
      new WebDriverWait(driver, effectiveTimeout)
          .until(ExpectedConditions.visibilityOfElementLocated(locator));
      return true;
    } catch (TimeoutException exception) {
      return false;
    }
  }

  protected boolean isVisible(By locator, long timeoutSeconds) {
    return isVisible(locator, Duration.ofSeconds(timeoutSeconds));
  }

  private static Duration capVisibleTimeout(Duration timeout) {
    if (timeout == null || timeout.isNegative()) {
      return DEFAULT_IS_VISIBLE_TIMEOUT;
    }
    if (timeout.compareTo(MAX_IS_VISIBLE_TIMEOUT) > 0) {
      return MAX_IS_VISIBLE_TIMEOUT;
    }
    return timeout;
  }

  protected void waitUntilToastIsGone() {
    WebDriverWait toastWait = new WebDriverWait(driver, TOAST_DISMISS_TIMEOUT);
    if (isVisible(TOAST_BODY, Duration.ZERO)) {
      toastWait.until(ExpectedConditions.invisibilityOfElementLocated(TOAST_BODY));
      return;
    }
    try {
      toastWait.until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
      toastWait.until(ExpectedConditions.invisibilityOfElementLocated(TOAST_BODY));
    } catch (TimeoutException exception) {
      LOGGER.fine("No toast to dismiss.");
    }
  }

  protected void waitUntilToastCycleCompletes() {
    if (isVisible(TOAST_BODY)) {
      waitUntilToastIsGone();
    }
  }

  protected void waitForUrlContaining(String path) {
    wait.until(ExpectedConditions.urlContains(path));
  }

  protected void ensureTextsVisible(String... texts) {
    for (String text : texts) {
      wait.until(ExpectedConditions.visibilityOfElementLocated(
          By.xpath("//*[contains(normalize-space(.), '" + text + "')]")));
    }
  }

  protected void ensurePageContainsOneOf(String... texts) {
    String body =
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("body"))).getText();
    for (String text : texts) {
      if (body.contains(text)) {
        return;
      }
    }
    throw new AssertionError("Page body did not contain any of: " + String.join(", ", texts));
  }

  protected void ensureToastContains(String text) {
    WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
    String toastText = toast.getText();
    assertTrue(
        toastText.contains(text),
        () -> "Toast did not contain \"" + text + "\", got: " + toastText);
  }

  protected void ensureToastContainsOneOf(String... texts) {
    WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
    String toastText = toast.getText();
    for (String text : texts) {
      if (toastText.contains(text)) {
        return;
      }
    }
    throw new AssertionError("Toast did not contain any of: " + String.join(", ", texts));
  }

  protected void setInputValueWithJs(By locator, String value) {
    WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    moveFocusToElement(locator);
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "const input = arguments[0];"
              + "const value = arguments[1];"
              + "const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;"
              + "setter.call(input, value);"
              + "input.dispatchEvent(new Event('input', { bubbles: true }));",
          input,
          value);
    } else {
      fill(locator, value);
    }
  }

  protected void setFirstInputValueWithJs(By locator, String value) {
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

  protected void moveFocusToElement(WebElement element) {
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

  private void clickOnElement(WebElement element) {
    moveFocusToElement(element);
    try {
      element.click();
    } catch (ElementClickInterceptedException exception) {
      LOGGER.warning(() -> "Native click intercepted, falling back to JavaScript click: "
          + exception.getMessage());
      if (driver instanceof JavascriptExecutor javascriptExecutor) {
        javascriptExecutor.executeScript("arguments[0].click();", element);
      } else {
        throw exception;
      }
    }
  }

  protected void attachScreenshot(String name) {
    if (driver instanceof TakesScreenshot takesScreenshot) {
      byte[] screenshot = takesScreenshot.getScreenshotAs(OutputType.BYTES);
      Allure.addAttachment(name, "image/png", new ByteArrayInputStream(screenshot), ".png");
    }
  }
}
