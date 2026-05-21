package com.tester.web.e2e.support;

import java.util.regex.Pattern;

/**
 * Expected text on the login form. The application UI is Portuguese; tests assert against
 * those strings while keeping scenarios and code in English.
 */
public final class LoginUiCopy {

  private LoginUiCopy() {}

  /** API returns English; Login.jsx fallback is Portuguese. */
  public static final Pattern INVALID_CREDENTIALS =
      Pattern.compile("(?i).*(credenciais\\s+inválidas|invalid\\s+credentials).*");

  public static final Pattern EMPTY_OR_MISSING_PASSWORD =
      Pattern.compile("(?i).*preencha e-mail e senha.*");
}
