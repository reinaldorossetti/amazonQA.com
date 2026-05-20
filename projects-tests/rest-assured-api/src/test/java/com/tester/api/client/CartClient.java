package com.tester.api.client;

import com.tester.api.model.request.CartAddPartialRequest;
import com.tester.api.model.request.CartAddRequest;
import com.tester.api.model.request.CartRemoveRequest;
import com.tester.api.model.request.CartRemoveStringIdRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;

import static io.restassured.RestAssured.given;

public final class CartClient {

  private CartClient() {}

  public static Response list(String token, String query) {
    return given()
        .spec(token == null ? RequestSpecs.json() : RequestSpecs.bearer(token))
        .when()
        .get("/cart" + (query == null || query.isBlank() ? "" : "?" + query));
  }

  public static Response getById(String token, int cartItemId) {
    return given().spec(RequestSpecs.bearer(token)).when().get("/cart/{id}", cartItemId);
  }

  public static Response add(String token, CartAddRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/cart");
  }

  public static Response addPartial(String token, CartAddPartialRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/cart");
  }

  public static Response remove(String token, CartRemoveRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().delete("/cart");
  }

  public static Response remove(String token, CartRemoveStringIdRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().delete("/cart");
  }
}
