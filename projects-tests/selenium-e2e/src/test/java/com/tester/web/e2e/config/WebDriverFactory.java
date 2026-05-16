package com.tester.web.e2e.config;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import java.util.HashMap;
import java.util.Map;

public final class WebDriverFactory {

  private WebDriverFactory() {}

  public static WebDriver create(BrowserName browser) {
    WebDriver driver =
        switch (browser) {
          case CHROME -> new ChromeDriver(chromeOptions());
          case FIREFOX -> new FirefoxDriver(firefoxOptions());
          case EDGE -> new EdgeDriver(edgeOptions());
        };
    driver.manage().timeouts().implicitlyWait(TestEnvironment.implicitWait());
    driver.manage().timeouts().pageLoadTimeout(TestEnvironment.pageLoadTimeout());
    driver.manage().timeouts().scriptTimeout(TestEnvironment.scriptTimeout());
    driver.manage().window().maximize();
    return driver;
  }

  private static ChromeOptions chromeOptions() {
    WebDriverManager.chromedriver().setup();
    ChromeOptions options = new ChromeOptions();
    String chromeBinary = System.getenv("CHROME_BIN");
    if (chromeBinary != null && !chromeBinary.isBlank()) {
      options.setBinary(chromeBinary);
    }
    options.addArguments("--lang=pt-BR");
    Map<String, Object> prefs = new HashMap<>();
    prefs.put("intl.accept_languages", "pt-BR,pt,en-US,en");
    options.setExperimentalOption("prefs", prefs);
    if (TestEnvironment.headless()) {
      options.addArguments("--headless=false", "--disable-gpu", "--window-size=1920,1080");
    }
    options.addArguments("--no-sandbox", "--disable-dev-shm-usage");
    return options;
  }

  private static FirefoxOptions firefoxOptions() {
    WebDriverManager.firefoxdriver().setup();
    FirefoxOptions options = new FirefoxOptions();
    options.addPreference("intl.accept_languages", "pt-BR,pt,en-US,en");
    if (TestEnvironment.headless()) {
      options.addArguments("-headless");
    }
    return options;
  }

  private static EdgeOptions edgeOptions() {
    WebDriverManager.edgedriver().setup();
    EdgeOptions options = new EdgeOptions();
    options.addArguments("--lang=pt-BR");
    Map<String, Object> prefs = new HashMap<>();
    prefs.put("intl.accept_languages", "pt-BR,pt,en-US,en");
    options.setExperimentalOption("prefs", prefs);
    if (TestEnvironment.headless()) {
      options.addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080");
    }
    options.addArguments("--no-sandbox", "--disable-dev-shm-usage");
    return options;
  }
}
