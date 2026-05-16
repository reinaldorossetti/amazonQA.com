package com.tester.web.e2e.support;

public final class LoginTestData {

  private LoginTestData() {}

  /** Known-good email shape for negative API tests (wrong password). */
  public static final String SAMPLE_VALID_EMAIL = "usuario@teste.com";

  public static final String WRONG_PASSWORD = "SenhaErrada@999";
}
