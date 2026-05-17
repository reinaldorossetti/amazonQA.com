package com.tester.web.e2e.config;

import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;

import io.github.bonigarcia.wdm.WebDriverManager;

public final class WebDriverFactory {

  private static final String LANGUAGE_ARGUMENT = "--lang=pt-BR";
  private static final String ACCEPT_LANGUAGES = "pt-BR,pt,en-US,en";
  private static final String NO_SANDBOX_ARGUMENT = "--no-sandbox";
  private static final String DISABLE_DEV_SHM_ARGUMENT = "--disable-dev-shm-usage";
  private static final String HEADLESS_CHROME = "--headless=new";
  private static final String HEADLESS_EDGE = "--headless=new";
  private static final String DISABLE_GPU_ARGUMENT = "--disable-gpu";
  private static final int HD_WIDTH = 1920;
  private static final int HD_HEIGHT = 1080;
  private static final String WINDOW_SIZE_ARGUMENT =
      "--window-size=" + HD_WIDTH + "," + HD_HEIGHT;

  /** Prevents instantiation of this factory class. */
  private WebDriverFactory() {}

  /**
   * Creates a configured WebDriver instance for the requested browser.
   *
   * @param browser resolved browser name
   * @return configured WebDriver instance
   */
  public static WebDriver create(BrowserName browser) {
    WebDriver driver = createDriver(browser);
    configureTimeouts(driver);
    configureWindowSize(driver);
    return driver;
  }

  /**
   * Builds Chrome-specific options, including language and headless settings.
   *
   * @return configured ChromeOptions
   */
  private static ChromeOptions chromeOptions() {
    WebDriverManager.chromedriver().setup();
    ChromeOptions options = new ChromeOptions();
    String chromeBinary = System.getenv("CHROME_BIN");
    if (chromeBinary != null && !chromeBinary.isBlank()) {
      options.setBinary(chromeBinary);
    }
    options.addArguments(LANGUAGE_ARGUMENT);
    applyChromePreferences(options);
    options.addArguments(WINDOW_SIZE_ARGUMENT);
    if (TestEnvironment.headless()) {
      options.addArguments(HEADLESS_CHROME, DISABLE_GPU_ARGUMENT);
    }
    options.addArguments(NO_SANDBOX_ARGUMENT, DISABLE_DEV_SHM_ARGUMENT);
    return options;
  }

  /**
   * Builds Firefox-specific options, including language and headless settings.
   *
   * @return configured FirefoxOptions
   */
  private static FirefoxOptions firefoxOptions() {
    FirefoxOptions options = new FirefoxOptions();
    String firefoxBinary = System.getenv("FIREFOX_BIN");
    if (firefoxBinary != null && !firefoxBinary.isBlank()) {
      options.setBinary(firefoxBinary);
    } else {
      WebDriverManager.firefoxdriver().setup();
    }
    options.addPreference("intl.accept_languages", ACCEPT_LANGUAGES);
    if (TestEnvironment.headless()) {
      options.addArguments("--headless");
    }
    return options;
  }

  /**
   * Builds Edge-specific options, including language and headless settings.
   *
   * @return configured EdgeOptions
   */
  private static EdgeOptions edgeOptions() {
    WebDriverManager.edgedriver().setup();
    EdgeOptions options = new EdgeOptions();
    options.addArguments(LANGUAGE_ARGUMENT);
    applyEdgePreferences(options);
    options.addArguments(WINDOW_SIZE_ARGUMENT);
    if (TestEnvironment.headless()) {
      options.addArguments(HEADLESS_EDGE, DISABLE_GPU_ARGUMENT);
    }
    options.addArguments(NO_SANDBOX_ARGUMENT, DISABLE_DEV_SHM_ARGUMENT);
    return options;
  }

  /**
   * Creates the driver instance for the chosen browser.
   *
   * @param browser resolved browser name
   * @return WebDriver instance
   */
  private static WebDriver createDriver(BrowserName browser) {
    if (BrowserName.CHROME.equals(browser)) {
      return new ChromeDriver(chromeOptions());
    }
    if (BrowserName.FIREFOX.equals(browser)) {
      return new FirefoxDriver(firefoxOptions());
    }
    if (BrowserName.EDGE.equals(browser)) {
      return new EdgeDriver(edgeOptions());
    }
    throw new IllegalArgumentException("Unsupported browser: " + browser.value());
  }

  /**
   * Applies common Selenium timeouts from {@link TestEnvironment}.
   *
   * @param driver WebDriver instance to configure
   */
  private static void configureTimeouts(WebDriver driver) {
    driver.manage().timeouts().implicitlyWait(TestEnvironment.implicitWait());
    driver.manage().timeouts().pageLoadTimeout(TestEnvironment.pageLoadTimeout());
    driver.manage().timeouts().scriptTimeout(TestEnvironment.scriptTimeout());
  }

  /** Sets the browser viewport to Full HD (1920x1080). */
  private static void configureWindowSize(WebDriver driver) {
    driver.manage().window().setSize(new Dimension(HD_WIDTH, HD_HEIGHT));
  }

  /**
   * Applies Chrome-specific language preferences.
   *
   * @param options ChromeOptions to update
   */
  private static void applyChromePreferences(ChromeOptions options) {
    Map<String, Object> prefs = new HashMap<>();
    prefs.put("intl.accept_languages", ACCEPT_LANGUAGES);
    options.setExperimentalOption("prefs", prefs);
  }

  /**
   * Applies Edge-specific language preferences.
   *
   * @param options EdgeOptions to update
   */
  private static void applyEdgePreferences(EdgeOptions options) {
    Map<String, Object> prefs = new HashMap<>();
    prefs.put("intl.accept_languages", ACCEPT_LANGUAGES);
    options.setExperimentalOption("prefs", prefs);
  }
}
