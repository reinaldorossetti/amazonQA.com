package com.tester.api.client;

import static com.tester.api.support.ClientLogging.logResponse;
import static io.restassured.RestAssured.given;

import com.tester.api.model.request.CartAddPartialRequest;
import com.tester.api.model.request.CartAddRequest;
import com.tester.api.model.request.CartRemoveRequest;
import com.tester.api.model.request.CartRemoveStringIdRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class CartClient {

  private static final Logger LOGGER = LogManager.getLogger(CartClient.class);

  private CartClient() {}

  public static Response list(String token, String query) {
    Response response =
        given()
            .spec(token == null ? RequestSpecs.json() : RequestSpecs.bearer(token))
            .when()
            .get("/cart" + (query == null || query.isBlank() ? "" : "?" + query));
    logResponse(LOGGER, "list", response);
    return response;
  }

  public static Response getById(String token, int cartItemId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().get("/cart/{id}", cartItemId);
    logResponse(LOGGER, "getById", response);
    return response;
  }

  public static Response add(String token, CartAddRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/cart");
    logResponse(LOGGER, "add", response);
    return response;
  }

  public static Response addPartial(String token, CartAddPartialRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/cart");
    logResponse(LOGGER, "addPartial", response);
    return response;
  }

  public static Response remove(String token, CartRemoveRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().delete("/cart");
    logResponse(LOGGER, "remove", response);
    return response;
  }

  public static Response remove(String token, CartRemoveStringIdRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().delete("/cart");
    logResponse(LOGGER, "removeStringId", response);
    return response;
  }
}
