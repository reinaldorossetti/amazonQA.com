package com.tester.web.e2e.tests;

import com.tester.web.e2e.config.BrowserName;
import com.tester.web.e2e.config.WebDriverFactory;
import com.tester.web.e2e.support.EnvFileLoader;
import io.qameta.allure.Allure;
import java.io.ByteArrayInputStream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

/**
 * Parallelism: classes run concurrently ({@code mode.classes.default=concurrent});
 * methods in the same class run sequentially ({@code mode.default=same_thread}).
 * Do not add {@code @Execution(SAME_THREAD)} here — it can force the whole suite onto one thread.
 */
public abstract class AbstractUiTest {

  static {
    EnvFileLoader.loadIfPresent();
  }

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
