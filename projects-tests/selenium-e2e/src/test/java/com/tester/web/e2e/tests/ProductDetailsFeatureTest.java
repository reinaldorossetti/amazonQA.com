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
  @DisplayName("TC-001 should display main product data")
  void shouldDisplayMainProductData() {
    productDetails.givenUserOnValidProduct(1);
    productDetails.thenValidatedProductHeadingVisible("Relógio Elegante");
    productDetails.thenValidatedProductImageVisible();
    productDetails.thenValidatedPriceVisible("R$ 50.99");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 should add product to cart and update badge")
  void shouldAddProductToCartAndUpdateBadge() {
    productDetails.givenUserOnValidProduct(1);
    productDetails.whenSelectQuantity("2");
    productDetails.whenAddToCart();
    productDetails.thenValidatedCartBadgeEquals("2");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 should handle invalid product id")
  void shouldHandleInvalidProductId() {
    productDetails.givenUserOnProduct(99999);
    productDetails.thenValidatedNotFoundMessageVisible();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 should return to catalog from product details")
  void shouldReturnToCatalogFromProductDetails() {
    productDetails.givenUserOnValidProduct(1);
    productDetails.whenBackToCatalog();
    productDetails.thenValidatedUrlIsCatalogHome();
  }
}
