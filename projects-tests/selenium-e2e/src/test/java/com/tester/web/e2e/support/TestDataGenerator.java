package com.tester.web.e2e.support;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import net.datafaker.Faker;

public final class TestDataGenerator {

  private static final Faker FAKER = new Faker(new Locale("pt", "BR"));

  private TestDataGenerator() {}

  public static UserData randomUser() {
    return new UserData(
        FAKER.name().firstName(),
        FAKER.name().lastName(),
        FAKER.internet().emailAddress().toLowerCase(Locale.ROOT),
        "Senha@1234");
  }

  public static String invalidEmail() {
    return FAKER.lorem().word() + FAKER.lorem().word() + ".com";
  }

  public static String shortPassword() {
    return FAKER.lorem().characters(5);
  }

  public static String differentPassword() {
    return "Different@" + FAKER.number().digits(8);
  }

  public static String emailFaker() {
    return FAKER.internet().emailAddress().toLowerCase(Locale.ROOT);
  }

  /** Eight numeric digits for unique emails, product names, and search terms in E2E data. */
  public static String randomNumeric8() {
    return FAKER.number().digits(8);
  }

  public static String validCpf() {
    List<Integer> digits = new ArrayList<>(9);
    for (int i = 0; i < 9; i++) {
      digits.add(FAKER.number().numberBetween(0, 9));
    }

    int firstDigit = calculateVerifier(digits, 10);
    digits.add(firstDigit);
    int secondDigit = calculateVerifier(digits, 11);
    digits.add(secondDigit);

    return String.format(
        "%d%d%d.%d%d%d.%d%d%d-%d%d",
        digits.get(0),
        digits.get(1),
        digits.get(2),
        digits.get(3),
        digits.get(4),
        digits.get(5),
        digits.get(6),
        digits.get(7),
        digits.get(8),
        digits.get(9),
        digits.get(10));
  }

  private static int calculateVerifier(List<Integer> digits, int factorStart) {
    int sum = 0;
    for (int i = 0; i < digits.size(); i++) {
      sum += digits.get(i) * (factorStart - i);
    }
    int remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  public record UserData(String firstName, String lastName, String email, String password) {}
}
