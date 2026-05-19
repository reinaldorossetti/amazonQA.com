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
  @DisplayName("TS01 should list products when page loads")
  void shouldListProductsWhenPageLoads() {
    catalog.assertProductImageVisible(1);
    catalog.assertProductImageVisible(2);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS02 should search by text and update product count")
  void shouldSearchByTextAndUpdateCount() {
    catalog.whenSearchBy("Smartphone");
    catalog.assertProductImageVisible(5);
    catalog.assertProductImageHidden(1);
    catalog.assertProductsFoundTextContains("1 produto encontrado");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS03 should filter products by category")
  void shouldFilterProductsByCategory() {
    catalog.whenSelectCategory("Acessórios");
    catalog.assertProductImageVisible(1);
    catalog.assertProductImageHidden(5);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS04 should show empty state when search has no results")
  void shouldShowEmptyStateWhenSearchHasNoResults() {
    catalog.whenSearchBy("PRODUTO_INEXISTENTE_123");
    catalog.assertEmptyStateVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS05 should navigate to product details when clicking product image")
  void shouldNavigateToProductDetailsWhenClickingImage() {
    catalog.whenClickProductImage(1);
    catalog.assertUrlEndsWith("/product/1");
    productDetails.assertProductImageVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS06 should preserve search filter after navigating to details and back")
  void shouldPreserveSearchFilterAfterNavigatingToDetailsAndBack() {
    catalog.whenSearchBy("Smartphone");
    catalog.assertProductImageVisible(5);
    catalog.assertProductImageHidden(1);

    catalog.whenClickProductImage(5);
    catalog.assertUrlEndsWith("/product/5");

    productDetails.whenBackToCatalog();
    catalog.assertUrlEndsWith("/");
    catalog.assertSearchValueEquals("Smartphone");
    catalog.assertProductImageVisible(5);
    catalog.assertProductImageHidden(1);
  }
}
