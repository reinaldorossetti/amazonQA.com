package com.tester.web.e2e.support;

/**
 * Resolves configuration from system properties (dotenv / -D) first, then OS environment.
 */
public final class EnvConfig {

  private EnvConfig() {}

  public static String get(String key) {
    return get(key, "");
  }

  public static String get(String key, String defaultValue) {
    String property = System.getProperty(key);
    if (property != null && !property.isBlank()) {
      return property.trim();
    }
    String env = System.getenv(key);
    if (env != null && !env.isBlank()) {
      return env.trim();
    }
    return defaultValue == null ? "" : defaultValue;
  }
}
