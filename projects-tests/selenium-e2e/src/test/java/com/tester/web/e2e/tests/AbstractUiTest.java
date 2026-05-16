package com.tester.web.e2e.tests;

import com.tester.web.e2e.config.BrowserName;
import com.tester.web.e2e.config.WebDriverFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;

public abstract class AbstractUiTest {

  protected WebDriver driver;

  @BeforeEach
  void openBrowser() {
    driver = WebDriverFactory.create(BrowserName.current());
  }

  @AfterEach
  void closeBrowser() {
    if (driver != null) {
      driver.quit();
    }
  }
}
