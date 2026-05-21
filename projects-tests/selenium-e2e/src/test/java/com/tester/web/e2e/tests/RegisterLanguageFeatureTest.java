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
  @DisplayName("TC-001 should complete PF registration successfully")
  void shouldCompletePfRegistrationSuccessfully() {
    UserData user = TestDataGenerator.randomUser();
    register.givenUserOnRegister();
    register.whenFillPersonalData(user, TestDataGenerator.validCpf());
    register.whenClickNext();
    register.whenFillAddressAndSubmit();
    register.thenValidatedSuccessMessage();
    catalog.thenValidatedUrlEndsWith("/");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 should validate required fields on register step zero")
  void shouldValidateRequiredFieldsOnRegister() {
    register.givenUserOnRegister();
    register.whenClickNext();
    register.thenValidatedErrorMessage("Nome é obrigatório.");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 language toggle should persist after reload")
  void languageTogglePersistsAfterReload() {
    catalog.givenUserOnCatalog();
    catalog.thenValidatedCatalogHeadingVisible("Catálogo de Produtos");

    nav.whenToggleLanguage();
    catalog.thenValidatedCatalogHeadingVisible("Product Catalog");

    driver.navigate().refresh();
    catalog.thenValidatedCatalogHeadingVisible("Product Catalog");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 should render cart empty-state content in English after language toggle")
  void cartEmptyStateRendersInEnglishAfterLanguageToggle() {
    catalog.givenUserOnCatalog();
    nav.whenToggleLanguage();
    catalog.thenValidatedCatalogHeadingVisible("Product Catalog");

    cartCheckout.givenUserOnEmptyCart();
    cartCheckout.thenValidatedPageTextsVisible(
        "Shopping Cart", "Your cart is empty", "Add products from the catalog to get started.");
  }
}
