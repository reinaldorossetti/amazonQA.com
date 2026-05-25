package com.tester.api.tests.payments;

import com.tester.api.base.BaseApiTest;
import com.tester.api.client.OrdersClient;
import com.tester.api.client.PaymentsClient;
import com.tester.api.fixture.UserFixture;
import com.tester.api.model.request.PaymentRequest;
import com.tester.api.support.AuthSession;
import com.tester.api.support.TestFlows;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.restassured.response.Response;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;

@Epic("API")
@Feature("Pagamentos")
class PaymentsApiTest extends BaseApiTest {

  @Test
  @Severity(SeverityLevel.BLOCKER)
  @DisplayName("deve criar pagamento de crédito autorizado e marcar pedido como paid")
  void deveCriarPagamentoCreditoAutorizadoEMarcarPedidoComoPaid() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.credit(ctx.grandTotal()))
        .then()
        .statusCode(201)
        .body("status", equalTo("authorized"))
        .body("method", equalTo("credit"));

    OrdersClient.getById(ctx.token(), ctx.orderId())
        .then()
        .statusCode(200)
        .body("status", equalTo("paid"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("deve criar pagamento pix pendente e permitir consulta por paymentId")
  void deveCriarPagamentoPixPendenteEConsultarPorPaymentId() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    Response payRes = PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.pix(ctx.grandTotal()));
    payRes
        .then()
        .statusCode(201)
        .body("status", equalTo("pending"))
        .body("metadata.pixCode", notNullValue())
        .body("metadata.qrCode", notNullValue())
        .body(
            "metadata.readableText",
            anyOf(
                containsString("Value when reading QR Code"),
                containsString("Valor ao ler QR Code")));

    int paymentId = payRes.jsonPath().getInt("id");

    PaymentsClient.getPayment(ctx.token(), ctx.orderId(), paymentId)
        .then()
        .statusCode(200)
        .body("id", equalTo(paymentId))
        .body("status", equalTo("pending"));

    OrdersClient.getById(ctx.token(), ctx.orderId())
        .then()
        .statusCode(200)
        .body("status", equalTo("pending_payment"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("deve validar json schema da resposta de pagamento")
  void deveValidarJsonSchemaDaRespostaDePagamento() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.pix(ctx.grandTotal()))
        .then()
        .statusCode(201)
        .body(matchesJsonSchemaInClasspath("schemas/payment-response.schema.json"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("deve retornar 400 quando valor de pagamento for maior que saldo do pedido")
  void deveRetornar400QuandoValorExcedeSaldoDoPedido() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    PaymentsClient.pay(
            ctx.token(),
            ctx.orderId(),
            PaymentRequest.creditExceeding(ctx.grandTotal() + 10))
        .then()
        .statusCode(400)
        .body("error", equalTo("Amount exceeds order balance"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName(
      "deve baixar PDF do boleto mesmo para pedido inexistente (comportamento atual do backend)")
  void deveBaixarPdfDoBoletoParaPedidoInexistente() {
    Response response = PaymentsClient.downloadBoleto(9999, "XYZ");

    response
        .then()
        .statusCode(200)
        .header("Content-Type", containsString("application/pdf"))
        .header("Content-Disposition", containsString("boleto-9999-XYZ.pdf"));

    byte[] body = response.asByteArray();
    org.junit.jupiter.api.Assertions.assertTrue(body.length > 100);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("deve retornar 400 para ID de pedido inválido no download de boleto")
  void deveRetornar400ParaIdInvalidoNoDownloadDeBoleto() {
    given()
        .when()
        .get("/orders/invalid-id/boleto/ABC")
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid order ID"));
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("deve retornar 400 para método de pagamento inválido")
  void deveRetornar400ParaMetodoDePagamentoInvalido() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.invalidMethod())
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid payment method"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("deve retornar 400 para requisição de pagamento sem método")
  void deveRetornar400ParaPagamentoSemMetodo() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.empty())
        .then()
        .statusCode(400)
        .body("error", equalTo("Invalid payment method"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("deve retornar 404 ao pagar pedido inexistente quando autenticado")
  void deveRetornar404AoPagarPedidoInexistente() {
    var user = AuthSession.registerAndLogin(UserFixture.uniquePfUser("Payment"));

    PaymentsClient.pay(user.token(), 999_999_999, PaymentRequest.creditMinimal(10))
        .then()
        .statusCode(404)
        .body("error", equalTo("Order not found"));
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("deve criar pagamento boleto pendente e baixar PDF com referência arbitrária")
  void deveCriarPagamentoBoletoPendenteEBaixarPdf() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    Response paymentRes =
        PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.boleto(ctx.grandTotal()));

    paymentRes
        .then()
        .statusCode(201)
        .body("status", equalTo("pending"))
        .body("method", equalTo("boleto"))
        .body("metadata.line", notNullValue());

    Response boletoRes = PaymentsClient.downloadBoleto(ctx.orderId(), "ANY-REFERENCE");
    boletoRes
        .then()
        .statusCode(200)
        .header("Content-Type", containsString("application/pdf"));

    org.junit.jupiter.api.Assertions.assertTrue(boletoRes.asByteArray().length > 100);

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("deve criar pagamento débito autorizado e marcar pedido como paid")
  void deveCriarPagamentoDebitoAutorizadoEMarcarPedidoComoPaid() {
    TestFlows.OrderContext ctx = TestFlows.createOrderForUser();

    PaymentsClient.pay(ctx.token(), ctx.orderId(), PaymentRequest.debit(ctx.grandTotal()))
        .then()
        .statusCode(201)
        .body("status", equalTo("authorized"))
        .body("method", equalTo("debit"));

    OrdersClient.getById(ctx.token(), ctx.orderId())
        .then()
        .statusCode(200)
        .body("status", equalTo("paid"))
        .body("payment_method", equalTo("debit"));

    TestFlows.deleteProduct(ctx.adminToken(), ctx.productId());
  }
}
