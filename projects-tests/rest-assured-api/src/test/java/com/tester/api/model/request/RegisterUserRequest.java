package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RegisterUserRequest(
    String firstName,
    String lastName,
    String email,
    String password,
    String personType,
    String cpf,
    String cnpj,
    String companyName) {

  public static RegisterUserRequest firstNameOnly(String firstName) {
    return new RegisterUserRequest(firstName, null, null, null, null, null, null, null);
  }

  public RegisterUserRequest withEmail(String email) {
    return new RegisterUserRequest(firstName, lastName, email, password, personType, cpf, cnpj, companyName);
  }

  public RegisterUserRequest withPassword(String password) {
    return new RegisterUserRequest(firstName, lastName, email, password, personType, cpf, cnpj, companyName);
  }

  public RegisterUserRequest withoutPersonType() {
    return new RegisterUserRequest(firstName, lastName, email, password, null, cpf, cnpj, companyName);
  }

  public RegisterUserRequest withPersonType(String personType) {
    return new RegisterUserRequest(firstName, lastName, email, password, personType, cpf, cnpj, companyName);
  }

  public RegisterUserRequest withCpf(String cpf) {
    return new RegisterUserRequest(firstName, lastName, email, password, personType, cpf, cnpj, companyName);
  }

  public RegisterUserRequest withoutCpf() {
    return new RegisterUserRequest(firstName, lastName, email, password, personType, null, cnpj, companyName);
  }

  public static RegisterUserRequest pfFirst(String suffix, String cpf) {
    return new RegisterUserRequest(
        "CPF",
        "Primeiro-" + suffix,
        "cpf.first." + suffix + "." + (int) (Math.random() * 10000) + "@example.com",
        "Senha@1234",
        "PF",
        cpf,
        null,
        null);
  }

  public static RegisterUserRequest pfSecond(String suffix, String cpf) {
    return new RegisterUserRequest(
        "CPF",
        "Segundo-" + suffix,
        "cpf.second." + suffix + "@example.com",
        "Senha@1234",
        "PF",
        cpf,
        null,
        null);
  }

  public static RegisterUserRequest pjFirst(String suffix, String cnpj, String companyName) {
    return new RegisterUserRequest(
        "PJ",
        "Primeiro-" + suffix,
        "cnpj.first." + suffix + "." + (int) (Math.random() * 10000) + "@example.com",
        "Senha@1234",
        "PJ",
        null,
        cnpj,
        companyName);
  }

  public static RegisterUserRequest e2eNormal(
      String suffix, String firstName, String lastName, String cpf) {
    return new RegisterUserRequest(
        firstName,
        lastName,
        "e2e-normal-" + suffix + "@example.com",
        "Normal@1234",
        "PF",
        cpf,
        null,
        null);
  }

  public static RegisterUserRequest pjSecond(String suffix, String cnpj, String companyName) {
    return new RegisterUserRequest(
        "PJ",
        "Segundo-" + suffix,
        "cnpj.second." + suffix + "@example.com",
        "Senha@1234",
        "PJ",
        null,
        cnpj,
        companyName);
  }
}
