package com.tester.api.client;

import static com.tester.api.support.ClientLogging.logResponse;
import static io.restassured.RestAssured.given;

import com.tester.api.model.request.AddressUpdateRequest;
import com.tester.api.model.request.AdminCreateUserRequest;
import com.tester.api.model.request.LoginRequest;
import com.tester.api.model.request.RegisterUserRequest;
import com.tester.api.model.request.UpdateUserRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;
import java.util.function.Supplier;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public final class UsersClient {

  private static final Logger LOGGER = LogManager.getLogger(UsersClient.class);

  private UsersClient() {}

  public static Response register(RegisterUserRequest payload) {
    Response response = given().spec(RequestSpecs.json()).body(payload).when().post("/users/register");
    logResponse(LOGGER, "register", response);
    return response;
  }

  public static Response login(LoginRequest payload) {
    Response response = given().spec(RequestSpecs.json()).body(payload).when().post("/users/login");
    logResponse(LOGGER, "login", response);
    return response;
  }

  public static Response listUsers(String token, String query) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .when()
            .get("/users" + (query == null || query.isBlank() ? "" : "?" + query));
    logResponse(LOGGER, "listUsers", response);
    return response;
  }

  public static Response createUser(String token, AdminCreateUserRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/users");
    logResponse(LOGGER, "createUser", response);
    return response;
  }

  public static Response getUser(String token, int userId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().get("/users/{id}", userId);
    logResponse(LOGGER, "getUser", response);
    return response;
  }

  public static Response updateUser(String token, int userId, UpdateUserRequest payload) {
    Response response =
        given()
            .spec(RequestSpecs.bearer(token))
            .body(payload)
            .when()
            .put("/users/{id}", userId);
    logResponse(LOGGER, "updateUser", response);
    return response;
  }

  public static Response deleteUser(String token, int userId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().delete("/users/{id}", userId);
    logResponse(LOGGER, "deleteUser", response);
    return response;
  }

  public static Response me(String token) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().get("/users/me");
    logResponse(LOGGER, "me", response);
    return response;
  }

  public static Response updateAddress(String token, AddressUpdateRequest payload) {
    Response response = given().spec(RequestSpecs.bearer(token)).body(payload).when().put("/users/me/address");
    logResponse(LOGGER, "updateAddress", response);
    return response;
  }

  public static Response getAddress(String token) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().get("/users/me/address");
    logResponse(LOGGER, "getAddress", response);
    return response;
  }

  public static Response terminate(String token, int userId) {
    Response response = given().spec(RequestSpecs.bearer(token)).when().post("/users/{id}/terminate", userId);
    logResponse(LOGGER, "terminate", response);
    return response;
  }

  public static Response registerUntilCreated(Supplier<RegisterUserRequest> factory) {
    Response response = null;
    for (int attempt = 0; attempt < 5; attempt++) {
      response = register(factory.get());
      if (response.statusCode() == 201) {
        return response;
      }
    }
    if (response == null) {
      throw new IllegalStateException(
          "Não foi possível criar um usuário válido após múltiplas tentativas.");
    }
    return response;
  }
}
