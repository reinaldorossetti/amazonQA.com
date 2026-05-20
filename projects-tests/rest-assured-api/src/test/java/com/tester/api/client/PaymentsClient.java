package com.tester.api.client;

import com.tester.api.model.request.PaymentRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;

import static io.restassured.RestAssured.given;

public final class PaymentsClient {

  private PaymentsClient() {}

  public static Response pay(String token, int orderId, PaymentRequest payload) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .body(payload)
        .when()
        .post("/orders/{id}/payments", orderId);
  }

  public static Response getPayment(String token, int orderId, int paymentId) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .when()
        .get("/orders/{orderId}/payments/{paymentId}", orderId, paymentId);
  }

  public static Response downloadBoleto(int orderId, String reference) {
    return given().when().get("/orders/{id}/boleto/{ref}", orderId, reference);
  }
}
