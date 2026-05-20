package com.tester.api.support;

import com.tester.api.base.EnvironmentConfig;
import com.tester.api.client.UsersClient;
import com.tester.api.model.request.LoginRequest;
import com.tester.api.model.request.RegisterUserRequest;
import com.tester.api.model.response.LoginResponse;
import io.restassured.response.Response;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public final class AuthSession {

  private AuthSession() {}

  public static LoginResponse loginAdmin() {
    List<String[]> pairs = adminCredentialPairs();
    List<String> attempts = new ArrayList<>();

    for (String[] pair : pairs) {
      if (isBlank(pair[0]) || isBlank(pair[1])) {
        continue;
      }
      Response response = UsersClient.login(new LoginRequest(pair[0], pair[1]));
      if (response.statusCode() != 200) {
        attempts.add(pair[0] + " -> HTTP " + response.statusCode());
        continue;
      }
      LoginResponse body = response.as(LoginResponse.class);
      if (body.accessToken() != null && isAdmin(body)) {
        return body;
      }
      attempts.add(pair[0] + " -> missing token/admin");
    }

    throw new IllegalStateException(
        "Unable to authenticate as admin. API: "
            + EnvironmentConfig.baseUri()
            + EnvironmentConfig.basePath()
            + ". Attempts: "
            + String.join(" | ", attempts));
  }

  public static String adminToken() {
    return loginAdmin().accessToken();
  }

  public static LoginResponse loginSupport() {
    for (String[] pair : supportCredentialPairs()) {
      if (isBlank(pair[0]) || isBlank(pair[1])) {
        continue;
      }
      Response response = UsersClient.login(new LoginRequest(pair[0], pair[1]));
      if (response.statusCode() == 200) {
        LoginResponse body = response.as(LoginResponse.class);
        if (body.accessToken() != null) {
          return body;
        }
      }
    }
    throw new IllegalStateException(
        "Support login unavailable. Configure SEED_SUPPORT_* or E2E_SUPPORT_* in .env");
  }

  public static String supportToken() {
    return loginSupport().accessToken();
  }

  public static RegisteredUser registerAndLogin(RegisterUserRequest registration) {
    Response register = UsersClient.register(registration);
    if (register.statusCode() != 201) {
      throw new IllegalStateException("Register failed: HTTP " + register.statusCode());
    }
    LoginResponse login = loginUser(registration.email(), registration.password());
    return new RegisteredUser(registration, login);
  }

  public static LoginResponse loginUser(String email, String password) {
    Response response = UsersClient.login(new LoginRequest(email, password));
    if (response.statusCode() != 200) {
      throw new IllegalStateException("Login failed: HTTP " + response.statusCode());
    }
    return response.as(LoginResponse.class);
  }

  public static String userToken(String email, String password) {
    return loginUser(email, password).accessToken();
  }

  private static boolean isAdmin(LoginResponse login) {
    if (login.user() == null) {
      return false;
    }
    if (Boolean.TRUE.equals(login.user().isAdmin())) {
      return true;
    }
    return login.user().roles() != null && login.user().roles().contains("admin");
  }

  private static List<String[]> adminCredentialPairs() {
    Set<String> seen = new LinkedHashSet<>();
    List<String[]> pairs = new ArrayList<>();
    addEnvPair(pairs, seen, "E2E_ADMIN_EMAIL", "E2E_ADMIN_PASSWORD");
    addEnvPair(pairs, seen, "SEED_ADMIN_EMAIL", "SEED_ADMIN_PASSWORD");
    addEnvPair(pairs, seen, "ADMIN_EMAIL", "ADMIN_PASSWORD");
    addCredentialPair(pairs, seen, "admin@tester.com", "Admin@123");
    addCredentialPair(pairs, seen, "admin.teste@tester.com", "Admin@123");
    addCredentialPair(pairs, seen, "reiload@gmail.com", "rei2026@QA");
    return pairs;
  }

  private static List<String[]> supportCredentialPairs() {
    List<String[]> pairs = new ArrayList<>();
    addEnvPair(pairs, new LinkedHashSet<>(), "E2E_SUPPORT_EMAIL", "E2E_SUPPORT_PASSWORD");
    addEnvPair(pairs, new LinkedHashSet<>(), "SEED_SUPPORT_EMAIL", "SEED_SUPPORT_PASSWORD");
    addEnvPair(pairs, new LinkedHashSet<>(), "SUPPORT_EMAIL", "SUPPORT_PASSWORD");
    addCredentialPair(pairs, new LinkedHashSet<>(), "suporte@tester.com", "suporte2026@QA");
    return pairs;
  }

  private static void addEnvPair(
      List<String[]> pairs, Set<String> seen, String emailKey, String passwordKey) {
    addCredentialPair(pairs, seen, EnvironmentConfig.get(emailKey), EnvironmentConfig.get(passwordKey));
  }

  private static void addCredentialPair(
      List<String[]> pairs, Set<String> seen, String email, String password) {
    if (isBlank(email) || isBlank(password)) {
      return;
    }
    String key = email.trim().toLowerCase() + "|" + password;
    if (!seen.add(key)) {
      return;
    }
    pairs.add(new String[] {email.trim(), password});
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  public record RegisteredUser(RegisterUserRequest registration, LoginResponse login) {

    public String token() {
      return login.accessToken();
    }

    public int userId() {
      return login.user().id();
    }

    public String email() {
      return login.user().email();
    }
  }
}
