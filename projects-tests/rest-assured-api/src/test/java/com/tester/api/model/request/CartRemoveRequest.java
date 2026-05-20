package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CartRemoveRequest(Integer cartItemId) {

  public static CartRemoveRequest byId(int cartItemId) {
    return new CartRemoveRequest(cartItemId);
  }

  public static CartRemoveRequest empty() {
    return new CartRemoveRequest(null);
  }
}
