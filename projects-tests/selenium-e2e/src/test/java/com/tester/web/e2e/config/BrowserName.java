package com.tester.web.e2e.config;

import java.util.Locale;
import java.util.Objects;

/**
 * Represents the browser choice for Selenium tests.
 *
 * <p>This record normalizes the {@code browser} system property into a known value
 * (Chrome, Firefox, or Edge) and exposes helper methods to resolve the current
 * browser used by {@link com.tester.web.e2e.config.WebDriverFactory}.
 */
public record BrowserName(String value) {
  public static final BrowserName CHROME = new BrowserName("CHROME");
  public static final BrowserName FIREFOX = new BrowserName("FIREFOX");
  public static final BrowserName EDGE = new BrowserName("EDGE");

  /**
   * Resolves a browser name from a raw system property value.
   *
   * @param raw value provided via {@code -Dbrowser=...}
   * @return matching BrowserName constant, defaulting to CHROME when blank
   */
  public static BrowserName fromSystemProperty(String raw) {
    if (raw == null || raw.isBlank()) {
      return CHROME;
    }
    String normalized = raw.trim().toUpperCase(Locale.ROOT);
    return switch (normalized) {
      case "CHROME" -> CHROME;
      case "FIREFOX", "FF" -> FIREFOX;
      case "EDGE", "MSEDGE" -> EDGE;
      default -> throw new IllegalArgumentException(
          "Unsupported browser: " + raw + ". Use chrome, firefox, or edge.");
    };
  }

  /**
   * Returns the current browser based on the {@code browser} system property.
   *
   * @return resolved BrowserName, defaulting to CHROME when not provided
   */
  public static BrowserName current() {
    return fromSystemProperty(Objects.requireNonNullElse(System.getProperty("browser"), ""));
  }
}
