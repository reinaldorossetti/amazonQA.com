package com.tester.web.e2e.support;

public interface RegisterValidation {

  String VALID_PHONE = "(11) 91234-5678";
  String VALID_ZIP_CODE = "01001-000";
  String ADDRESS_NUMBER = "999";

  String ERROR_FIRST_NAME_REQUIRED = "Nome é obrigatório.";
  String ERROR_LAST_NAME_REQUIRED = "Sobrenome é obrigatório.";
  String ERROR_CPF_INVALID = "CPF inválido.";
  String ERROR_EMAIL_INVALID = "Email inválido.";
  String ERROR_PHONE_INVALID = "Telefone inválido.";
  String ERROR_PASSWORD_MIN_LENGTH = "Mínimo 8 caracteres.";
  String ERROR_PASSWORD_MISMATCH = "As senhas não coincidem";
  String ERROR_EMAIL_DUPLICATE = "Email já cadastrado";

  String SUCCESS_MESSAGE = "Cadastro realizado com sucesso!";
}
