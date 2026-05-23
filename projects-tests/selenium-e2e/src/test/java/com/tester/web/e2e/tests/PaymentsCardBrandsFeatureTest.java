package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import com.tester.web.e2e.pages.CartCheckoutPageAction;
import com.tester.web.e2e.pages.PaymentsPageAction;
import com.tester.web.e2e.support.CardBrand;
import com.tester.web.e2e.support.LoginTestData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Payments Card Brands")
class PaymentsCardBrandsFeatureTest extends AbstractUiTest {

  private CartCheckoutPageAction cartCheckout;
  private PaymentsPageAction payments;

  @BeforeEach
  void setupPages() {
    cartCheckout = new CartCheckoutPageAction(driver);
    payments = new PaymentsPageAction(driver);
    cartCheckout.givenLoggedInUser(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, "Olá, Reinaldo");
    cartCheckout.givenCartWithOneItem();
    cartCheckout.whenAuthenticatedUserProceedsToCheckout();
    cartCheckout.thenValidatedUrlContains("/payments");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-001 should hide brands initially and show strip after typing card number")
  void shouldShowBrandsStripAfterTypingCardNumber() {
    payments.thenValidatedBrandsStripHidden();
    payments.whenFillCardNumber(CardBrand.VISA.cardNumber());
    payments.thenValidatedBrandsStripVisible();
  }

  @ParameterizedTest(name = "{displayName}: {0}")
  @EnumSource(CardBrand.class)
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 should activate each card brand when matching number is typed")
  void shouldActivateEachCardBrand(CardBrand brand) throws InterruptedException {
    payments.whenClearCardNumber();
    payments.whenFillCardNumber(brand.cardNumber());
    payments.thenValidatedBrandsStripVisible();
    payments.thenValidatedBrandVisible(brand);
    payments.thenValidatedBrandActive(brand);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 should render all required card brands in accepted list")
  void shouldRenderAllRequiredCardBrands() {
    payments.whenFillCardNumber(CardBrand.VISA.cardNumber());
    payments.thenValidatedAllBrandsVisible();
  }

  @ParameterizedTest(name = "{displayName}: {0}")
  @EnumSource(CardBrand.class)
  @Severity(SeverityLevel.MINOR)
  @DisplayName("TC-004 should capture screenshot for each card brand before confirmation")
  void shouldCaptureScreenshotForEachCardBrand(CardBrand brand) throws InterruptedException {
    payments.whenFillCreditCardDefaults();
    payments.whenClearCardNumber();
    payments.whenFillCardNumber(brand.cardNumber());
    payments.thenValidatedBrandsStripVisible();
    payments.thenValidatedBrandVisible(brand);
    payments.thenValidatedBrandActive(brand);
    payments.attachPreConfirmationScreenshot(brand);
  }
}
