package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AddressUpdateRequest(String addressZip, String addressCity) {

  public static AddressUpdateRequest saoPaulo() {
    return new AddressUpdateRequest("01001-000", "São Paulo");
  }

  public static AddressUpdateRequest rio() {
    return new AddressUpdateRequest("20000-000", "Rio de Janeiro");
  }

  public static AddressUpdateRequest empty() {
    return new AddressUpdateRequest(null, null);
  }
}
