package com.tester.web.e2e.support;

/**
 * JSON request bodies built with Java 15+ text blocks and {@code formatted()}.
 * Used by {@link ApiClient} and {@link AuthSessionHelper}. See README — Recursos Java 17+.
 */
public final class JsonPayloads {

  private JsonPayloads() {}

  public static String loginBody(String email, String password) {
    return """
        {"email":"%s","password":"%s"}
        """
        .formatted(escapeJson(email), escapeJson(password));
  }

  public static String registerUserBody(
      String firstName, String lastName, String email, String password, String cpf) {
    return """
        {"first_name":"%s","last_name":"%s","email":"%s","password":"%s","person_type":"PF","cpf":"%s"}
        """
        .formatted(
            escapeJson(firstName),
            escapeJson(lastName),
            escapeJson(email),
            escapeJson(password),
            escapeJson(cpf));
  }

  public static String createProductBody(String name, String categorySuffix) {
    return """
        {"name":"%s","price":129.9,"category":"E2E-%s","description":"Produto criado via API para teste Selenium"}
        """
        .formatted(escapeJson(name), escapeJson(categorySuffix));
  }

  public static String authUserJson(
      int userId,
      String firstName,
      String lastName,
      String email,
      boolean admin,
      boolean support,
      String rolesJson) {
    return """
        {"id":%d,"name":"%s","lastName":"%s","email":"%s","personType":"PF","isAdmin":%s,"isSupport":%s,"roles":%s}
        """
        .formatted(
            userId,
            escapeJson(firstName),
            escapeJson(lastName),
            escapeJson(email),
            admin,
            support,
            rolesJson);
  }

  public static String escapeJson(String value) {
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
