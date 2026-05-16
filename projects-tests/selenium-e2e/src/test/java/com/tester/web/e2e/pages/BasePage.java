package com.tester.web.e2e.pages;

import java.util.logging.Logger;

import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;

public abstract class BasePage {

  protected static final Logger LOGGER = Logger.getLogger(BasePage.class.getName());
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
}
