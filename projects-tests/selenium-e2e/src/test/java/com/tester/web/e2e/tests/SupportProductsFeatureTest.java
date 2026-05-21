package com.tester.web.e2e.tests;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.SupportProductsPageAction;
import com.tester.web.e2e.support.ApiClient;
import com.tester.web.e2e.support.ApiClient.CreatedProduct;
import com.tester.web.e2e.support.ApiClient.LoginResponse;
import com.tester.web.e2e.support.AuthSessionHelper;
import com.tester.web.e2e.support.TestDataGenerator;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Support Products")
class SupportProductsFeatureTest extends AbstractUiTest {

  private SupportProductsPageAction supportProducts;
  private LoginResponse supportSession;

  @BeforeEach
  void setupPage() {
    supportProducts = new SupportProductsPageAction(driver);
    supportSession =
        ApiClient.tryLoginSupport()
            .orElse(null);
    Assumptions.assumeTrue(supportSession != null, ApiClient::describeSupportLoginFailure);
    AuthSessionHelper.setAuthenticatedSession(driver, supportSession);
    supportProducts.givenSupportOnProductsPage();
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 support should access product management screen")
  void supportShouldAccessProductManagementScreen() {
    supportProducts.thenValidatedProductManagementScreenVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 support should see loaded products table")
  void supportShouldSeeLoadedProductsTable() {
    supportProducts.thenValidatedProductsTableVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 support should filter products by search field")
  void supportShouldFilterProductsBySearch() {
    CreatedProduct created =
        ApiClient.createProduct(supportSession.accessToken(), "E2E-UI Selenium Filter " + TestDataGenerator.randomNumeric8());
    try {
      driver.navigate().refresh();
      supportProducts.givenSupportOnProductsPage();
      supportProducts.whenSearch(created.name().split(" ")[0]);
      supportProducts.thenValidatedProductListed(created.name());
    } finally {
      ApiClient.deleteProduct(supportSession.accessToken(), created.id());
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 empty search should show empty message")
  void emptySearchShouldShowEmptyMessage() {
    supportProducts.whenSearch("__inexistente_" + TestDataGenerator.randomNumeric8() + "__");
    supportProducts.thenValidatedEmptySearchStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-005 support should open create product modal")
  void supportShouldOpenCreateProductModal() {
    supportProducts.whenOpenNewProductModal();
    supportProducts.thenValidatedCreateProductDialogVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-006 modal should validate required product name")
  void modalShouldValidateRequiredProductName() {
    supportProducts.whenOpenNewProductModal();
    supportProducts.whenSubmitNewProductWithoutName();
    supportProducts.thenValidatedRequiredNameValidationVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-007 support should open edit modal with prefilled data")
  void supportShouldOpenEditModalWithPrefilledData() {
    CreatedProduct created =
        ApiClient.createProduct(supportSession.accessToken(), "E2E-UI Selenium Edit " + TestDataGenerator.randomNumeric8());
    try {
      driver.navigate().refresh();
      supportProducts.givenSupportOnProductsPage();
      supportProducts.whenOpenEditProduct(created.id());
      supportProducts.thenValidatedEditDialogWithPrefilledName(created.name());
      supportProducts.whenCloseDialog();
    } finally {
      ApiClient.deleteProduct(supportSession.accessToken(), created.id());
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-008 support should delete product via delete button")
  void supportShouldDeleteProductViaDeleteButton() {
    CreatedProduct created =
        ApiClient.createProduct(supportSession.accessToken(), "E2E-UI Selenium Delete " + TestDataGenerator.randomNumeric8());
    driver.navigate().refresh();
    supportProducts.givenSupportOnProductsPage();
    supportProducts.thenValidatedProductListed(created.name());
    supportProducts.whenDeleteProduct(created.id());
    supportProducts.thenValidatedProductNotListed(created.id());
  }
}
