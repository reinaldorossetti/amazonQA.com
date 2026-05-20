package com.tester.api.base;

import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeAll;

public abstract class BaseApiTest {

  @BeforeAll
  static void globalSetup() {
    RestAssured.baseURI = EnvironmentConfig.baseUri();
    RestAssured.basePath = EnvironmentConfig.basePath();
    RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    RestAssured.filters(new AllureRestAssured());
  }
}
