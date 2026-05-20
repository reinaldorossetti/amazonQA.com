package com.tester.api.specs;

import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.ResponseSpecification;

public final class ResponseSpecs {

  private ResponseSpecs() {}

  public static ResponseSpecification okJson() {
    return new ResponseSpecBuilder()
        .expectStatusCode(200)
        .expectContentType(ContentType.JSON)
        .build();
  }

  public static ResponseSpecification createdJson() {
    return new ResponseSpecBuilder()
        .expectStatusCode(201)
        .expectContentType(ContentType.JSON)
        .build();
  }
}
