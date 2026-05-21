package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.CatalogPageAction;
import com.tester.web.e2e.pages.ProductDetailsPageAction;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Catalog")
class CatalogFeatureTest extends AbstractUiTest {

  private CatalogPageAction catalog;
  private ProductDetailsPageAction productDetails;

  @BeforeEach
  void setupPages() {
    catalog = new CatalogPageAction(driver);
    productDetails = new ProductDetailsPageAction(driver);
    catalog.givenUserOnCatalog();
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 should list products when page loads")
  void shouldListProductsWhenPageLoads() {
    catalog.thenValidatedProductImageVisible(1);
    catalog.thenValidatedProductImageVisible(2);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 should search by text and update product count")
  void shouldSearchByTextAndUpdateCount() {
    catalog.whenSearchBy("Smartphone");
    catalog.thenValidatedProductImageVisible(5);
    catalog.thenValidatedProductImageHidden(1);
    catalog.thenValidatedProductsFoundTextContains("1 produto encontrado");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 should filter products by category")
  void shouldFilterProductsByCategory() {
    catalog.whenSelectCategory("Acessórios");
    catalog.thenValidatedProductImageVisible(1);
    catalog.thenValidatedProductImageHidden(5);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 should show empty state when search has no results")
  void shouldShowEmptyStateWhenSearchHasNoResults() {
    catalog.whenSearchBy("PRODUTO_INEXISTENTE_123");
    catalog.thenValidatedEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-005 should navigate to product details when clicking product image")
  void shouldNavigateToProductDetailsWhenClickingImage() {
    catalog.whenClickProductImage(1);
    catalog.thenValidatedUrlEndsWith("/product/1");
    productDetails.thenValidatedProductImageVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-006 should preserve search filter after navigating to details and back")
  void shouldPreserveSearchFilterAfterNavigatingToDetailsAndBack() {
    catalog.whenSearchBy("Smartphone");
    catalog.thenValidatedProductImageVisible(5);
    catalog.thenValidatedProductImageHidden(1);

    catalog.whenClickProductImage(5);
    catalog.thenValidatedUrlEndsWith("/product/5");

    productDetails.whenBackToCatalog();
    catalog.thenValidatedUrlEndsWith("/");
    catalog.thenValidatedSearchValueEquals("Smartphone");
    catalog.thenValidatedProductImageVisible(5);
    catalog.thenValidatedProductImageHidden(1);
  }
}
