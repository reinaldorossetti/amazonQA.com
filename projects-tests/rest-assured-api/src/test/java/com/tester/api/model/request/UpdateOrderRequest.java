package com.tester.api.model.request;

public record UpdateOrderRequest(String status) {

  public static UpdateOrderRequest status(String status) {
    return new UpdateOrderRequest(status);
  }
}
