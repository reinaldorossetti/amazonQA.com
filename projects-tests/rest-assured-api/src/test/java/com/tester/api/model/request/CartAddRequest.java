package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CartAddRequest(List<CartLineItem> products) {

  public static CartAddRequest emptyBody() {
    return new CartAddRequest(null);
  }

  public static CartAddRequest single(int productId, int quantity) {
    return new CartAddRequest(List.of(new CartLineItem(productId, quantity)));
  }

  public static CartAddRequest of(CartLineItem... lines) {
    return new CartAddRequest(List.of(lines));
  }

  public static CartAddRequest empty() {
    return new CartAddRequest(List.of());
  }
}
