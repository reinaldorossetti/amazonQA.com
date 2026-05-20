package com.tester.api.support;

import com.tester.api.client.CartClient;
import com.tester.api.client.OrdersClient;
import com.tester.api.client.ProductsClient;
import com.tester.api.fixture.ProductFixture;
import com.tester.api.fixture.UserFixture;
import com.tester.api.model.request.CartAddRequest;
import com.tester.api.model.request.CreateOrderRequest;
import com.tester.api.model.response.OrderResponse;
import com.tester.api.model.response.ProductResponse;
import io.restassured.response.Response;

public final class TestFlows {

  private TestFlows() {}

  public static AuthSession.RegisteredUser registerUser() {
    return AuthSession.registerAndLogin(UserFixture.uniquePfUser());
  }

  public static AuthSession.RegisteredUser registerUser(String prefix) {
    return AuthSession.registerAndLogin(UserFixture.uniquePfUser(prefix));
  }

  public static ProductResponse createProduct(String adminToken) {
    String suffix = String.valueOf(System.currentTimeMillis());
    Response response = ProductsClient.create(adminToken, ProductFixture.catalogProduct(suffix));
    if (response.statusCode() != 201) {
      throw new IllegalStateException("Product create failed: " + response.statusCode());
    }
    return response.as(ProductResponse.class);
  }

  public static ProductResponse createOrderProduct(String adminToken) {
    String suffix = System.currentTimeMillis() + "-" + (int) (Math.random() * 10000);
    Response response = ProductsClient.create(adminToken, ProductFixture.orderProduct(suffix));
    if (response.statusCode() != 201) {
      throw new IllegalStateException("Product create failed: " + response.statusCode());
    }
    return response.as(ProductResponse.class);
  }

  public static void deleteProduct(String adminToken, int productId) {
    ProductsClient.delete(adminToken, productId);
  }

  public static void addToCart(String token, int productId, int quantity) {
    Response response = CartClient.add(token, CartAddRequest.single(productId, quantity));
    if (response.statusCode() != 201) {
      throw new IllegalStateException("Add to cart failed: " + response.statusCode());
    }
  }

  public static OrderResponse createOrderFromCart(String token) {
    Response response = OrdersClient.create(token, CreateOrderRequest.empty(), null);
    if (response.statusCode() != 201) {
      throw new IllegalStateException("Order create failed: " + response.statusCode());
    }
    return response.as(OrderResponse.class);
  }

  public static OrderContext createOrderForUser() {
    AuthSession.RegisteredUser user = registerUser();
    String adminToken = AuthSession.adminToken();
    ProductResponse product = createOrderProduct(adminToken);
    addToCart(user.token(), product.id(), 1);
    OrderResponse order = createOrderFromCart(user.token());
    return new OrderContext(user, product, order, adminToken);
  }

  public record OrderContext(
      AuthSession.RegisteredUser user,
      ProductResponse product,
      OrderResponse order,
      String adminToken) {

    public String token() {
      return user.token();
    }

    public int orderId() {
      return order.id();
    }

    public int productId() {
      return product.id();
    }

    public double grandTotal() {
      return order.grandTotal();
    }
  }
}
