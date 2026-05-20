package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaymentRequest(
    String method,
    Double amount,
    String cardNumber,
    String holderName,
    String expiry,
    String cvv,
    Integer installments) {

  public static PaymentRequest empty() {
    return new PaymentRequest(null, null, null, null, null, null, null);
  }

  public static PaymentRequest pix(double amount) {
    return new PaymentRequest("pix", amount, null, null, null, null, null);
  }

  public static PaymentRequest boleto(double amount) {
    return new PaymentRequest("boleto", amount, null, null, null, null, null);
  }

  public static PaymentRequest credit(double amount) {
    return new PaymentRequest(
        "credit", amount, "4111111111111111", "Teste QA", "12/30", "123", 1);
  }

  public static PaymentRequest debit(double amount) {
    return new PaymentRequest("debit", amount, "5555555555554444", null, null, null, 1);
  }

  public static PaymentRequest creditExceeding(double amount) {
    return new PaymentRequest("credit", amount, "4111111111111111", null, null, null, null);
  }

  public static PaymentRequest invalidMethod() {
    return new PaymentRequest("bitcoin", null, null, null, null, null, null);
  }

  public static PaymentRequest creditMinimal(double amount) {
    return new PaymentRequest("credit", amount, "4111111111111111", null, null, null, null);
  }
}
