package com.tester.web.e2e.support;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.tester.web.e2e.config.TestEnvironment;

public final class AuthSessionHelper {

  private AuthSessionHelper() {}

  public static void setAuthenticatedSession(WebDriver driver, ApiClient.LoginResponse session) {
    String userJson =
        """
        {"id":%d,"name":"%s","lastName":"%s","email":"%s","personType":"PF","isAdmin":%s,"isSupport":%s,"roles":[]}
        """
            .formatted(
                session.userId(),
                escape(session.firstName()),
                escape(session.lastName()),
                escape(session.email()),
                session.admin(),
                session.support());

    driver.get(TestEnvironment.baseUrl());
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "localStorage.setItem('auth_user', arguments[0]);"
              + "localStorage.setItem('auth_token', arguments[1]);",
          userJson,
          session.accessToken());
    }
  }

  private static String escape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
