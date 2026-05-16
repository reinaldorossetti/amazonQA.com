package com.tester.web.e2e.pages;

import com.tester.web.e2e.config.TestEnvironment;
import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class BasePage {

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
    WebElement element = waitVisible(testId);
    wait.until(ExpectedConditions.elementToBeClickable(byTestId(testId))).click();
  }

  protected boolean isDisplayed(String testId) {
    try {
      WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(3));
      shortWait.until(ExpectedConditions.visibilityOfElementLocated(byTestId(testId)));
      return true;
    } catch (TimeoutException e) {
      System.out.println("TimeoutException: " + e);
      return false;
    }
  }
}
