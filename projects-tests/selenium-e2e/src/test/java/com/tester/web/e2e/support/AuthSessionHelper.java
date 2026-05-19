package com.tester.web.e2e.support;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

import com.tester.web.e2e.config.TestEnvironment;

public final class AuthSessionHelper {

  private AuthSessionHelper() {}

  public static void setAuthenticatedSession(WebDriver driver, ApiClient.LoginResponse session) {
    List<String> roles = resolveRoles(session);
    String rolesJson = toJsonArray(roles);
    String userJson =
        """
        {"id":%d,"name":"%s","lastName":"%s","email":"%s","personType":"PF","isAdmin":%s,"isSupport":%s,"roles":%s}
        """
            .formatted(
                session.userId(),
                escape(session.firstName()),
                escape(session.lastName()),
                escape(session.email()),
                session.admin(),
                session.support(),
                rolesJson);

    driver.get(TestEnvironment.baseUrl());
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "localStorage.setItem('auth_user', arguments[0]);"
              + "localStorage.setItem('auth_token', arguments[1]);",
          userJson,
          session.accessToken());
    }
  }

  private static List<String> resolveRoles(ApiClient.LoginResponse session) {
    Set<String> roles = new LinkedHashSet<>();
    if (session.roles() != null && !session.roles().isEmpty()) {
      roles.addAll(session.roles());
    } else {
      if (session.admin()) {
        roles.add("admin");
      }
      if (session.support()) {
        roles.add("support");
      }
      if (roles.isEmpty()) {
        roles.add("user");
      }
    }
    if (!roles.contains("user")) {
      roles.add("user");
    }
    return new ArrayList<>(roles);
  }

  private static String toJsonArray(List<String> values) {
    StringBuilder builder = new StringBuilder("[");
    for (int i = 0; i < values.size(); i++) {
      if (i > 0) {
        builder.append(',');
      }
      builder.append('"').append(escape(values.get(i))).append('"');
    }
    builder.append(']');
    return builder.toString();
  }

  private static String escape(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
