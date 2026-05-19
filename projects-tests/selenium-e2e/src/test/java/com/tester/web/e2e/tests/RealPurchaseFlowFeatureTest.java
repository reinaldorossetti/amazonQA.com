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

  @BeforeEach
  void setupPages() {
    loginPage = new LoginPageAction(driver);
    catalog = new CatalogPageAction(driver);
    cartCheckout = new CartCheckoutPageAction(driver);
    nav = new NavBarComponent(driver);
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TS01 real login random product checkout with credit card")
  void realLoginProductCheckoutWithCreditCard() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.real.flow." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.validatedLoginInPage(user.firstName());

      catalog.givenUserOnCatalog();
      catalog.whenAddFirstProductToCart();
      nav.assertCartBadgeNotZero();
      nav.whenOpenCart();
      cartCheckout.assertUrlContains("/cart");

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
  @DisplayName("TS03 multiple products checkout with PIX")
  void multipleProductsCheckoutWithPix() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.real.pix." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.validatedLoginInPage(user.firstName());

      cartCheckout.givenCartWithThreeItems();
      cartCheckout.assertCartBadgeEquals("3");
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
