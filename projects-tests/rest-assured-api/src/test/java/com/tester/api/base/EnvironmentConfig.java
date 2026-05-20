package com.tester.api.base;

import com.tester.api.support.EnvFileLoader;

public final class EnvironmentConfig {

  static {
    EnvFileLoader.loadIfPresent();
  }

  private EnvironmentConfig() {}

  public static String baseUri() {
    return firstNonBlank(
        System.getProperty("baseUri"),
        System.getenv("BASE_URI"),
        "http://127.0.0.1:3001");
  }

  public static String basePath() {
    return firstNonBlank(
        System.getProperty("basePath"),
        System.getenv("BASE_PATH"),
        "/api");
  }

  public static String get(String key) {
    return firstNonBlank(System.getProperty(key), System.getenv(key), "");
  }

  public static String get(String key, String defaultValue) {
    String value = get(key);
    return value.isBlank() ? defaultValue : value;
  }

  private static String firstNonBlank(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value.trim();
      }
    }
    return "";
  }
}
