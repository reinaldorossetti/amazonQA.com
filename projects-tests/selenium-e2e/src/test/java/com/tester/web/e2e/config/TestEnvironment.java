package com.tester.web.e2e.config;

import java.time.Duration;

public final class TestEnvironment {

  private static final Duration DEFAULT_IMPLICIT_WAIT = Duration.ofSeconds(0);
  private static final Duration DEFAULT_PAGE_LOAD_TIMEOUT = Duration.ofSeconds(60);
  private static final Duration DEFAULT_SCRIPT_TIMEOUT = Duration.ofSeconds(30);

  private TestEnvironment() {}

  public static String baseUrl() {
    return System.getProperty("base.url", "http://localhost:5174").replaceAll("/$", "");
  }

  public static boolean headless() {
    return Boolean.parseBoolean(System.getProperty("headless", "true"));
  }

  public static Duration defaultWait() {
    return Duration.ofSeconds(45);
  }

  public static Duration implicitWait() {
    return DEFAULT_IMPLICIT_WAIT;
  }

  public static Duration pageLoadTimeout() {
    return DEFAULT_PAGE_LOAD_TIMEOUT;
  }

  public static Duration scriptTimeout() {
    return DEFAULT_SCRIPT_TIMEOUT;
  }

  public static String loginEmail() {
    return System.getProperty("login.email");
  }

  public static String loginPassword() {
    return System.getProperty("login.password");
  }

  public static boolean hasLoginCredentials() {
    String email = loginEmail();
    String password = loginPassword();
    return email != null && !email.isBlank() && password != null && !password.isBlank();
  }
}
