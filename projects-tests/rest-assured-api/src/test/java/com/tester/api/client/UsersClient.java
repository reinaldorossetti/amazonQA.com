package com.tester.api.client;

import com.tester.api.model.request.AddressUpdateRequest;
import com.tester.api.model.request.AdminCreateUserRequest;
import com.tester.api.model.request.LoginRequest;
import com.tester.api.model.request.RegisterUserRequest;
import com.tester.api.model.request.UpdateUserRequest;
import com.tester.api.specs.RequestSpecs;
import io.restassured.response.Response;

import static io.restassured.RestAssured.given;

public final class UsersClient {

  private UsersClient() {}

  public static Response register(RegisterUserRequest payload) {
    return given().spec(RequestSpecs.json()).body(payload).when().post("/users/register");
  }

  public static Response login(LoginRequest payload) {
    return given().spec(RequestSpecs.json()).body(payload).when().post("/users/login");
  }

  public static Response listUsers(String token, String query) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .when()
        .get("/users" + (query == null || query.isBlank() ? "" : "?" + query));
  }

  public static Response createUser(String token, AdminCreateUserRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().post("/users");
  }

  public static Response getUser(String token, int userId) {
    return given().spec(RequestSpecs.bearer(token)).when().get("/users/{id}", userId);
  }

  public static Response updateUser(String token, int userId, UpdateUserRequest payload) {
    return given()
        .spec(RequestSpecs.bearer(token))
        .body(payload)
        .when()
        .put("/users/{id}", userId);
  }

  public static Response deleteUser(String token, int userId) {
    return given().spec(RequestSpecs.bearer(token)).when().delete("/users/{id}", userId);
  }

  public static Response me(String token) {
    return given().spec(RequestSpecs.bearer(token)).when().get("/users/me");
  }

  public static Response updateAddress(String token, AddressUpdateRequest payload) {
    return given().spec(RequestSpecs.bearer(token)).body(payload).when().put("/users/me/address");
  }

  public static Response getAddress(String token) {
    return given().spec(RequestSpecs.bearer(token)).when().get("/users/me/address");
  }

  public static Response terminate(String token, int userId) {
    return given().spec(RequestSpecs.bearer(token)).when().post("/users/{id}/terminate", userId);
  }
}
