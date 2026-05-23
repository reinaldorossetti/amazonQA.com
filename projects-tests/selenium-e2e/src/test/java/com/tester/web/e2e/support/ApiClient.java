package com.tester.web.e2e.support;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Predicate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ApiClient {

  /** Shared executor for {@link HttpClient} and parallel credential probes (Java 21+). */
  private static final ExecutorService VIRTUAL_EXECUTOR =
      Executors.newVirtualThreadPerTaskExecutor();

  private static final HttpClient HTTP =
      HttpClient.newBuilder()
          .version(HttpClient.Version.HTTP_1_1)
          .connectTimeout(Duration.ofSeconds(15))
          .executor(VIRTUAL_EXECUTOR)
          .build();

  private ApiClient() {}

  public static String apiBaseUrl() {
    return EnvConfig.get("API_BASE_URL", "http://127.0.0.1:3001/api").replaceAll("/$", "");
  }

  public static LoginResponse login(String email, String password) {
    HttpResponse<String> response = postLogin(apiBaseUrl() + "/users/login", email, password);
    if (response.statusCode() != 200) {
      throw new IllegalStateException("Login failed with HTTP " + response.statusCode());
    }
    return parseLoginResponse(response.body(), email);
  }

  public static Optional<LoginResponse> tryLoginSupport() {
    return tryLoginWithRole(supportCredentialPairs(), LoginResponse::support);
  }

  public static String describeSupportLoginFailure() {
    StringBuilder message =
        new StringBuilder("Support login unavailable. API: ")
            .append(apiBaseUrl())
            .append(". Env: ")
            .append(EnvFileLoader.loadedEnvPath())
            .append(".");

    boolean credentialsConfigured = false;
    for (String[] pair : supportCredentialPairs()) {
      if (pair[0] == null || pair[0].isBlank() || pair[1] == null || pair[1].isBlank()) {
        continue;
      }
      credentialsConfigured = true;
      message.append(" ").append(describeCredentialAttempt(pair[0], pair[1], LoginResponse::support));
    }

    if (!credentialsConfigured) {
      message.append(
          " Missing SEED_SUPPORT_*, E2E_SUPPORT_* or SUPPORT_* in projects-tests/selenium-e2e/.env.");
      message.append(" Seed user: suporte@tester.com (run server-ts seed if needed).");
    }
    return message.toString();
  }

  private static String[][] supportCredentialPairs() {
    return new String[][] {
      {EnvConfig.get("E2E_SUPPORT_EMAIL"), EnvConfig.get("E2E_SUPPORT_PASSWORD")},
      {EnvConfig.get("SEED_SUPPORT_EMAIL"), EnvConfig.get("SEED_SUPPORT_PASSWORD")},
      {EnvConfig.get("SUPPORT_EMAIL"), EnvConfig.get("SUPPORT_PASSWORD")},
    };
  }

  public static Optional<LoginResponse> tryLoginAdmin() {
    return tryLoginWithRole(
        new String[][] {
          {EnvConfig.get("E2E_ADMIN_EMAIL"), EnvConfig.get("E2E_ADMIN_PASSWORD")},
          {EnvConfig.get("SEED_ADMIN_EMAIL"), EnvConfig.get("SEED_ADMIN_PASSWORD")},
          {EnvConfig.get("ADMIN_EMAIL"), EnvConfig.get("ADMIN_PASSWORD")},
        },
        LoginResponse::admin);
  }

  private static Optional<LoginResponse> tryLoginWithRole(
      String[][] credentialPairs, Predicate<LoginResponse> roleCheck) {
    List<String[]> pairs = uniqueCredentialPairs(credentialPairs);
    if (pairs.isEmpty()) {
      return Optional.empty();
    }
    List<Future<Optional<LoginResponse>>> futures = new ArrayList<>(pairs.size());
    for (String[] pair : pairs) {
      futures.add(
          VIRTUAL_EXECUTOR.submit(() -> tryLoginWithRole(pair[0], pair[1], roleCheck)));
    }
    for (Future<Optional<LoginResponse>> future : futures) {
      Optional<LoginResponse> session = awaitLoginFuture(future);
      if (session.isPresent()) {
        return session;
      }
    }
    return Optional.empty();
  }

  private static List<String[]> uniqueCredentialPairs(String[][] credentialPairs) {
    List<String[]> pairs = new ArrayList<>();
    Set<String> seenEmails = new LinkedHashSet<>();
    for (String[] pair : credentialPairs) {
      if (pair[0] == null || pair[0].isBlank() || pair[1] == null || pair[1].isBlank()) {
        continue;
      }
      if (seenEmails.add(pair[0].trim().toLowerCase())) {
        pairs.add(pair);
      }
    }
    return pairs;
  }

  private static Optional<LoginResponse> awaitLoginFuture(
      Future<Optional<LoginResponse>> future) {
    try {
      return future.get();
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      return Optional.empty();
    } catch (ExecutionException exception) {
      return Optional.empty();
    }
  }

  private static Optional<LoginResponse> tryLoginWithRole(
      String email, String password, Predicate<LoginResponse> roleCheck) {
    try {
      HttpResponse<String> response =
          postLogin(apiBaseUrl() + "/users/login", email, password);
      if (response.statusCode() != 200) {
        return Optional.empty();
      }
      LoginResponse session = parseLoginResponse(response.body(), email);
      if (roleCheck.test(session)) {
        return Optional.of(session);
      }
      return Optional.empty();
    } catch (IllegalStateException exception) {
      return Optional.empty();
    }
  }

  private static String describeCredentialAttempt(
      String email, String password, Predicate<LoginResponse> roleCheck) {
    try {
      HttpResponse<String> response =
          postLogin(apiBaseUrl() + "/users/login", email, password);
      if (response.statusCode() != 200) {
        return email + ": HTTP " + response.statusCode() + ".";
      }
      LoginResponse session = parseLoginResponse(response.body(), email);
      if (roleCheck.test(session)) {
        return email + ": login OK but role check failed unexpectedly.";
      }
      return email + ": authenticated but missing support role " + session.roles() + ".";
    } catch (IllegalStateException exception) {
      return email + ": " + exception.getMessage() + ".";
    }
  }

  private static HttpResponse<String> postLogin(String url, String email, String password) {
    return post(url, JsonPayloads.loginBody(email, password), null);
  }

  public static Optional<LoginResponse> tryLogin(String email, String password) {
    try {
      return Optional.of(login(email, password));
    } catch (IllegalStateException exception) {
      return Optional.empty();
    }
  }

  public static CreatedProduct createProduct(String accessToken, String name) {
    String suffix = TestDataGenerator.randomNumeric8();
    String body = JsonPayloads.createProductBody(name, suffix);
    HttpResponse<String> response = post(apiBaseUrl() + "/products", body, accessToken);
    if (response.statusCode() != 201) {
      throw new IllegalStateException("Create product failed with HTTP " + response.statusCode());
    }
    return new CreatedProduct(readInt(response.body(), "id"), readString(response.body(), "name", name));
  }

  public static CreatedUser registerUser(String email, String password, String firstName, String lastName) {
    String cpf = TestDataGenerator.validCpf();
    String body = JsonPayloads.registerUserBody(firstName, lastName, email, password, cpf);
    HttpResponse<String> response = post(apiBaseUrl() + "/users/register", body, null);
    if (response.statusCode() != 201) {
      throw new IllegalStateException("Register failed with HTTP " + response.statusCode());
    }
    return new CreatedUser(readInt(response.body(), "id"), readString(response.body(), "email", email));
  }

  public static void deleteProduct(String accessToken, int productId) {
    sendDelete(apiBaseUrl() + "/products/" + productId, accessToken);
  }

  public static void deleteUser(String accessToken, int userId) {
    sendDelete(apiBaseUrl() + "/users/" + userId, accessToken);
  }

  public static String firstProductSearchTerm() {
    try {
      HttpRequest request =
          HttpRequest.newBuilder()
              .uri(URI.create(apiBaseUrl() + "/products"))
              .timeout(Duration.ofSeconds(15))
              .GET()
              .build();
      HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() != 200) {
        throw new IllegalStateException("Products list failed with HTTP " + response.statusCode());
      }
      String name = readFirstProductName(response.body());
      if (name == null || name.isBlank()) {
        return "Relógio";
      }
      String[] words = name.trim().split("\\s+");
      if (words.length >= 2) {
        return words[0] + " " + words[1];
      }
      return words[0];
    } catch (Exception exception) {
      throw new IllegalStateException("Products lookup failed: " + exception.getMessage(), exception);
    }
  }

  private static String readFirstProductName(String json) {
    Matcher matcher = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"").matcher(json);
    return matcher.find() ? matcher.group(1) : "";
  }

  public static int getProductStatus(int productId) {
    try {
      HttpRequest request =
          HttpRequest.newBuilder()
              .uri(URI.create(apiBaseUrl() + "/products/" + productId))
              .timeout(Duration.ofSeconds(15))
              .GET()
              .build();
      return HTTP.send(request, HttpResponse.BodyHandlers.ofString()).statusCode();
    } catch (Exception exception) {
      throw new IllegalStateException("Product lookup failed: " + exception.getMessage(), exception);
    }
  }

  private static HttpResponse<String> post(String url, String body, String accessToken) {
    HttpRequest.Builder builder =
        HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(30))
            .POST(HttpRequest.BodyPublishers.ofString(body));
    if (accessToken != null && !accessToken.isBlank()) {
      builder.header("Authorization", "Bearer " + accessToken);
    }
    HttpRequest request = builder.build();
    int maxAttempts = 3;
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return HTTP.send(request, HttpResponse.BodyHandlers.ofString());
      } catch (IOException | InterruptedException exception) {
        if (attempt == maxAttempts) {
          if (exception instanceof InterruptedException interrupted) {
            Thread.currentThread().interrupt();
          }
          throw new IllegalStateException(
              "POST " + url + " failed: " + exception.getMessage(), exception);
        }
        sleepQuietly(250L * attempt);
      }
    }
    throw new IllegalStateException("POST " + url + " failed after retries");
  }

  private static void sleepQuietly(long millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
    }
  }

  private static void sendDelete(String url, String accessToken) {
    try {
      HttpRequest request =
          HttpRequest.newBuilder()
              .uri(URI.create(url))
              .header("Authorization", "Bearer " + accessToken)
              .timeout(Duration.ofSeconds(30))
              .DELETE()
              .build();
      HTTP.send(request, HttpResponse.BodyHandlers.ofString());
    } catch (Exception exception) {
      throw new IllegalStateException("Delete failed: " + exception.getMessage(), exception);
    }
  }

  private static LoginResponse parseLoginResponse(String json, String fallbackEmail) {
    String token = readString(json, "accessToken", "");
    JsonSection user = readObject(json, "user");
    List<String> roles = readStringList(user.raw(), "roles");
    boolean isAdmin = readBoolean(user.raw(), "isAdmin") || roles.contains("admin");
    boolean isSupport = readBoolean(user.raw(), "isSupport") || roles.contains("support");
    return new LoginResponse(
        token,
        readInt(user.raw(), "id"),
        readString(user.raw(), "first_name", ""),
        readString(user.raw(), "last_name", ""),
        readString(user.raw(), "email", fallbackEmail),
        isAdmin,
        isSupport,
        roles);
  }

  private static List<String> readStringList(String json, String field) {
    Matcher matcher = Pattern.compile("\"" + field + "\"\\s*:\\s*\\[([^\\]]*)\\]").matcher(json);
    if (!matcher.find()) {
      return List.of();
    }
    String inner = matcher.group(1);
    if (inner == null || inner.isBlank()) {
      return List.of();
    }
    Matcher items = Pattern.compile("\"([^\"]+)\"").matcher(inner);
    List<String> values = new ArrayList<>();
    while (items.find()) {
      values.add(items.group(1));
    }
    return values;
  }

  private static JsonSection readObject(String json, String field) {
    Pattern pattern = Pattern.compile("\"" + field + "\"\\s*:\\s*\\{");
    Matcher matcher = pattern.matcher(json);
    if (!matcher.find()) {
      return new JsonSection("{}");
    }
    int start = matcher.end() - 1;
    int depth = 0;
    for (int i = start; i < json.length(); i++) {
      char current = json.charAt(i);
      if (current == '{') {
        depth++;
      } else if (current == '}') {
        depth--;
        if (depth == 0) {
          return new JsonSection(json.substring(start, i + 1));
        }
      }
    }
    return new JsonSection("{}");
  }

  private static String readString(String json, String field, String fallback) {
    Matcher matcher = Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
    return matcher.find() ? matcher.group(1) : fallback;
  }

  private static int readInt(String json, String field) {
    Matcher matcher = Pattern.compile("\"" + field + "\"\\s*:\\s*(\\d+)").matcher(json);
    return matcher.find() ? Integer.parseInt(matcher.group(1)) : 0;
  }

  private static boolean readBoolean(String json, String field) {
    Matcher matcher = Pattern.compile("\"" + field + "\"\\s*:\\s*(true|false)").matcher(json);
    return matcher.find() && Boolean.parseBoolean(matcher.group(1));
  }

  private static String escapeJson(String value) {
    return JsonPayloads.escapeJson(value);
  }

  private static String firstNonBlank(String... values) {
    for (String value : values) {
      if (value != null && !value.isBlank()) {
        return value;
      }
    }
    return "";
  }

  private record JsonSection(String raw) {}

  public record LoginResponse(
      String accessToken,
      int userId,
      String firstName,
      String lastName,
      String email,
      boolean admin,
      boolean support,
      List<String> roles) {}

  public record CreatedProduct(int id, String name) {}

  public record CreatedUser(int id, String email) {}
}
