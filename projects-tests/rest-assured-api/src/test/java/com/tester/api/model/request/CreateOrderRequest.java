package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CreateOrderRequest(
    Double shippingTotal,
    Double discountTotal,
    String paymentMethod,
    List<OrderLineItem> items) {

  public static CreateOrderRequest empty() {
    return new CreateOrderRequest(null, null, null, null);
  }

  public static CreateOrderRequest fromCart(double shippingTotal, double discountTotal, String paymentMethod) {
    return new CreateOrderRequest(shippingTotal, discountTotal, paymentMethod, null);
  }

  public static CreateOrderRequest zeroTotals() {
    return new CreateOrderRequest(0.0, 0.0, null, null);
  }

  public static CreateOrderRequest withItems(List<OrderLineItem> items, Double shipping, Double discount) {
    return new CreateOrderRequest(shipping, discount, null, items);
  }

  public static CreateOrderRequest emptyItems() {
    return new CreateOrderRequest(null, null, null, List.of());
  }

  public static CreateOrderRequest invalidPayment(List<OrderLineItem> items) {
    return new CreateOrderRequest(null, null, "metodo-invalido", items);
  }

  public static CreateOrderRequest negativeShipping(List<OrderLineItem> items) {
    return new CreateOrderRequest(-10.0, null, null, items);
  }

  public static CreateOrderRequest negativeDiscount(List<OrderLineItem> items) {
    return new CreateOrderRequest(null, -5.0, null, items);
  }
}
