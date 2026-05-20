package com.tester.api.model.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record LoginResponse(
    String accessToken, String tokenType, UserSummary user) {

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record UserSummary(
      int id,
      String email,
      Boolean isAdmin,
      List<String> roles) {}
}
