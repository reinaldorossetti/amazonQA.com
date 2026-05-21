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
  @DisplayName("TC-001 should stay on cart when order creation returns HTTP 500")
  void shouldStayOnCartWhenOrderCreationFails() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.order.500." + TestDataGenerator.randomNumeric8() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenProceedToCheckoutUnderMock(
          NetworkRouteMocks.orderCreateServerError(),
          "Falha ao criar pedido",
          "Erro ao processar checkout");
      ordersCheckout.thenValidatedStaysOnCart();
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 should show empty cart error when order API returns HTTP 400")
  void shouldShowEmptyCartErrorWhenOrderApiReturnsBadRequest() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.order.400." + TestDataGenerator.randomNumeric8() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenProceedToCheckoutUnderMock(
          NetworkRouteMocks.orderCreateEmptyCartBadRequest(), "Carrinho vazio ou payload inválido");
      ordersCheckout.thenValidatedStaysOnCart();
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 should show payment error when payment API returns HTTP 400")
  void shouldShowPaymentErrorWhenPaymentApiReturnsBadRequest() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.pay.400." + TestDataGenerator.randomNumeric8() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenPaymentFlowUnderMock(
          NetworkRouteMocks.orderCreateSuccessWithPaymentBadRequest(99),
          PaymentMethod.CREDIT,
          "ID inválido, método inválido, valor inválido ou maior que saldo");
      ordersCheckout.thenValidatedCheckoutOnPaymentsPage();
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 should show not found error when payment API returns HTTP 404")
  void shouldShowNotFoundErrorWhenPaymentApiReturnsNotFound() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.pay.404." + TestDataGenerator.randomNumeric8() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      ordersCheckout.givenLoggedInApiUserWithOneCartItem(email, user.password());
      ordersCheckout.whenPaymentFlowUnderMock(
          NetworkRouteMocks.orderCreateSuccessWithPaymentNotFound(404),
          PaymentMethod.CREDIT,
          "Pedido não encontrado");
      ordersCheckout.thenValidatedCheckoutOnPaymentsPage();
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }
}
