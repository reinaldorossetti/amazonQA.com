package com.tester.api.client;

import com.tester.api.model.request.CreateOrderRequest;
import com.tester.api.model.request.UpdateOrderRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;

import static io.restassured.RestAssured.given;

public final class OrdersClient {

  private OrdersClient() {}

  public static Response create(String token, CreateOrderRequest payload, String idempotencyKey) {
    var spec = given().spec(RequestSpecs.bearer(token)).body(payload);
    if (idempotencyKey != null && !idempotencyKey.isBlank()) {
      spec = spec.header("Idempotency-Key", idempotencyKey);
    }
    return spec.when().post("/orders");
  }

  public static Response list(String token, String query) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .when()
        .get("/orders" + (query == null || query.isBlank() ? "" : "?" + query));
  }

  public static Response getById(String token, int orderId) {
    return given().spec(RequestSpecs.bearer(token)).when().get("/orders/{id}", orderId);
  }

  public static Response update(String token, int orderId, UpdateOrderRequest payload) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .body(payload)
        .when()
        .put("/orders/{id}", orderId);
  }

  public static Response cancel(String token, int orderId) {
    return given().spec(RequestSpecs.bearer(token)).when().delete("/orders/{id}", orderId);
  }
}
