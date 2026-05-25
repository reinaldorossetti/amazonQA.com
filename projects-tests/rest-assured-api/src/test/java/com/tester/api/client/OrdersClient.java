package com.tester.api.client;

import static com.tester.api.support.ClientLogging.logResponse;
import static io.restassured.RestAssured.given;

import com.tester.api.model.request.CreateOrderRequest;
import com.tester.api.model.request.UpdateOrderRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class OrdersClient {

  private static final Logger LOGGER = LogManager.getLogger(OrdersClient.class);

  private OrdersClient() {}

  public static Response create(String token, CreateOrderRequest payload, String idempotencyKey) {
    var spec = given().spec(RequestSpecs.bearer(token)).body(payload);
    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
      spec = spec.header("Idempotency-Key", idempotencyKey);
    }
    Response response = spec.when().post("/orders");
    logResponse(LOGGER, "create", response);
    return response;
  }

  public static Response list(String token, String query) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .when()
            .get("/orders" + (query == null || query.isBlank() ? "" : "?" + query));
    logResponse(LOGGER, "list", response);
    return response;
  }

  public static Response getById(String token, int orderId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().get("/orders/{id}", orderId);
    logResponse(LOGGER, "getById", response);
    return response;
  }

  public static Response update(String token, int orderId, UpdateOrderRequest payload) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .body(payload)
            .when()
            .put("/orders/{id}", orderId);
    logResponse(LOGGER, "update", response);
    return response;
  }

  public static Response cancel(String token, int orderId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().delete("/orders/{id}", orderId);
    logResponse(LOGGER, "cancel", response);
    return response;
  }
}
