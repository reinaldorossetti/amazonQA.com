package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.CartCheckoutPageAction;
import com.tester.web.e2e.pages.CatalogPageAction;
import com.tester.web.e2e.pages.NavBarComponent;
import com.tester.web.e2e.pages.RegisterPageAction;
import com.tester.web.e2e.support.TestDataGenerator;
import com.tester.web.e2e.support.TestDataGenerator.UserData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Register and Language")
class RegisterLanguageFeatureTest extends AbstractUiTest {

  private CatalogPageAction catalog;
  private NavBarComponent nav;
  private RegisterPageAction register;
  private CartCheckoutPageAction cartCheckout;

  @BeforeEach
  void setupPages() {
    catalog = new CatalogPageAction(driver);
    nav = new NavBarComponent(driver);
    register = new RegisterPageAction(driver);
    cartCheckout = new CartCheckoutPageAction(driver);
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TS01 should complete PF registration successfully")
  void shouldCompletePfRegistrationSuccessfully() {
    UserData user = TestDataGenerator.randomUser();
    register.givenUserOnRegister();
    register.whenFillPersonalData(user, TestDataGenerator.validCpf());
    register.whenClickNext();
    register.whenFillAddressAndSubmit();
    register.thenValidatedSuccessMessage();
    catalog.assertUrlEndsWith("/");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS03 should validate required fields on register step zero")
  void shouldValidateRequiredFieldsOnRegister() {
    register.givenUserOnRegister();
    register.whenClickNext();
    register.thenValidatedErrorMessage("Nome é obrigatório.");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS01/TS02 language toggle should persist after reload")
  void languageTogglePersistsAfterReload() {
    catalog.givenUserOnCatalog();
    catalog.assertCatalogHeadingVisible("Catálogo de Produtos");

    nav.whenToggleLanguage();
    catalog.assertCatalogHeadingVisible("Product Catalog");

    driver.navigate().refresh();
    catalog.assertCatalogHeadingVisible("Product Catalog");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS04 should render cart empty-state content in English after language toggle")
  void cartEmptyStateRendersInEnglishAfterLanguageToggle() {
    catalog.givenUserOnCatalog();
    nav.whenToggleLanguage();
    catalog.assertCatalogHeadingVisible("Product Catalog");

    cartCheckout.givenUserOnEmptyCart();
    cartCheckout.assertPageTextsVisible(
        "Shopping Cart", "Your cart is empty", "Add products from the catalog to get started.");
  }
}
