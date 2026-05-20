package com.tester.api.fixture;

import com.tester.api.model.request.ProductRequest;
import net.datafaker.Faker;

public final class ProductFixture {

  private static final Faker FAKER = new Faker();

  private ProductFixture() {}

  public static ProductRequest randomProduct() {
    String suffix = String.valueOf(System.currentTimeMillis());
    return new ProductRequest(
        FAKER.commerce().productName() + " " + suffix,
        Double.parseDouble(FAKER.commerce().price(10, 9999)),
        FAKER.lorem().sentence(),
        FAKER.commerce().department() + "-" + suffix,
        FAKER.internet().url(),
        FAKER.company().name(),
        FAKER.commerce().material(),
        FAKER.regexify("[A-Z0-9]{6}"),
        0.0);
  }

  public static ProductRequest catalogProduct(String suffix) {
    return new ProductRequest(
        "Produto RA " + suffix,
        49.9,
        "Produto para teste de carrinho",
        "Cart-" + suffix,
        null,
        null,
        null,
        null,
        null);
  }

  public static ProductRequest orderProduct(String suffix) {
    return new ProductRequest(
        "Produto Pedido " + suffix,
        79.9,
        "Produto para teste de pedidos",
        "Orders-" + suffix,
        null,
        null,
        null,
        null,
        null);
  }

  public static ProductRequest playwrightLifecycle(String suffix) {
    return new ProductRequest(
        "Produto Playwright " + suffix,
        123.45,
        "Produto para teste automatizado",
        "Playwright-" + suffix,
        "https://example.com/pw-product.jpg",
        "PW",
        "Automation",
        "PW-1",
        null);
  }
}
