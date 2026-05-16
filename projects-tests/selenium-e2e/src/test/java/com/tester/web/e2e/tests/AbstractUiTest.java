package com.tester.web.e2e.tests;

import com.tester.web.e2e.config.BrowserName;
import com.tester.web.e2e.config.WebDriverFactory;
import io.qameta.allure.Allure;
import java.io.ByteArrayInputStream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

public abstract class AbstractUiTest {

  protected WebDriver driver;

  @BeforeEach
  void openBrowser() {
    driver = WebDriverFactory.create(BrowserName.current());
  }

  @AfterEach
  void closeBrowser() {
    attachScreenshot("After test");
    if (driver != null) {
      driver.quit();
    }
  }

  private void attachScreenshot(String name) {
    if (driver instanceof TakesScreenshot takesScreenshot) {
      byte[] screenshot = takesScreenshot.getScreenshotAs(OutputType.BYTES);
      Allure.addAttachment(name, "image/png", new ByteArrayInputStream(screenshot), ".png");
    }
  }
}
