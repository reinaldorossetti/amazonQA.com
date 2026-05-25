package com.tester.api.tests.supportproducts;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;

import com.tester.api.base.BaseApiTest;
import com.tester.api.client.ProductsClient;
import com.tester.api.client.UsersClient;
import com.tester.api.fixture.BrazilianDocuments;
import com.tester.api.fixture.ProductFixture;
import com.tester.api.model.request.ProductRequest;
import com.tester.api.model.request.RegisterUserRequest;
import com.tester.api.model.response.ProductResponse;
import com.tester.api.specs.RequestSpecs;
import com.tester.api.support.AuthSession;
import io.restassured.common.mapper.TypeRef;
import io.restassured.response.Response;
import java.util.List;
import net.datafaker.Faker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SupportProductsApiTest extends BaseApiTest {

  private static final Faker FAKER = new Faker();

  @Test
  @DisplayName("API-SP01 - Support deve criar produto com dados aleatórios via faker")
  void apiSp01SupportDeveCriarProdutoComDadosAleatoriosViaFaker() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct();

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201).body("id", notNullValue()).body("name", equalTo(product.name()));
    assertEquals(product.price(), create.jsonPath().getDouble("price"), 1.0);

    int productId = create.jsonPath().getInt("id");
    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP13 - Support deve validar json schema do produto criado")
  void apiSp13SupportDeveValidarJsonSchemaDoProdutoCriado() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct();

    Response create = ProductsClient.create(token, product);
    create
        .then()
        .statusCode(201)
        .body(matchesJsonSchemaInClasspath("schemas/support-product-response.schema.json"));

    int productId = create.jsonPath().getInt("id");
    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP02 - Support deve atualizar produto existente com dados faker")
  void apiSp02SupportDeveAtualizarProdutoExistenteComDadosFaker() {
    String token = AuthSession.supportToken();
    ProductRequest original = ProductFixture.randomProduct();

    Response create = ProductsClient.create(token, original);
    create.then().statusCode(201);
    ProductResponse created = create.as(ProductResponse.class);

    ProductRequest updatedData =
        ProductRequest.from(created)
            .withName("Atualizado " + FAKER.commerce().productName())
            .withPrice(FAKER.number().randomDouble(2, 100, 5000))
            .withShippingCost(25.50);

    int productId = created.id();
    Response update = ProductsClient.update(token, productId, updatedData);
    update.then().statusCode(200).body("name", equalTo(updatedData.name()));
    assertEquals(25.50, update.jsonPath().getDouble("shipping_cost"), 0.1);

    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP03 - Support deve deletar produto criado")
  void apiSp03SupportDeveDeletarProdutoCriado() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct();

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201);
    int productId = create.jsonPath().getInt("id");

    ProductsClient.delete(token, productId).then().statusCode(200);
    ProductsClient.getById(productId).then().statusCode(404);
  }

  @Test
  @DisplayName("API-SP04 - Produto criado com frete grátis deve retornar shipping_cost=0")
  void apiSp04ProdutoCriadoComFreteGratisDeveRetornarShippingCostZero() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct().withShippingCost(0);

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201).body("shipping_cost", equalTo(0));

    int productId = create.jsonPath().getInt("id");
    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP05 - Produto criado com frete pago deve preservar valor")
  void apiSp05ProdutoCriadoComFretePagoDevePreservarValor() {
    String token = AuthSession.supportToken();
    double shippingValue = Double.parseDouble(FAKER.commerce().price(5, 50));
    ProductRequest product = ProductFixture.randomProduct().withShippingCost(shippingValue);

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201);
    assertEquals(shippingValue, create.jsonPath().getDouble("shipping_cost"), 1.0);

    int productId = create.jsonPath().getInt("id");
    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP06 - Produto sem shipping_cost deve assumir valor 0 por padrão")
  void apiSp06ProdutoSemShippingCostDeveAssumirValorZeroPorPadrao() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct().withoutShippingCost();

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201).body("shipping_cost", equalTo(0));

    int productId = create.jsonPath().getInt("id");
    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP07 - Usuário normal NÃO deve criar produto (403)")
  void apiSp07UsuarioNormalNaoDeveCriarProduto403() {
    String suffix = String.valueOf(System.currentTimeMillis());
    RegisterUserRequest user =
        RegisterUserRequest.e2eNormal(
            suffix,
            FAKER.name().firstName(),
            FAKER.name().lastName(),
            BrazilianDocuments.validCpf());

    UsersClient.register(user).then().statusCode(201);
    String token = AuthSession.userToken(user.email(), user.password());

    ProductsClient.create(token, ProductFixture.randomProduct()).then().statusCode(403);
  }

  @Test
  @DisplayName("API-SP08 - Requisição sem token NÃO deve criar produto (401)")
  void apiSp08RequisicaoSemTokenNaoDeveCriarProduto401() {
    given()
        .spec(RequestSpecs.json())
        .body(ProductFixture.randomProduct())
        .when()
        .post("/products")
        .then()
        .statusCode(401);
  }

  @Test
  @DisplayName("API-SP09 - Support deve buscar produto por ID após criar")
  void apiSp09SupportDeveBuscarProdutoPorIdAposCriar() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct();

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201);
    int productId = create.jsonPath().getInt("id");

    ProductsClient.getById(productId)
        .then()
        .statusCode(200)
        .body("name", equalTo(product.name()))
        .body("category", equalTo(product.category()))
        .body("manufacturer", equalTo(product.manufacturer()));

    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP10 - Support deve filtrar produtos por categoria")
  void apiSp10SupportDeveFiltrarProdutosPorCategoria() {
    String token = AuthSession.supportToken();
    String uniqueCategory = "Categoria-" + System.currentTimeMillis();
    ProductRequest product = ProductFixture.randomProduct().withCategory(uniqueCategory);

    Response create = ProductsClient.create(token, product);
    create.then().statusCode(201);
    int productId = create.jsonPath().getInt("id");

    List<ProductResponse> filtered =
        ProductsClient.list("category=" + uniqueCategory)
            .then()
            .statusCode(200)
            .extract()
            .as(new TypeRef<List<ProductResponse>>() {});

    boolean found = filtered.stream().anyMatch(item -> productId == item.id());
    if (!found) {
      throw new AssertionError("Produto criado não encontrado no filtro por categoria");
    }

    ProductsClient.delete(token, productId).then().statusCode(200);
  }

  @Test
  @DisplayName("API-SP11 - Criar produto sem nome deve retornar 400")
  void apiSp11CriarProdutoSemNomeDeveRetornar400() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct().withoutName();

    ProductsClient.create(token, product).then().statusCode(400);
  }

  @Test
  @DisplayName("API-SP12 - Criar produto sem preço deve retornar 400")
  void apiSp12CriarProdutoSemPrecoDeveRetornar400() {
    String token = AuthSession.supportToken();
    ProductRequest product = ProductFixture.randomProduct().withoutPrice();

    ProductsClient.create(token, product).then().statusCode(400);
  }
}
