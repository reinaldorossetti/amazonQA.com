package com.tester.web.e2e.support;

import com.tester.web.e2e.config.TestEnvironment;

public final class LoginExecutionConditions {

  private LoginExecutionConditions() {}

  /** Used by {@code @EnabledIf} for the successful-login scenario. */
  @SuppressWarnings("unused")
  public static boolean credentialsConfigured() {
    return TestEnvironment.hasLoginCredentials();
  }
}
