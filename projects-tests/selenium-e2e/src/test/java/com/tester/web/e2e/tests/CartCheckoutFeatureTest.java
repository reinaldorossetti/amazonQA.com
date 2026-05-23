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
  @DisplayName("TC-001 authenticated user should complete checkout with payment method")
  void authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod paymentMethod) {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(paymentMethod);
    cartCheckout.thenValidatedSuccessfulCheckoutSummary(paymentMethod, successfulCheckout);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 authenticated user should be redirected to payment from cart checkout")
  void authenticatedUserIsRedirectedToPaymentFromCartCheckout() {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.thenValidatedUrlContains("/cart");

    cartCheckout.whenAuthenticatedUserProceedsToCheckout();
    cartCheckout.thenValidatedUrlContains("/payments");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 empty cart should keep checkout unavailable")
  void emptyCartShowsEmptyStateAndCheckoutUnavailable() {
    cartCheckout.givenUserOnEmptyCart();
    cartCheckout.thenValidatedCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 should update quantity, total and badge for a valid positive value")
  void validQuantityUpdatesInputTotalAndBadge() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.thenValidatedQuantityEquals("1");
    cartCheckout.thenValidatedOrderTotalContains("R$ 50.99");
    cartCheckout.whenUpdateFirstItemQuantity("3");
    cartCheckout.thenValidatedQuantityEquals("3");
    cartCheckout.thenValidatedOrderTotalContains("R$ 152.97");
    cartCheckout.thenValidatedCartBadgeEquals("3");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-005 should keep previous quantity when value is zero")
  void zeroQuantityKeepsPreviousValue() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.thenValidatedQuantityEquals("1");
    cartCheckout.whenUpdateFirstItemQuantity("0");
    cartCheckout.thenValidatedQuantityEquals("1");
    cartCheckout.thenValidatedOrderTotalContains("R$ 50.99");
    cartCheckout.thenValidatedCartBadgeEquals("1");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-006 should keep previous quantity when value is negative")
  void negativeQuantityKeepsPreviousValue() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.thenValidatedQuantityEquals("1");
    cartCheckout.whenUpdateFirstItemQuantity("-2");
    cartCheckout.thenValidatedQuantityEquals("1");
    cartCheckout.thenValidatedOrderTotalContains("R$ 50.99");
    cartCheckout.thenValidatedCartBadgeEquals("1");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-007 should handle larger valid quantity values correctly")
  void largeQuantityUpdatesSummaryAndBadge() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.whenUpdateFirstItemQuantity("25");
    cartCheckout.thenValidatedQuantityEquals("25");
    cartCheckout.thenValidatedOrderTotalContains("R$ 1274.75");
    cartCheckout.thenValidatedCartBadgeEquals("25");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-008 should normalize decimal input to integer quantity")
  void decimalQuantityIsNormalizedToInteger() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.whenUpdateFirstItemQuantity("2.9");
    cartCheckout.thenValidatedQuantityEquals("2");
    cartCheckout.thenValidatedOrderTotalContains("R$ 101.98");
    cartCheckout.thenValidatedCartBadgeEquals("2");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-009 should remove a single item and show empty cart state")
  void removingSingleItemShowsEmptyCart() {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.thenValidatedDeleteButtonsCount(1);
    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.thenValidatedDeleteButtonsCount(0);
    cartCheckout.thenValidatedCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-010 should add three items, remove all of them, and validate empty cart")
  void addingThreeItemsAndRemovingAllEndsWithEmptyCart() {
    cartCheckout.givenCartWithThreeItems();
    cartCheckout.thenValidatedCartBadgeEquals("3");
    cartCheckout.thenValidatedDeleteButtonsCount(3);
    cartCheckout.whenRemoveAllCartItems();
    cartCheckout.thenValidatedDeleteButtonsCount(0);
    cartCheckout.thenValidatedCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-011 should clear cart after successful checkout with Crédito when leaving thank-you page")
  void cartClearsAfterCheckoutWhenLeavingThankYouPage() {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.thenValidatedCartBadgeEquals("1");

    cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod.CREDIT);
    cartCheckout.thenValidatedUrlContains("/payments");
    cartCheckout.thenValidatedUrlContains("/thank-you");

    cartCheckout.whenLeavingThankYouBackToCatalogAndOpeningCart();
    cartCheckout.thenValidatedUrlContains("/");
    cartCheckout.thenValidatedUrlContains("/cart");
    cartCheckout.thenValidatedCartEmptyStateVisible();
    cartCheckout.thenValidatedCartBadgeEquals("0");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-012 should decrement cart badge after each item removal")
  void cartBadgeDecrementsAfterEachItemRemoval() {
    cartCheckout.givenCartWithThreeItems();
    cartCheckout.thenValidatedCartBadgeEquals("3");

    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.thenValidatedCartBadgeEquals("2");
    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.thenValidatedCartBadgeEquals("1");
    cartCheckout.whenRemoveFirstCartItem();
    cartCheckout.thenValidatedCartBadgeEquals("0");
    cartCheckout.thenValidatedCartEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-013 should validate distinct items vs total quantity in the order summary")
  void summaryShowsDistinctItemsAndSubtotalQuantity() {
    cartCheckout.givenCartWithThreeItems();
    cartCheckout.whenUpdateFirstItemQuantity("2");

    cartCheckout.thenValidatedDistinctItemsTextEquals("Itens (3)");
    cartCheckout.thenValidatedSubtotalTextContains("Subtotal (4 items)");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-014 should display free shipping if cart shipping total is 0")
  void freeShippingAppearsWhenShippingTotalIsZero() {
    cartCheckout.givenCartWithOneItem();

    cartCheckout.thenValidatedShippingTextContains("Grátis");
    cartCheckout.thenValidatedFreeShippingBannerVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-015 should display paid shipping and compute grand total if shipping total is greater than 0")
  void paidShippingAppearsWhenShippingIsGreaterThanZero() {
    cartCheckout.givenCartWithPaidShippingItem("Câmera Vintage");

    cartCheckout.thenValidatedShippingTextEquals("R$ 16.00");
    cartCheckout.thenValidatedFreeShippingBannerHidden();
  }
}
