package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.config.TestEnvironment;
import com.tester.web.e2e.pages.CartCheckoutPageAction;
import com.tester.web.e2e.pages.NavBarComponent;
import com.tester.web.e2e.support.LoginTestData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Security")
class SecurityFeatureTest extends AbstractUiTest {

  private CartCheckoutPageAction cartCheckout;
  private NavBarComponent nav;

  @BeforeEach
  void setupPages() {
    cartCheckout = new CartCheckoutPageAction(driver);
    nav = new NavBarComponent(driver);
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 guest checkout should redirect to login with next cart parameter")
  void guestCheckoutRedirectsToLogin() {
    cartCheckout.givenUserOnCatalog();
    cartCheckout.givenCartWithOneItem();
    cartCheckout.whenGuestTriesToCheckoutFromCart();
    cartCheckout.thenValidatedUrlMatches(".*/login\\?next=(%2Fcart|/cart).*");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 direct thank-you access without login should redirect")
  void directThankYouAccessRedirectsWhenGuest() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/thank-you");
    cartCheckout.thenValidatedUrlMatches(".*/login.*|.*/$");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 logout should revoke protected route access")
  void logoutRevokesProtectedRouteAccess() {
    cartCheckout.givenLoggedInUser(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, "Olá, Reinaldo");
    nav.whenLogout();
    nav.thenValidatedUserGreetingHidden();

    driver.navigate().to(TestEnvironment.baseUrl() + "/thank-you");
    cartCheckout.thenValidatedUrlMatches(".*/login\\?next=(%2Fthank-you|/thank-you).*");
  }
}
