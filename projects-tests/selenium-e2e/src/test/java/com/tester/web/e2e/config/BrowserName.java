package com.tester.web.e2e.config;

import java.util.Locale;
import java.util.Objects;

public enum BrowserName {
  CHROME,
  FIREFOX,
  EDGE;

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

  public static BrowserName current() {
    return fromSystemProperty(Objects.requireNonNullElse(System.getProperty("browser"), ""));
  }
}
