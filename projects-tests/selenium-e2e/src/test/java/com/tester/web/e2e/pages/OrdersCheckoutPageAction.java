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

  public void whenProceedToCheckoutUnderMock(Route mockRoute) {
    try (NetworkInterceptor ignored = new NetworkInterceptor(driver, mockRoute)) {
      whenAuthenticatedUserProceedsToCheckout();
    }
  }

  public void whenPaymentFlowUnderMock(Route mockRoute, PaymentMethod paymentMethod) {
    try (NetworkInterceptor ignored = new NetworkInterceptor(driver, mockRoute)) {
      whenAuthenticatedUserProceedsToCheckout();
      selectPaymentMethod(paymentMethod);
      clickSubmitPayment(paymentMethod);
    }
  }

  public void thenValidatedStaysOnCartWithMessage(String... messages) {
    assertUrlContains("/cart");
    assertPageTextsVisible(messages);
    attachScreenshot("ordersCheckoutCartError");
  }

  public void thenValidatedStaysOnCartWithOneOf(String... messages) {
    assertUrlContains("/cart");
    assertPageContainsOneOf(messages);
    attachScreenshot("ordersCheckoutCartError");
  }

  public void thenValidatedCheckoutErrorMessage(String... messages) {
    assertPageTextsVisible(messages);
    attachScreenshot("ordersCheckoutError");
  }
}
