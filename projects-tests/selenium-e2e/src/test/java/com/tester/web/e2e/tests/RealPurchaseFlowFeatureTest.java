package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.CartCheckoutPageAction;
import com.tester.web.e2e.pages.CatalogPageAction;
import com.tester.web.e2e.pages.LoginPageAction;
import com.tester.web.e2e.pages.NavBarComponent;
import com.tester.web.e2e.support.ApiClient;
import com.tester.web.e2e.support.ApiClient.CreatedUser;
import com.tester.web.e2e.support.PaymentMethod;
import com.tester.web.e2e.support.TestDataGenerator;
import com.tester.web.e2e.support.TestDataGenerator.UserData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Real Purchase Flow")
class RealPurchaseFlowFeatureTest extends AbstractUiTest {

  private LoginPageAction loginPage;
  private CatalogPageAction catalog;
  private CartCheckoutPageAction cartCheckout;
  private NavBarComponent nav;

  private UserData user;
  private String email;

  @BeforeEach
  void setupPages() {
    loginPage = new LoginPageAction(driver);
    catalog = new CatalogPageAction(driver);
    cartCheckout = new CartCheckoutPageAction(driver);
    nav = new NavBarComponent(driver);

    user = TestDataGenerator.randomUser();
    email = TestDataGenerator.emailFaker();
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 real login random product checkout with credit card")
  void realLoginProductCheckoutWithCreditCard() {

    try {
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.validatedLoginInPage(user.firstName());

      catalog.givenUserOnCatalog();
      catalog.whenAddFirstProductToCart();
      nav.thenValidatedCartBadgeNotZero();
      nav.whenOpenCart();
      cartCheckout.thenValidatedUrlContains("/cart");

      cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod.CREDIT);
      cartCheckout.thenValidatedSuccessfulCheckoutSummary(
          PaymentMethod.CREDIT,
          "Obrigado pela sua compra!",
          "Seu pedido foi processado e já estamos preparando para envio.",
          "Resumo do Pedido",
          "Voltar ao Catálogo");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 catalog search and checkout with credit card")
  void catalogSearchCheckoutWithCreditCard() {
    String searchTerm = ApiClient.firstProductSearchTerm();
    try {
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.validatedLoginInPage(user.firstName());

      catalog.givenUserOnCatalog();
      catalog.whenSearchBy(searchTerm);
      catalog.whenAddFirstProductToCart();
      nav.thenValidatedCartBadgeNotZero();
      nav.whenOpenCart();
      cartCheckout.thenValidatedUrlContains("/cart");

      cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod.CREDIT);
      cartCheckout.thenValidatedSuccessfulCheckoutSummary(
          PaymentMethod.CREDIT,
          "Obrigado pela sua compra!",
          "Seu pedido foi processado e já estamos preparando para envio.",
          "Resumo do Pedido",
          "Voltar ao Catálogo");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 multiple products checkout with PIX")
  void multipleProductsCheckoutWithPix() {

    try {
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.validatedLoginInPage(user.firstName());

      cartCheckout.givenCartWithThreeItems();
      cartCheckout.thenValidatedCartBadgeEquals("3");
      cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod.PIX);
      cartCheckout.thenValidatedSuccessfulCheckoutSummary(
          PaymentMethod.PIX,
          "Obrigado pela sua compra!",
          "Seu pedido foi processado e já estamos preparando para envio.",
          "Resumo do Pedido",
          "Voltar ao Catálogo");
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }
}
