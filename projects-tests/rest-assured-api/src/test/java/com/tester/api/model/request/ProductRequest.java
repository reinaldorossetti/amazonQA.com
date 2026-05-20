package com.tester.api.model.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.tester.api.model.response.ProductResponse;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProductRequest(
    String name,
    Double price,
    String description,
    String category,
    String image,
    String manufacturer,
    String line,
    String model,
    Double shippingCost) {

  public static ProductRequest descriptionOnly(String description) {
    return new ProductRequest(null, null, description, null, null, null, null, null, null);
  }

  public static ProductRequest minimal(String name, double price, String category) {
    return new ProductRequest(name, price, null, category, null, null, null, null, null);
  }

  public static ProductRequest negativePrice() {
    return new ProductRequest("Preço Negativo", -10.50, null, "Test", null, null, null, null, null);
  }

  public static ProductRequest withoutCategory(String name, double price) {
    return new ProductRequest(name, price, null, null, null, null, null, null, null);
  }

  public static ProductRequest from(ProductResponse product) {
    return new ProductRequest(
        product.name(),
        product.price(),
        product.description(),
        product.category(),
        product.image(),
        product.manufacturer(),
        product.line(),
        product.model(),
        product.shippingCost());
  }

  public ProductRequest withName(String name) {
    return new ProductRequest(
        name, price, description, category, image, manufacturer, line, model, shippingCost);
  }

  public ProductRequest withCategory(String category) {
    return new ProductRequest(
        name, price, description, category, image, manufacturer, line, model, shippingCost);
  }

  public ProductRequest withPrice(double price) {
    return new ProductRequest(
        name, price, description, category, image, manufacturer, line, model, shippingCost);
  }

  public ProductRequest withShippingCost(double shippingCost) {
    return new ProductRequest(
        name, price, description, category, image, manufacturer, line, model, shippingCost);
  }

  public ProductRequest withoutName() {
    return new ProductRequest(
        null, price, description, category, image, manufacturer, line, model, shippingCost);
  }

  public ProductRequest withoutPrice() {
    return new ProductRequest(
        name, null, description, category, image, manufacturer, line, model, shippingCost);
  }

  public ProductRequest withoutShippingCost() {
    return new ProductRequest(
        name, price, description, category, image, manufacturer, line, model, null);
  }
}
