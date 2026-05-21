package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;

import com.tester.web.e2e.pages.OrdersCheckoutPageAction;
import com.tester.web.e2e.support.ApiClient;
import com.tester.web.e2e.support.ApiClient.CreatedUser;
import com.tester.web.e2e.support.BrowserConditions;
import com.tester.web.e2e.support.NetworkRouteMocks;
import com.tester.web.e2e.support.PaymentMethod;
import com.tester.web.e2e.support.TestDataGenerator;
import com.tester.web.e2e.support.TestDataGenerator.UserData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Orders Checkout Errors")
@EnabledIf("com.tester.web.e2e.support.BrowserConditions#isChromium")
class OrdersCheckoutFeatureTest extends AbstractUiTest {

  private OrdersCheckoutPageAction ordersCheckout;

  @BeforeEach
  void setupPage() {
    ordersCheckout = new OrdersCheckoutPageAction(driver);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("ORD-NEG-01 should stay on cart when order creation returns HTTP 500")
  void shouldStayOnCartWhenOrderCreationFails() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.order.500." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenProceedToCheckoutUnderMock(NetworkRouteMocks.orderCreateServerError());
      ordersCheckout.thenValidatedStaysOnCartWithOneOf(
          "Falha ao criar pedido", "Erro ao processar checkout");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("ORD-NEG-02 should show empty cart error when order API returns HTTP 400")
  void shouldShowEmptyCartErrorWhenOrderApiReturnsBadRequest() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.order.400." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenProceedToCheckoutUnderMock(NetworkRouteMocks.orderCreateEmptyCartBadRequest());
      ordersCheckout.thenValidatedStaysOnCartWithMessage("Carrinho vazio ou payload inválido");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("ORD-NEG-03 should show payment error when payment API returns HTTP 400")
  void shouldShowPaymentErrorWhenPaymentApiReturnsBadRequest() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.pay.400." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenPaymentFlowUnderMock(
          NetworkRouteMocks.orderCreateSuccessWithPaymentBadRequest(99), PaymentMethod.CREDIT);
      ordersCheckout.thenValidatedCheckoutErrorMessage(
          "ID inválido, método inválido, valor inválido ou maior que saldo");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("ORD-NEG-04 should show not found error when payment API returns HTTP 404")
  void shouldShowNotFoundErrorWhenPaymentApiReturnsNotFound() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.pay.404." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenPaymentFlowUnderMock(
          NetworkRouteMocks.orderCreateSuccessWithPaymentNotFound(404), PaymentMethod.CREDIT);
      ordersCheckout.thenValidatedCheckoutErrorMessage("Pedido não encontrado");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }
}
