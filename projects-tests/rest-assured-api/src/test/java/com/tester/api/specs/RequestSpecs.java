package com.tester.api.specs;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

public final class RequestSpecs {

  private RequestSpecs() {}

  public static RequestSpecification json() {
    return new RequestSpecBuilder()
        .setContentType(ContentType.JSON)
        .setAccept(ContentType.JSON)
        .build();
  }

  public static RequestSpecification bearer(String token) {
    return new RequestSpecBuilder()
        .addRequestSpecification(json())
        .addHeader("Authorization", "Bearer " + token)
        .build();
  }

  public static RequestSpecification idempotency(String key) {
    return new RequestSpecBuilder()
        .addHeader("Idempotency-Key", key)
        .build();
  }
}
