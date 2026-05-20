package com.tester.api.client;

import com.tester.api.model.request.ProductRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;

import static io.restassured.RestAssured.given;

public final class ProductsClient {

  private ProductsClient() {}

  public static Response list(String query) {
    return given()
        .when()
        .get("/products" + (query == null || query.isBlank() ? "" : "?" + query));
  }

  public static Response getById(int productId) {
    return given().when().get("/products/{id}", productId);
  }

  public static Response create(String token, ProductRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/products");
  }

  public static Response update(String token, int productId, ProductRequest payload) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .body(payload)
        .when()
        .put("/products/{id}", productId);
  }

  public static Response delete(String token, int productId) {
    return given().spec(RequestSpecs.bearer(token)).when().delete("/products/{id}", productId);
  }
}
