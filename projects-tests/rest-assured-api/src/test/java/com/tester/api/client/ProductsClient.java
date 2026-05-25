package com.tester.api.client;

import static com.tester.api.support.ClientLogging.logResponse;
import static io.restassured.RestAssured.given;

import com.tester.api.model.request.ProductRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class ProductsClient {

  private static final Logger LOGGER = LogManager.getLogger(ProductsClient.class);

  private ProductsClient() {}

  public static Response list(String query) {
    Response response =
        given()
            .when()
            .get("/products" + (query == null || query.isBlank() ? "" : "?" + query));
    logResponse(LOGGER, "list", response);
    return response;
  }

  public static Response getById(int productId) {
    Response response = given().when().get("/products/{id}", productId);
    logResponse(LOGGER, "getById", response);
    return response;
  }

  public static Response create(String token, ProductRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/products");
    logResponse(LOGGER, "create", response);
    return response;
  }

  public static Response update(String token, int productId, ProductRequest payload) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .body(payload)
            .when()
            .put("/products/{id}", productId);
    logResponse(LOGGER, "update", response);
    return response;
  }

  public static Response delete(String token, int productId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().delete("/products/{id}", productId);
    logResponse(LOGGER, "delete", response);
    return response;
  }
}
