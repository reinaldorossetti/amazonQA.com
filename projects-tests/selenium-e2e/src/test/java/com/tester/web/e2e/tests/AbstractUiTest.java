package com.tester.web.e2e.tests;

import com.tester.web.e2e.config.BrowserName;
import com.tester.web.e2e.config.WebDriverFactory;
import com.tester.web.e2e.support.EnvFileLoader;
import io.qameta.allure.Allure;
import java.io.ByteArrayInputStream;
import java.time.Duration;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.SessionNotCreatedException;
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

  private static final int SESSION_CREATE_ATTEMPTS = 3;
  private static final Duration SESSION_RETRY_PAUSE = Duration.ofSeconds(2);

  @BeforeEach
  void openBrowser() {
    driver = createBrowserWithRetry(BrowserName.current());
  }

  private static WebDriver createBrowserWithRetry(BrowserName browser) {
    SessionNotCreatedException lastFailure = null;
    for (int attempt = 1; attempt <= SESSION_CREATE_ATTEMPTS; attempt++) {
      try {
        return WebDriverFactory.create(browser);
      } catch (SessionNotCreatedException exception) {
        lastFailure = exception;
        if (attempt < SESSION_CREATE_ATTEMPTS) {
          pauseBeforeSessionRetry();
        }
      }
    }
    throw lastFailure;
  }

  private static void pauseBeforeSessionRetry() {
    try {
      Thread.sleep(SESSION_RETRY_PAUSE.toMillis());
    } catch (InterruptedException interrupted) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("Interrupted while waiting to retry browser session.", interrupted);
    }
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
