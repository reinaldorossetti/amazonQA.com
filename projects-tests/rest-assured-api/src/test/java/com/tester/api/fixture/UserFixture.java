package com.tester.api.fixture;

import com.tester.api.model.request.RegisterUserRequest;

public final class UserFixture {

  private UserFixture() {}

  public static RegisterUserRequest uniquePfUser() {
    String suffix = System.currentTimeMillis() + "-" + (int) (Math.random() * 10000);
    return new RegisterUserRequest(
        "RestAssured",
        "User-" + suffix,
        "ra.user." + suffix + "@example.com",
        "Senha@1234",
        "PF",
        BrazilianDocuments.validCpf(),
        null,
        null);
  }

  public static RegisterUserRequest uniquePfUser(String prefix) {
    String suffix = System.currentTimeMillis() + "-" + (int) (Math.random() * 10000);
    return new RegisterUserRequest(
        prefix,
        prefix + "-" + suffix,
        "ra." + prefix.toLowerCase() + "." + suffix + "@example.com",
        "Senha@1234",
        "PF",
        BrazilianDocuments.validCpf(),
        null,
        null);
  }

  public static RegisterUserRequest normalUserForProductTest() {
    String suffix = String.valueOf(System.currentTimeMillis());
    return new RegisterUserRequest(
        "Product",
        "Tester",
        "ra.product." + suffix + "@example.com",
        "Senha@1234",
        "PF",
        BrazilianDocuments.validCpf(),
        null,
        null);
  }
}
