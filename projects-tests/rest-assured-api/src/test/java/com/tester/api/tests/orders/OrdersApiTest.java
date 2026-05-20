package com.tester.api.tests.orders;

import com.tester.api.base.BaseApiTest;
import com.tester.api.client.CartClient;
import com.tester.api.client.OrdersClient;
import com.tester.api.fixture.UserFixture;
import com.tester.api.model.request.CreateOrderRequest;
import com.tester.api.model.request.OrderLineItem;
import com.tester.api.model.request.UpdateOrderRequest;
import com.tester.api.model.response.OrderResponse;
import com.tester.api.model.response.ProductResponse;
import com.tester.api.specs.RequestSpecs;
import com.tester.api.support.AuthSession;
import com.tester.api.support.TestFlows;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.restassured.response.Response;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@Epic("API")
@Feature("Pedidos")
class OrdersApiTest extends BaseApiTest {

  @Test
  @DisplayName("deve criar pedido a partir do carrinho e limpar carrinho")
  void deveCriarPedidoAPartirDoCarrinhoELimparCarrinho() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createOrderProduct(adminToken);
    int productId = product.id();

    TestFlows.addToCart(user.token(), productId, 2);

    String idempotencyKey = idempotencyKey();
    CreateOrderRequest payload = CreateOrderRequest.fromCart(10, 5, "pix");

    Response createRes = OrdersClient.create(user.token(), payload, idempotencyKey);
    createRes
        .then()
        .statusCode(201)
        .body("id", notNullValue())
        .body("order_number", startsWith("ORD-"))
        .body("status", equalTo("created"))
        .body("items", hasSize(1))
        .body("items[0].product_id", equalTo(productId));

    CartClient.list(user.token(), "userId=" + user.userId())
        .then()
        .statusCode(200)
        .body("", hasSize(0));

    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve respeitar idempotência no POST /orders")
  void deveRespeitarIdempotenciaNoPostOrders() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createOrderProduct(adminToken);
    int productId = product.id();

    TestFlows.addToCart(user.token(), productId, 1);

    String key = idempotencyKey();
    CreateOrderRequest payload = CreateOrderRequest.zeroTotals();

    Response first = OrdersClient.create(user.token(), payload, key);
    first.then().statusCode(201);
    OrderResponse firstOrder = first.as(OrderResponse.class);
    int firstId = firstOrder.id();
    String firstOrderNumber = firstOrder.orderNumber();

    Response second = OrdersClient.create(user.token(), payload, key);
    second
        .then()
        .statusCode(200)
        .body("id", equalTo(firstId))
        .body("order_number", equalTo(firstOrderNumber));

    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar pedido com carrinho vazio")
  void deveRetornar400AoCriarPedidoComCarrinhoVazio() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    OrdersClient.create(user.token(), CreateOrderRequest.empty(), null)
        .then()
        .statusCode(400)
        .body("error", equalTo("Empty cart"));
  }

  @Test
  @DisplayName("deve retornar 401 sem token no POST /orders")
  void deveRetornar401SemTokenNoPostOrders() {
    given()
        .spec(RequestSpecs.json())
        .body(CreateOrderRequest.empty())
        .when()
        .post("/orders")
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve listar pedidos do usuário autenticado")
  void deveListarPedidosDoUsuarioAutenticado() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createOrderProduct(adminToken);
    int productId = product.id();

    TestFlows.addToCart(user.token(), productId, 1);
    OrdersClient.create(user.token(), CreateOrderRequest.empty(), null).then().statusCode(201);

    OrdersClient.list(user.token(), "page=1&pageSize=10")
        .then()
        .statusCode(200)
        .body("items", not(empty()))
        .body("total", greaterThan(0));

    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve bloquear acesso a pedido de outro usuário (403)")
  void deveBloquearAcessoAPedidoDeOutroUsuario() {
    var userA = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    var userB = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createOrderProduct(adminToken);
    int productId = product.id();

    TestFlows.addToCart(userA.token(), productId, 1);
    int orderId =
        OrdersClient.create(userA.token(), CreateOrderRequest.empty(), null)
            .as(OrderResponse.class)
            .id();

    OrdersClient.getById(userB.token(), orderId).then().statusCode(403);

    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve retornar 401 ao tentar alterar pedido sem autenticação")
  void deveRetornar401AoTentarAlterarPedidoSemAutenticacao() {
    given()
        .spec(RequestSpecs.json())
        .body(UpdateOrderRequest.status("paid"))
        .when()
        .put("/orders/9999")
        .then()
        .statusCode(401)
        .body("error", notNullValue());
  }

  @Test
  @DisplayName("deve retornar 404 ao cancelar pedido inexistente com usuário autenticado")
  void deveRetornar404AoCancelarPedidoInexistente() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    OrdersClient.cancel(user.token(), 999_999_999)
        .then()
        .statusCode(404)
        .body("error", equalTo("Order not found"));
  }

  @Test
  @DisplayName("deve retornar 400 para id inválido no GET /orders/{id}")
  void deveRetornar400ParaIdInvalidoNoGetOrders() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    given()
        .spec(RequestSpecs.bearer(user.token()))
        .when()
        .get("/orders/INVALID_ID")
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid order ID"));
  }

  @Test
  @DisplayName("deve retornar 400 ao criar pedido com items vazio no payload")
  void deveRetornar400AoCriarPedidoComItemsVazio() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    OrdersClient.create(user.token(), CreateOrderRequest.emptyItems(), null)
        .then()
        .statusCode(400)
        .body("error", equalTo("items must be a non-empty array when provided"));
  }

  @Test
  @DisplayName("deve criar pedido com items no payload quando carrinho estiver vazio")
  void deveCriarPedidoComItemsQuandoCarrinhoVazio() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createOrderProduct(adminToken);
    int productId = product.id();

    CreateOrderRequest payload =
        CreateOrderRequest.withItems(
            List.of(new OrderLineItem(productId, 1)), 5.0, 0.0);

    OrdersClient.create(user.token(), payload, null)
        .then()
        .statusCode(201)
        .body("status", equalTo("created"))
        .body("items", not(empty()))
        .body("items[0].product_id", equalTo(productId));

    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve listar pedidos paginados e validar campos de paginação")
  void deveListarPedidosPaginadosEValidarCamposDePaginacao() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    OrdersClient.list(user.token(), "page=2&pageSize=10")
        .then()
        .statusCode(200)
        .body("page", equalTo(2))
        .body("pageSize", equalTo(10))
        .body("items", notNullValue())
        .body("total", notNullValue());
  }

  @Test
  @DisplayName("deve retornar 400 para transição de status inválida")
  void deveRetornar400ParaTransicaoDeStatusInvalida() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createOrderProduct(adminToken);
    int productId = product.id();

    TestFlows.addToCart(user.token(), productId, 1);
    int orderId =
        OrdersClient.create(user.token(), CreateOrderRequest.empty(), null)
            .as(OrderResponse.class)
            .id();

    OrdersClient.update(user.token(), orderId, UpdateOrderRequest.status("delivered"))
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid status transition"));

    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar pedido com método de pagamento inválido")
  void deveRetornar400AoCriarPedidoComMetodoDePagamentoInvalido() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    CreateOrderRequest payload =
        CreateOrderRequest.invalidPayment(List.of(new OrderLineItem(1, 1)));

    OrdersClient.create(user.token(), payload, null).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar pedido com valor de frete negativo")
  void deveRetornar400AoCriarPedidoComFreteNegativo() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    CreateOrderRequest payload =
        CreateOrderRequest.negativeShipping(List.of(new OrderLineItem(1, 1)));

    OrdersClient.create(user.token(), payload, null).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar pedido com desconto negativo")
  void deveRetornar400AoCriarPedidoComDescontoNegativo() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    CreateOrderRequest payload =
        CreateOrderRequest.negativeDiscount(List.of(new OrderLineItem(1, 1)));

    OrdersClient.create(user.token(), payload, null).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 404 ao tentar atualizar status de pedido inexistente")
  void deveRetornar404AoAtualizarPedidoInexistente() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    OrdersClient.update(user.token(), 999_999_999, UpdateOrderRequest.status("paid"))
        .then()
        .statusCode(404);
  }

  @Test
  @DisplayName("deve retornar 401 ao tentar atualizar pedido sem autenticação")
  void deveRetornar401AoAtualizarPedidoSemAutenticacao() {
    given()
        .spec(RequestSpecs.json())
        .body(UpdateOrderRequest.status("paid"))
        .when()
        .put("/orders/1")
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar pedido com quantidade zero em items")
  void deveRetornar400AoCriarPedidoComQuantidadeZero() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Order"));

    CreateOrderRequest payload =
        CreateOrderRequest.withItems(List.of(new OrderLineItem(1, 0)), null, null);

    OrdersClient.create(user.token(), payload, null).then().statusCode(400);
  }

  private static String idempotencyKey() {
    return "idem-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 10000);
  }
}
