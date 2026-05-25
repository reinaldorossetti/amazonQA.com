package com.tester.api.client;

import static com.tester.api.support.ClientLogging.logResponse;
import static io.restassured.RestAssured.given;

import com.tester.api.model.request.PaymentRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class PaymentsClient {

  private static final Logger LOGGER = LogManager.getLogger(PaymentsClient.class);

  private PaymentsClient() {}

  public static Response pay(String token, int orderId, PaymentRequest payload) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .body(payload)
            .when()
            .post("/orders/{id}/payments", orderId);
    logResponse(LOGGER, "pay", response);
    return response;
  }

  public static Response getPayment(String token, int orderId, int paymentId) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .when()
            .get("/orders/{orderId}/payments/{paymentId}", orderId, paymentId);
    logResponse(LOGGER, "getPayment", response);
    return response;
  }

  public static Response downloadBoleto(int orderId, String reference) {
    Response response = given().when().get("/orders/{id}/boleto/{ref}", orderId, reference);
    logResponse(LOGGER, "downloadBoleto", response);
    return response;
  }
}
