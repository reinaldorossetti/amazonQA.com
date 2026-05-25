package com.tester.api.fixture;

import java.util.Locale;

import com.tester.api.model.request.RegisterUserRequest;

import net.datafaker.Faker;

public final class UserFixture {

  @SuppressWarnings("deprecation")
  private static final Faker FAKER = new Faker(new Locale("pt", "BR"));
  private static final String DEFAULT_PASSWORD = "Senha@1234";

  private UserFixture() {}

  public static RegisterUserRequest uniquePfUser() {
    return pfUser(FAKER.name().firstName(), FAKER.name().lastName(), randomEmail());
  }

  public static RegisterUserRequest uniquePfUser(String prefix) {
    String localPart =
        "ra." + prefix.toLowerCase(Locale.ROOT) + "." + FAKER.number().digits(8);
    return pfUser(prefix, FAKER.name().lastName(), localPart + "@example.com");
  }

  public static RegisterUserRequest normalUserForProductTest() {
    return pfUser("Product", FAKER.name().lastName(), randomEmail());
  }

  private static RegisterUserRequest pfUser(String firstName, String lastName, String email) {
    return new RegisterUserRequest(
        firstName,
        lastName,
        email,
        DEFAULT_PASSWORD,
        "PF",
        BrazilianDocuments.validCpf(),
        null,
        null);
  }

  private static String randomEmail() {
    return FAKER.internet().emailAddress().toLowerCase(Locale.ROOT);
  }
}
