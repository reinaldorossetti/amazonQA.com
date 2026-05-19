package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.ProductDetailsPageAction;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Product Details")
class ProductDetailsFeatureTest extends AbstractUiTest {

  private ProductDetailsPageAction productDetails;

  @BeforeEach
  void setupPage() {
    productDetails = new ProductDetailsPageAction(driver);
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TS01 should display main product data")
  void shouldDisplayMainProductData() {
    productDetails.givenUserOnValidProduct(1);
    productDetails.assertProductHeadingVisible("Relógio Elegante");
    productDetails.assertProductImageVisible();
    productDetails.assertPriceVisible("R$ 50.99");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS02/TS03 should add product to cart and update badge")
  void shouldAddProductToCartAndUpdateBadge() {
    productDetails.givenUserOnValidProduct(1);
    productDetails.whenSelectQuantity("2");
    productDetails.whenAddToCart();
    productDetails.assertCartBadgeEquals("2");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS04 should handle invalid product id")
  void shouldHandleInvalidProductId() {
    productDetails.givenUserOnProduct(99999);
    productDetails.assertNotFoundMessageVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TS05 should return to catalog from product details")
  void shouldReturnToCatalogFromProductDetails() {
    productDetails.givenUserOnValidProduct(1);
    productDetails.whenBackToCatalog();
    productDetails.assertUrlIsCatalogHome();
  }
}
