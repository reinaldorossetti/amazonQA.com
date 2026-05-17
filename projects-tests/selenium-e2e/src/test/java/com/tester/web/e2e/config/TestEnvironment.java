package com.tester.web.e2e.config;

import java.time.Duration;

public final class TestEnvironment {

  private static final Duration DEFAULT_IMPLICIT_WAIT = Duration.ofSeconds(20);
  private static final Duration DEFAULT_PAGE_LOAD_TIMEOUT = Duration.ofSeconds(60);
  private static final Duration DEFAULT_SCRIPT_TIMEOUT = Duration.ofSeconds(35);

  private TestEnvironment() {}

  public static String baseUrl() {
    String baseUrl = System.getProperty("BASE_URL");
    if (baseUrl == null || baseUrl.isBlank()) {
      baseUrl = System.getProperty("base.url");
    }
    if (baseUrl == null || baseUrl.isBlank()) {
      baseUrl = System.getenv("BASE_URL");
    }
    if (baseUrl == null || baseUrl.isBlank()) {
      baseUrl = "http://127.0.0.1:5174";
    }
    return baseUrl.replaceAll("/$", "");
  }

  public static boolean headless() {
    return Boolean.parseBoolean(System.getProperty("headless", "false"));
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
    String email = System.getProperty("LOGIN_EMAIL");
    if (email == null || email.isBlank()) {
      email = System.getProperty("login.email");
    }
    if (email == null || email.isBlank()) {
      email = System.getenv("LOGIN_EMAIL");
    }
    if (email == null || email.isBlank()) {
      throw new IllegalStateException(
          "Login email not configured. Provide it via: "
              + "-Dlogin.email=user@example.com or env var LOGIN_EMAIL");
    }
    return email;
  }

  public static String loginPassword() {
    String password = System.getProperty("LOGIN_PASSWORD");
    if (password == null || password.isBlank()) {
      password = System.getProperty("login.password");
    }
    if (password == null || password.isBlank()) {
      password = System.getenv("LOGIN_PASSWORD");
    }
    if (password == null || password.isBlank()) {
      throw new IllegalStateException(
          "Login password not configured. Provide it via: "
              + "-Dlogin.password=secret or env var LOGIN_PASSWORD");
    }
    return password;
  }

  public static boolean hasLoginCredentials() {
    try {
      loginEmail();
      loginPassword();
      return true;
    } catch (IllegalStateException e) {
      return false;
    }
  }
}
