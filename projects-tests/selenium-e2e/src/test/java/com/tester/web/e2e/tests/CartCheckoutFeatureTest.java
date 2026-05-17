package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import com.tester.web.e2e.pages.CartCheckoutPageAction;
import com.tester.web.e2e.support.LoginTestData;
import com.tester.web.e2e.support.PaymentMethod;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Cart and Checkout")
class CartCheckoutFeatureTest extends AbstractUiTest {

  private CartCheckoutPageAction cartCheckout;

  String[] successfulCheckout = {
    "Obrigado pela sua compra!",
    "Seu pedido foi processado e já estamos preparando para envio.",
    "Resumo do Pedido",
    "Voltar ao Catálogo"  
  };
 
  @BeforeEach
  void setupPageAction() {
    cartCheckout = new CartCheckoutPageAction(driver);
    cartCheckout.givenLoggedInUser(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, "Olá, Reinaldo");
  }

  @ParameterizedTest(name = "{displayName}: {0}")
  @EnumSource(PaymentMethod.class)
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TS01 authenticated user should complete checkout with payment method")
  void authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod paymentMethod) {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(paymentMethod);
    cartCheckout.thenValidatedSuccessfulCheckoutSummary(paymentMethod, successfulCheckout);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS02 authenticated user should be redirected to payment from cart checkout")
  void authenticatedUserIsRedirectedToPaymentFromCartCheckout() {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.assertUrlContains("/cart");

    cartCheckout.whenAuthenticatedUserProceedsToCheckout();
    cartCheckout.assertUrlContains("/payments");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS03 empty cart should keep checkout unavailable")
  void emptyCartShowsEmptyStateAndCheckoutUnavailable() {
    cartCheckout.givenUserOnEmptyCart();
    cartCheckout.assertCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS04 should update quantity, total and badge for a valid positive value")
  void validQuantityUpdatesInputTotalAndBadge() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.assertQuantityEquals("1");
    cartCheckout.assertOrderTotalContains("R$ 50.99");
    cartCheckout.whenUpdateFirstItemQuantity("3");
    cartCheckout.assertQuantityEquals("3");
    cartCheckout.assertOrderTotalContains("R$ 152.97");
    cartCheckout.assertCartBadgeEquals("3");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS05 should keep previous quantity when value is zero")
  void zeroQuantityKeepsPreviousValue() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.assertQuantityEquals("1");
    cartCheckout.whenUpdateFirstItemQuantity("0");
    cartCheckout.assertQuantityEquals("1");
    cartCheckout.assertOrderTotalContains("R$ 50.99");
    cartCheckout.assertCartBadgeEquals("1");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS06 should keep previous quantity when value is negative")
  void negativeQuantityKeepsPreviousValue() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.assertQuantityEquals("1");
    cartCheckout.whenUpdateFirstItemQuantity("-2");
    cartCheckout.assertQuantityEquals("1");
    cartCheckout.assertOrderTotalContains("R$ 50.99");
    cartCheckout.assertCartBadgeEquals("1");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS07 should handle larger valid quantity values correctly")
  void largeQuantityUpdatesSummaryAndBadge() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.whenUpdateFirstItemQuantity("25");
    cartCheckout.assertQuantityEquals("25");
    cartCheckout.assertOrderTotalContains("R$ 1274.75");
    cartCheckout.assertCartBadgeEquals("25");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS08 should normalize decimal input to integer quantity")
  void decimalQuantityIsNormalizedToInteger() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.whenUpdateFirstItemQuantity("2.9");
    cartCheckout.assertQuantityEquals("2");
    cartCheckout.assertOrderTotalContains("R$ 101.98");
    cartCheckout.assertCartBadgeEquals("2");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS09 should remove a single item and show empty cart state")
  void removingSingleItemShowsEmptyCart() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.assertDeleteButtonsCount(1);
    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.assertDeleteButtonsCount(0);
    cartCheckout.assertCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS10 should add three items, remove all of them, and validate empty cart")
  void addingThreeItemsAndRemovingAllEndsWithEmptyCart() {
    cartCheckout.givenCartWithThreeItems();
    cartCheckout.assertCartBadgeEquals("3");
    cartCheckout.assertDeleteButtonsCount(3);
    cartCheckout.whenRemoveAllCartItems();
    cartCheckout.assertDeleteButtonsCount(0);
    cartCheckout.assertCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TS11 should clear cart after successful checkout with Crédito when leaving thank-you page")
  void cartClearsAfterCheckoutWhenLeavingThankYouPage() {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.assertCartBadgeEquals("1");

    cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod.CREDIT);
    cartCheckout.assertUrlContains("/payments");
    cartCheckout.assertUrlContains("/thank-you");

    cartCheckout.whenLeavingThankYouBackToCatalogAndOpeningCart();
    cartCheckout.assertUrlContains("/");
    cartCheckout.assertUrlContains("/cart");
    cartCheckout.assertCartEmptyStateVisible();
    cartCheckout.assertCartBadgeEquals("0");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS12 should decrement cart badge after each item removal")
  void cartBadgeDecrementsAfterEachItemRemoval() {
    cartCheckout.givenCartWithThreeItems();
    cartCheckout.assertCartBadgeEquals("3");

    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.assertCartBadgeEquals("2");
    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.assertCartBadgeEquals("1");
    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.assertCartBadgeEquals("0");
    cartCheckout.assertCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS13 should validate distinct items vs total quantity in the order summary")
  void summaryShowsDistinctItemsAndSubtotalQuantity() {
    cartCheckout.givenCartWithThreeItems();
    cartCheckout.whenUpdateFirstItemQuantity("2");

    cartCheckout.assertDistinctItemsTextEquals("Itens (3)");
    cartCheckout.assertSubtotalTextContains("Subtotal (4 items)");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS14 should display free shipping if cart shipping total is 0")
  void freeShippingAppearsWhenShippingTotalIsZero() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.assertShippingTextContains("Grátis");
    cartCheckout.assertFreeShippingBannerVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS15 should display paid shipping and compute grand total if shipping total is greater than 0")
  void paidShippingAppearsWhenShippingIsGreaterThanZero() {
    cartCheckout.givenCartWithPaidShippingItem("Câmera Vintage");

    cartCheckout.assertShippingTextEquals("R$ 16.00");
    cartCheckout.assertFreeShippingBannerHidden();
  }
}
