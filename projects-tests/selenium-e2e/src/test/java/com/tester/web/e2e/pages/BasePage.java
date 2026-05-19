package com.tester.web.e2e.pages;

import java.io.ByteArrayInputStream;
import java.time.Duration;
import java.util.logging.Logger;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementClickInterceptedException;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;

import io.qameta.allure.Allure;

public abstract class BasePage {

  protected static final Logger LOGGER = Logger.getLogger(BasePage.class.getName());
  protected static final By TOAST_BODY = By.cssSelector(".Toastify__toast-body");
  private static final Duration DEFAULT_IS_VISIBLE_TIMEOUT = Duration.ofSeconds(5);
  private static final Duration MAX_IS_VISIBLE_TIMEOUT = Duration.ofSeconds(10);
  protected final WebDriver driver;
  protected final WebDriverWait wait;

  protected BasePage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, TestEnvironment.defaultWait());
  }

  protected By byTestId(String testId) {
    return By.cssSelector("[data-testid='%s']".formatted(testId));
  }

  protected WebElement waitVisible(String testId) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(byTestId(testId)));
  }

  protected void fillTestId(String testId, String text) {
    WebElement element = waitVisible(testId);
    element.click();
    element.clear();
    element.sendKeys(text);
  }

  protected void clickTestId(String testId) {
    wait.until(ExpectedConditions.elementToBeClickable(byTestId(testId))).click();
  }

  protected boolean isVisible(WebElement element) {
    try {
      WebDriverWait shortWait = new WebDriverWait(driver, TestEnvironment.defaultWait());
      shortWait.until(ExpectedConditions.visibilityOf(element));
      return true;
    } catch (TimeoutException e) {
      LOGGER.warning(() -> "Timeout while waiting for element visibility: " + e.getMessage());
      return false;
    }
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
    if (isVisible(TOAST_BODY, Duration.ZERO)) {
      wait.until(ExpectedConditions.invisibilityOfElementLocated(TOAST_BODY));
      return;
    }
    try {
      new WebDriverWait(driver, DEFAULT_IS_VISIBLE_TIMEOUT)
          .until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
      wait.until(ExpectedConditions.invisibilityOfElementLocated(TOAST_BODY));
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

  protected void assertTextsVisible(String... texts) {
    for (String text : texts) {
      wait.until(ExpectedConditions.visibilityOfElementLocated(
          By.xpath("//*[contains(normalize-space(.), '" + text + "')]")));
    }
  }

  void fill(WebElement field, String text) {
    field.click();
    field.clear();
    field.sendKeys(text);
  }

  protected void moveFocusToElement(WebElement element) {
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "arguments[0].scrollIntoView({block: 'center', inline: 'center'});"
              + "if (typeof arguments[0].focus === 'function') { arguments[0].focus({preventScroll: true}); }",
          element);
    }
  }

  protected void clickElementWithFocus(WebElement element) {
    moveFocusToElement(element);
    try {
      wait.until(ExpectedConditions.elementToBeClickable(element)).click();
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
