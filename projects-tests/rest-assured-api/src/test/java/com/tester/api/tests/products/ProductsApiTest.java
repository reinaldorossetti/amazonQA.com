package com.tester.api.tests.products;

import com.tester.api.base.BaseApiTest;
import com.tester.api.client.ProductsClient;
import com.tester.api.fixture.ProductFixture;
import com.tester.api.fixture.UserFixture;
import com.tester.api.model.request.ProductRequest;
import com.tester.api.model.response.ProductResponse;
import com.tester.api.specs.RequestSpecs;
import com.tester.api.support.AuthSession;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@Epic("API")
@Feature("Products")
class ProductsApiTest extends BaseApiTest {

  private static final int NONEXISTENT_PRODUCT_ID = 999_999_999;

  @Test
  @DisplayName("deve listar produtos sem filtro de categoria")
  void deveListarProdutosSemFiltroDeCategoria() {
    ProductsClient.list(null)
        .then()
        .statusCode(200)
        .body("", instanceOf(List.class));
  }

  @Test
  @DisplayName("deve criar, buscar, filtrar, atualizar e remover produto")
  void deveCriarBuscarFiltrarAtualizarERemoverProduto() {
    String adminToken = AuthSession.adminToken();
    String suffix = String.valueOf(System.currentTimeMillis());
    ProductRequest createPayload = ProductFixture.playwrightLifecycle(suffix);
    var createRes = ProductsClient.create(adminToken, createPayload);
    createRes.then().statusCode(201);
    ProductResponse created = createRes.as(ProductResponse.class);
    int productId = created.id();
    ProductsClient.getById(productId)
        .then()
        .statusCode(200)
        .body("name", containsString("Produto Playwright"));
    ProductsClient.list("category=Playwright-" + suffix)
        .then()
        .statusCode(200)
        .body("id", hasItem(productId));
    ProductRequest updatePayload =
        ProductRequest.from(created)
            .withName("Produto Atualizado " + suffix)
            .withPrice(222.22);
    ProductsClient.update(adminToken, productId, updatePayload).then().statusCode(200);
    ProductsClient.delete(adminToken, productId).then().statusCode(200);
    ProductsClient.getById(productId).then().statusCode(404);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar produto sem campos obrigatórios")
  void deveRetornar400AoCriarProdutoSemCamposObrigatorios() {
    String adminToken = AuthSession.adminToken();
    ProductsClient.create(adminToken, ProductRequest.descriptionOnly("sem campos obrigatórios"))
        .then()
        .statusCode(400);
  }

  @Test
  @DisplayName("deve retornar array vazio para categoria inexistente")
  void deveRetornarArrayVazioParaCategoriaInexistente() {
    ProductsClient.list("category=__NO_MATCH__PLAYWRIGHT__")
        .then()
        .statusCode(200)
        .body("", instanceOf(List.class))
        .body("size()", is(0));
  }

  @Test
  @DisplayName("deve retornar 404 ao atualizar produto inexistente")
  void deveRetornar404AoAtualizarProdutoInexistente() {
    String adminToken = AuthSession.adminToken();
    ProductRequest payload =
        new ProductRequest(
            "Inexistente",
            10.0,
            null,
            "Test",
            null,
            null,
            null,
            null,
            null);
    ProductsClient.update(adminToken, NONEXISTENT_PRODUCT_ID, payload).then().statusCode(404);
  }

  @Test
  @DisplayName("deve retornar 404 ao remover produto inexistente")
  void deveRetornar404AoRemoverProdutoInexistente() {
    String adminToken = AuthSession.adminToken();
    ProductsClient.delete(adminToken, NONEXISTENT_PRODUCT_ID).then().statusCode(404);
  }

  @Test
  @DisplayName("deve retornar 401 ao criar produto sem token")
  void deveRetornar401AoCriarProdutoSemToken() {
    given()
        .spec(RequestSpecs.json())
        .body(ProductRequest.minimal("Sem Token", 10, "N/A"))
        .when()
        .post("/products")
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("deve retornar 403 ao criar produto com usuário comum")
  void deveRetornar403AoCriarProdutoComUsuarioComum() {
    String userToken = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Product")).token();
    ProductsClient.create(userToken, ProductRequest.minimal("Hack Product", 10, "N/A"))
        .then()
        .statusCode(403);
  }

  @Test
  @DisplayName("deve retornar 403 ao deletar produto com usuário comum")
  void deveRetornar403AoDeletarProdutoComUsuarioComum() {
    String userToken = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Delete")).token();
    ProductsClient.delete(userToken, 1).then().statusCode(403);
  }

  @Test
  @DisplayName("deve retornar 403 ao atualizar produto com usuário comum")
  void deveRetornar403AoAtualizarProdutoComUsuarioComum() {
    String userToken = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Update")).token();
    ProductsClient.update(userToken, 1, ProductRequest.minimal("Updated", 10, "N/A"))
        .then()
        .statusCode(403);
  }

  @Test
  @DisplayName("deve retornar 400 ao buscar produto com id em formato inválido")
  void deveRetornar400AoBuscarProdutoComIdEmFormatoInvalido() {
    given().when().get("/products/abc-invalido").then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar produto com preço negativo")
  void deveRetornar400AoCriarProdutoComPrecoNegativo() {
    String adminToken = AuthSession.adminToken();
    ProductsClient.create(adminToken, ProductRequest.negativePrice()).then().statusCode(400);
  }

  @Test
  @DisplayName("deve retornar 400 ao criar produto sem categoria")
  void deveRetornar400AoCriarProdutoSemCategoria() {
    String adminToken = AuthSession.adminToken();
    ProductsClient.create(adminToken, ProductRequest.withoutCategory("Sem Categoria", 50))
        .then()
        .statusCode(400);
  }
}
