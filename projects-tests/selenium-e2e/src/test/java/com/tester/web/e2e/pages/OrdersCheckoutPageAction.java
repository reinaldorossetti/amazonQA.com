package com.tester.web.e2e.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.devtools.NetworkInterceptor;
import org.openqa.selenium.remote.http.Route;

import com.tester.web.e2e.support.ApiClient;
import com.tester.web.e2e.support.AuthSessionHelper;
import com.tester.web.e2e.support.PaymentMethod;

public class OrdersCheckoutPageAction extends CartCheckoutPageAction {

  public OrdersCheckoutPageAction(WebDriver driver) {
    super(driver);
  }

  public void givenLoggedInApiUserWithOneCartItem(String email, String password) {
    AuthSessionHelper.setAuthenticatedSession(driver, ApiClient.login(email, password));
    givenCartWithOneItem();
  }

  public void whenProceedToCheckoutUnderMock(Route mockRoute, String... expectedToastMessages) {
    try (NetworkInterceptor ignored = new NetworkInterceptor(driver, mockRoute)) {
      whenAuthenticatedUserProceedsToCheckout();
      ensureToastContainsOneOf(expectedToastMessages);
    }
  }

  public void whenPaymentFlowUnderMock(
      Route mockRoute, PaymentMethod paymentMethod, String... expectedToastMessages) {
    try (NetworkInterceptor ignored = new NetworkInterceptor(driver, mockRoute)) {
      whenAuthenticatedUserProceedsToCheckout();
      selectPaymentMethod(paymentMethod);
      clickSubmitPayment(paymentMethod);
      ensureToastContainsOneOf(expectedToastMessages);
    }
  }

  public void thenValidatedStaysOnCart() {
    ensureUrlContains("/cart");
    attachScreenshot("ordersCheckoutCartError");
  }

  public void thenValidatedCheckoutOnPaymentsPage() {
    ensureUrlContains("/payments");
    attachScreenshot("ordersCheckoutPayments");
  }
}
