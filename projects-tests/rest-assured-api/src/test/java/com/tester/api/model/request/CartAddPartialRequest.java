package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CartAddPartialRequest(List<PartialCartLine> products) {

  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record PartialCartLine(Integer productId, Integer quantity) {}

  public static CartAddPartialRequest quantityOnly(int quantity) {
    return new CartAddPartialRequest(List.of(new PartialCartLine(null, quantity)));
  }
}
