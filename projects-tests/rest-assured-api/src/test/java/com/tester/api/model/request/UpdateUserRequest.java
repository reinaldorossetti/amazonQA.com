package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UpdateUserRequest(String firstName) {

  public static UpdateUserRequest firstName(String firstName) {
    return new UpdateUserRequest(firstName);
  }

  public static UpdateUserRequest empty() {
    return new UpdateUserRequest(null);
  }
}
