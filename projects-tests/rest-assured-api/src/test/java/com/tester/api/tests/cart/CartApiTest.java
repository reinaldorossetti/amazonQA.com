package com.tester.api.tests.cart;

import com.tester.api.base.BaseApiTest;
import com.tester.api.client.CartClient;
import com.tester.api.model.request.CartAddPartialRequest;
import com.tester.api.model.request.CartAddRequest;
import com.tester.api.model.request.CartLineItem;
import com.tester.api.model.request.CartRemoveRequest;
import com.tester.api.model.request.CartRemoveStringIdRequest;
import com.tester.api.model.response.ProductResponse;
import com.tester.api.specs.RequestSpecs;
import com.tester.api.support.AuthSession;
import com.tester.api.support.TestFlows;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;

@Epic("API")
@Feature("Cart")
class CartApiTest extends BaseApiTest {

  private static final int NONEXISTENT_CART_ITEM_ID = 999_999_999;
  private static final int NONEXISTENT_PRODUCT_ID = 999_999_999;
  private static final int ALT_NONEXISTENT_CART_ITEM_ID = 888_888_888;
  private static final int UNKNOWN_PRODUCT_ID = 987_654_321;

  @Test
  @DisplayName("deve adicionar, incrementar, listar e remover item do carrinho")
  void deveAdicionarIncrementarListarERemoverItemDoCarrinho() {
    var user = TestFlows.registerUser("Cart");
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createProduct(adminToken);
    int productId = product.id();
    String token = user.token();
    CartClient.add(token, CartAddRequest.single(productId, 2)).then().statusCode(201);
    CartClient.add(token, CartAddRequest.single(productId, 1)).then().statusCode(201);
    var listRes = CartClient.list(token, "userId=" + user.userId());
    listRes.then().statusCode(200).body("size()", greaterThan(0)).body("[0].quantity", equalTo(3));
    int cartItemId = listRes.jsonPath().getInt("[0].id");
    CartClient.remove(token, CartRemoveRequest.byId(cartItemId)).then().statusCode(200);
    CartClient.list(token, "userId=" + user.userId())
        .then()
        .statusCode(200)
        .body("size()", is(0));
    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve validar json schema da lista do carrinho")
  void deveValidarJsonSchemaDaListaDoCarrinho() {
    var user = TestFlows.registerUser("CartSchema");
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createProduct(adminToken);
    int productId = product.id();
    CartClient.add(user.token(), CartAddRequest.single(productId, 1)).then().statusCode(201);
    CartClient.list(user.token(), "userId=" + user.userId())
        .then()
        .statusCode(200)
        .body(matchesJsonSchemaInClasspath("schemas/cart-list-response.schema.json"));
    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve validar erros de payload do carrinho")
  void deveValidarErrosDePayloadDoCarrinho() {
    CartClient.list(null, null).then().statusCode(401);
    given()
        .spec(RequestSpecs.json())
        .body(CartAddRequest.emptyBody())
        .when()
        .post("/cart")
        .then()
        .statusCode(401);
    given()
        .spec(RequestSpecs.json())
        .body(CartRemoveRequest.empty())
        .when()
        .delete("/cart")
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 401 com mensagem padronizada para token ausente no POST")
  void deveRetornar401ComMensagemPadronizadaParaTokenAusenteNoPost() {
    given()
        .spec(RequestSpecs.json())
        .body(CartAddRequest.single(1, 1))
        .when()
        .post("/cart")
        .then()
        .statusCode(401)
        .body("error", matchesPattern("(?i).*token.*"));
  }

  @Test
  @DisplayName("deve retornar 400 para cartItemId ausente quando autenticado")
  void deveRetornar400ParaCartItemIdAusenteQuandoAutenticado() {
    String token = TestFlows.registerUser().token();
    CartClient.remove(token, CartRemoveRequest.empty()).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 404 ao remover item inexistente para usuário autenticado")
  void deveRetornar404AoRemoverItemInexistenteParaUsuarioAutenticado() {
    String token = TestFlows.registerUser().token();
    CartClient.remove(token, CartRemoveRequest.byId(NONEXISTENT_CART_ITEM_ID)).then().statusCode(404);
  }

  @Test
  @DisplayName("deve buscar item do carrinho por ID quando existir")
  void deveBuscarItemDoCarrinhoPorIdQuandoExistir() {
    var user = TestFlows.registerUser();
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createProduct(adminToken);
    int productId = product.id();
    String token = user.token();
    CartClient.add(token, CartAddRequest.single(productId, 2)).then().statusCode(201);
    var listRes = CartClient.list(token, "userId=" + user.userId());
    listRes.then().statusCode(200).body("size()", greaterThan(0));
    int cartItemId = listRes.jsonPath().getInt("[0].id");
    CartClient.getById(token, cartItemId)
        .then()
        .statusCode(200)
        .body("id", equalTo(cartItemId))
        .body("product_id", equalTo(productId))
        .body("quantity", equalTo(2));
    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve retornar 404 com mensagem \"Carrinho não encontrado\" para ID inexistente")
  void deveRetornar404ComMensagemCarrinhoNaoEncontradoParaIdInexistente() {
    String token = TestFlows.registerUser().token();
    CartClient.getById(token, NONEXISTENT_CART_ITEM_ID)
        .then()
        .statusCode(404)
        .body("error", equalTo("Cart item not found"));
  }

  @Test
  @DisplayName("deve retornar 403 ao tentar acessar carrinho de outro usuário")
  void deveRetornar403AoTentarAcessarCarrinhoDeOutroUsuario() {
    var userA = TestFlows.registerUser();
    var userB = TestFlows.registerUser();
    CartClient.list(userA.token(), "userId=" + userB.userId()).then().statusCode(403);
  }

  @Test
  @DisplayName("deve retornar 400 para userId inválido no GET do carrinho")
  void deveRetornar400ParaUserIdInvalidoNoGetDoCarrinho() {
    String token = TestFlows.registerUser().token();
    CartClient.list(token, "userId=abc").then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 para payload inválido no POST do carrinho autenticado")
  void deveRetornar400ParaPayloadInvalidoNoPostDoCarrinhoAutenticado() {
    String token = TestFlows.registerUser().token();
    CartClient.add(token, CartAddRequest.empty()).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 para produto duplicado no mesmo payload")
  void deveRetornar400ParaProdutoDuplicadoNoMesmoPayload() {
    var user = TestFlows.registerUser();
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createProduct(adminToken);
    int productId = product.id();
    CartClient.add(
            user.token(),
            CartAddRequest.of(
                new CartLineItem(productId, 1), new CartLineItem(productId, 2)))
        .then()
        .statusCode(400)
        .body("error", equalTo("Duplicate products are not allowed"));
    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve retornar 400 para produto inexistente")
  void deveRetornar400ParaProdutoInexistente() {
    String token = TestFlows.registerUser().token();
    CartClient.add(token, CartAddRequest.single(UNKNOWN_PRODUCT_ID, 1))
        .then()
        .statusCode(400)
        .body("error", equalTo("Product not found"));
  }

  @Test
  @DisplayName("deve retornar 400 para quantidade acima do limite")
  void deveRetornar400ParaQuantidadeAcimaDoLimite() {
    var user = TestFlows.registerUser();
    String adminToken = AuthSession.adminToken();
    ProductResponse product = TestFlows.createProduct(adminToken);
    int productId = product.id();
    CartClient.add(user.token(), CartAddRequest.single(productId, 100))
        .then()
        .statusCode(400)
        .body("error", equalTo("Product does not have enough quantity"));
    TestFlows.deleteProduct(adminToken, productId);
  }

  @Test
  @DisplayName("deve aceitar lote com múltiplos produtos diferentes")
  void deveAceitarLoteComMultiplosProdutosDiferentes() {
    var user = TestFlows.registerUser();
    String adminToken = AuthSession.adminToken();
    ProductResponse productA = TestFlows.createProduct(adminToken);
    ProductResponse productB = TestFlows.createProduct(adminToken);
    int productAId = productA.id();
    int productBId = productB.id();
    String token = user.token();
    CartClient.add(
            token,
            CartAddRequest.of(
                new CartLineItem(productAId, 2), new CartLineItem(productBId, 3)))
        .then()
        .statusCode(201)
        .body("processed", equalTo(2))
        .body("items", instanceOf(List.class));
    var listRes = CartClient.list(token, "userId=" + user.userId());
    listRes.then().statusCode(200).body("size()", greaterThanOrEqualTo(2));
    int productAItemId =
        listRes.jsonPath().getInt("find { it.product_id == " + productAId + " }.id");
    listRes
        .then()
        .body("find { it.product_id == " + productAId + " }.quantity", equalTo(2))
        .body("find { it.product_id == " + productBId + " }.quantity", equalTo(3));
    CartClient.remove(token, CartRemoveRequest.byId(productAItemId)).then().statusCode(200);
    CartClient.list(token, "userId=" + user.userId())
        .then()
        .statusCode(200)
        .body("find { it.product_id == " + productBId + " }.quantity", equalTo(3))
        .body("find { it.product_id == " + productAId + " }", nullValue());
    TestFlows.deleteProduct(adminToken, productAId);
    TestFlows.deleteProduct(adminToken, productBId);
  }

  @Test
  @DisplayName("deve retornar 400 ao adicionar produto inexistente ao carrinho")
  void deveRetornar400AoAdicionarProdutoInexistenteAoCarrinho() {
    String token = TestFlows.registerUser().token();
    CartClient.add(token, CartAddRequest.single(NONEXISTENT_PRODUCT_ID, 1)).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao adicionar produto com quantidade zero")
  void deveRetornar400AoAdicionarProdutoComQuantidadeZero() {
    String token = TestFlows.registerUser().token();
    CartClient.add(token, CartAddRequest.single(1, 0)).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao adicionar produto com quantidade negativa")
  void deveRetornar400AoAdicionarProdutoComQuantidadeNegativa() {
    String token = TestFlows.registerUser().token();
    CartClient.add(token, CartAddRequest.single(1, -5)).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao tentar adicionar produto sem productId")
  void deveRetornar400AoTentarAdicionarProdutoSemProductId() {
    String token = TestFlows.registerUser().token();
    CartClient.addPartial(token, CartAddPartialRequest.quantityOnly(1)).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 401 ao listar carrinho sem token")
  void deveRetornar401AoListarCarrinhoSemToken() {
    CartClient.list(null, "userId=1").then().statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 404 ao remover item com ID inexistente")
  void deveRetornar404AoRemoverItemComIdInexistente() {
    String token = TestFlows.registerUser().token();
    CartClient.remove(token, CartRemoveRequest.byId(ALT_NONEXISTENT_CART_ITEM_ID))
        .then()
        .statusCode(404);
  }

  @Test
  @DisplayName("deve retornar 400 ao remover item com ID inválido (string)")
  void deveRetornar400AoRemoverItemComIdInvalidoString() {
    String token = TestFlows.registerUser().token();
    CartClient.remove(token, new CartRemoveStringIdRequest("id-invalido")).then().statusCode(400);
  }
}
