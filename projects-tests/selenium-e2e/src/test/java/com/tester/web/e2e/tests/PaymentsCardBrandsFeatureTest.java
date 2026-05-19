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
    cartCheckout.assertUrlContains("/payments");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS01 should hide brands initially and show strip after typing card number")
  void shouldShowBrandsStripAfterTypingCardNumber() {
    payments.assertBrandsStripHidden();
    payments.whenFillCardNumber(CardBrand.VISA.cardNumber());
    payments.assertBrandsStripVisible();
  }

  @ParameterizedTest(name = "{displayName}: {0}")
  @EnumSource(CardBrand.class)
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS02 should activate each card brand when matching number is typed")
  void shouldActivateEachCardBrand(CardBrand brand) {
    payments.whenClearCardNumber();
    payments.whenFillCardNumber(brand.cardNumber());
    payments.assertBrandsStripVisible();
    payments.assertBrandVisible(brand);
    payments.assertBrandActive(brand);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS03 should render all required card brands in accepted list")
  void shouldRenderAllRequiredCardBrands() {
    payments.whenFillCardNumber(CardBrand.VISA.cardNumber());
    payments.assertAllBrandsVisible();
  }

  @ParameterizedTest(name = "{displayName}: {0}")
  @EnumSource(CardBrand.class)
  @Severity(SeverityLevel.MINOR)
  @DisplayName("TS04 should capture screenshot for each card brand before confirmation")
  void shouldCaptureScreenshotForEachCardBrand(CardBrand brand) {
    payments.whenFillCreditCardDefaults();
    payments.whenClearCardNumber();
    payments.whenFillCardNumber(brand.cardNumber());
    payments.assertBrandsStripVisible();
    payments.assertBrandVisible(brand);
    payments.assertBrandActive(brand);
    payments.attachPreConfirmationScreenshot(brand);
  }
}
