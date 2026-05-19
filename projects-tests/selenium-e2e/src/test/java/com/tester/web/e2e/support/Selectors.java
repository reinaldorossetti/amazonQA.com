package com.tester.web.e2e.support;

import org.openqa.selenium.By;

/**
 * Stable CSS selectors built with Java 15+ {@code String.formatted()}.
 * See README — Recursos Java 17+.
 */
public final class Selectors {

  private Selectors() {}

  public static By byTestId(String testId) {
    return By.cssSelector("[data-testid='%s']".formatted(testId));
  }
}
