# Selenium E2E — Headless Run Report

**Generated:** 2026-05-21 17:12  
**Command:** `mvn test -Dheadless=true`  
**Module:** `projects-tests/selenium-e2e`  
**Result:** PASSED (Maven exit code 0)  
**Full log file:** [`logs/headless-run-20260521-171204.log`](logs/headless-run-20260521-171204.log)

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 100 |
| Passed | 100 |
| Failed | 0 |
| Errors | 0 |
| **Average time per test** | **41.34 s** |
| Median per test | 30.95 s |
| Wall-clock duration | 0.1 min (9 s) |
| Sum of per-test times | 4133.8 s (68.9 min) |
| Parallelism (JUnit) | 1 feature class at a time, up to 3 tests in parallel (`junit-platform.properties`) |

> **Note:** Per-test times can spike on Chrome/session timeouts, not only slow flows.

## Top 10 slowest tests

| Rank | Time (s) | Status | Class | Method |
|------|----------|--------|-------|--------|
| 1 | 128.73 | PASS | `RealPurchaseFlowFeatureTest` | `realLoginProductCheckoutWithCreditCard` |
| 2 | 121.33 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` |
| 3 | 115.72 | PASS | `RealPurchaseFlowFeatureTest` | `catalogSearchCheckoutWithCreditCard` |
| 4 | 112.66 | PASS | `CartCheckoutFeatureTest` | `addingThreeItemsAndRemovingAllEndsWithEmptyCart` |
| 5 | 105.86 | PASS | `RealPurchaseFlowFeatureTest` | `multipleProductsCheckoutWithPix` |
| 6 | 99.53 | PASS | `CartCheckoutFeatureTest` | `cartClearsAfterCheckoutWhenLeavingThankYouPage` |
| 7 | 97.66 | PASS | `OrdersCheckoutFeatureTest` | `shouldStayOnCartWhenOrderCreationFails` |
| 8 | 96.22 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[1]` |
| 9 | 95.58 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[2]` |
| 10 | 95.26 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[4]` |

## Average time by test class

| Class | Tests | Avg (s) | Total suite (s) |
|-------|-------|---------|-----------------|
| `RealPurchaseFlowFeatureTest` | 3 | 116.77 | 350.3 |
| `OrdersCheckoutFeatureTest` | 4 | 89.19 | 356.8 |
| `PaymentsCardBrandsFeatureTest` | 22 | 73.26 | 1611.8 |
| `CartCheckoutFeatureTest` | 18 | 60.57 | 1090.4 |
| `SecurityFeatureTest` | 3 | 41.76 | 125.3 |
| `CatalogFeatureTest` | 6 | 27.55 | 165.3 |
| `RegisterLoginFeatureTest` | 3 | 24.34 | 73.0 |
| `AdminManagementFeatureTest` | 2 | 19.17 | 38.4 |
| `SupportProductsFeatureTest` | 8 | 13.40 | 107.3 |
| `RegisterLanguageFeatureTest` | 4 | 11.94 | 47.8 |
| `ProductDetailsFeatureTest` | 4 | 9.72 | 38.9 |
| `LoginFeatureTest` | 8 | 7.39 | 59.1 |
| `RegisterFeatureTest` | 10 | 6.86 | 68.7 |
| `AdminLoginSmokeTest` | 1 | 0.83 | 0.8 |
| `JavaModernFeaturesTest` | 4 | 0.10 | 0.5 |

## Duration by test class (Surefire suite time)

| Class | Suite (s) | Tests | Pass | Fail | Error |
|-------|-----------|-------|------|------|-------|
| `PaymentsCardBrandsFeatureTest` | 1611.8 | 22 | 22 | 0 | 0 |
| `CartCheckoutFeatureTest` | 1090.4 | 18 | 18 | 0 | 0 |
| `OrdersCheckoutFeatureTest` | 356.8 | 4 | 4 | 0 | 0 |
| `RealPurchaseFlowFeatureTest` | 350.3 | 3 | 3 | 0 | 0 |
| `CatalogFeatureTest` | 165.3 | 6 | 6 | 0 | 0 |
| `SecurityFeatureTest` | 125.3 | 3 | 3 | 0 | 0 |
| `SupportProductsFeatureTest` | 107.3 | 8 | 8 | 0 | 0 |
| `RegisterLoginFeatureTest` | 73.0 | 3 | 3 | 0 | 0 |
| `RegisterFeatureTest` | 68.7 | 10 | 10 | 0 | 0 |
| `LoginFeatureTest` | 59.1 | 8 | 8 | 0 | 0 |
| `RegisterLanguageFeatureTest` | 47.8 | 4 | 4 | 0 | 0 |
| `ProductDetailsFeatureTest` | 38.9 | 4 | 4 | 0 | 0 |
| `AdminManagementFeatureTest` | 38.4 | 2 | 2 | 0 | 0 |
| `AdminLoginSmokeTest` | 0.8 | 1 | 1 | 0 | 0 |
| `JavaModernFeaturesTest` | 0.5 | 4 | 4 | 0 | 0 |

## All tests sorted by duration

| Time (s) | Status | Class | Method |
|----------|--------|-------|--------|
| 128.73 | PASS | `RealPurchaseFlowFeatureTest` | `realLoginProductCheckoutWithCreditCard` |
| 121.33 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` |
| 115.72 | PASS | `RealPurchaseFlowFeatureTest` | `catalogSearchCheckoutWithCreditCard` |
| 112.66 | PASS | `CartCheckoutFeatureTest` | `addingThreeItemsAndRemovingAllEndsWithEmptyCart` |
| 105.86 | PASS | `RealPurchaseFlowFeatureTest` | `multipleProductsCheckoutWithPix` |
| 99.53 | PASS | `CartCheckoutFeatureTest` | `cartClearsAfterCheckoutWhenLeavingThankYouPage` |
| 97.66 | PASS | `OrdersCheckoutFeatureTest` | `shouldStayOnCartWhenOrderCreationFails` |
| 96.22 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[1]` |
| 95.58 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[2]` |
| 95.26 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[4]` |
| 95.23 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[3]` |
| 94.91 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowPaymentErrorWhenPaymentApiReturnsBadRequest` |
| 94.39 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowNotFoundErrorWhenPaymentApiReturnsNotFound` |
| 73.68 | PASS | `CartCheckoutFeatureTest` | `removingSingleItemShowsEmptyCart` |
| 73.43 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[10]` |
| 72.64 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[9]` |
| 72.26 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[7]` |
| 71.96 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[6]` |
| 71.81 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[8]` |
| 70.88 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[1]` |
| 70.87 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[2]` |
| 70.79 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[5]` |
| 70.77 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[7]` |
| 70.74 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldRenderAllRequiredCardBrands` |
| 70.70 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[9]` |
| 70.68 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[6]` |
| 70.66 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[8]` |
| 70.56 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[10]` |
| 70.48 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[3]` |
| 70.39 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[2]` |
| 70.31 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[4]` |
| 70.28 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[4]` |
| 70.24 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[5]` |
| 69.98 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[3]` |
| 69.93 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[1]` |
| 69.84 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserIsRedirectedToPaymentFromCartCheckout` |
| 69.80 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowEmptyCartErrorWhenOrderApiReturnsBadRequest` |
| 68.86 | PASS | `SecurityFeatureTest` | `guestCheckoutRedirectsToLogin` |
| 63.03 | PASS | `CatalogFeatureTest` | `shouldPreserveSearchFilterAfterNavigatingToDetailsAndBack` |
| 60.85 | PASS | `CartCheckoutFeatureTest` | `decimalQuantityIsNormalizedToInteger` |
| 54.66 | PASS | `SecurityFeatureTest` | `logoutRevokesProtectedRouteAccess` |
| 52.54 | PASS | `CartCheckoutFeatureTest` | `cartBadgeDecrementsAfterEachItemRemoval` |
| 48.93 | PASS | `CartCheckoutFeatureTest` | `paidShippingAppearsWhenShippingIsGreaterThanZero` |
| 45.18 | PASS | `SupportProductsFeatureTest` | `supportShouldDeleteProductViaDeleteButton` |
| 44.48 | PASS | `CatalogFeatureTest` | `shouldSearchByTextAndUpdateCount` |
| 39.96 | PASS | `RegisterLoginFeatureTest` | `shouldRegisterAndLoginWithSameCredentials` |
| 39.50 | PASS | `CartCheckoutFeatureTest` | `summaryShowsDistinctItemsAndSubtotalQuantity` |
| 34.54 | PASS | `SupportProductsFeatureTest` | `supportShouldOpenCreateProductModal` |
| 32.00 | PASS | `RegisterFeatureTest` | `shouldRejectShortPasswordOnStepZero` |
| 31.49 | PASS | `AdminManagementFeatureTest` | `adminShouldDeleteCreatedProduct` |
| 30.41 | PASS | `LoginFeatureTest` | `emptyFieldsShowValidationAlert` |
| 30.19 | PASS | `RegisterLanguageFeatureTest` | `languageTogglePersistsAfterReload` |
| 30.04 | PASS | `CartCheckoutFeatureTest` | `zeroQuantityKeepsPreviousValue` |
| 29.89 | PASS | `RegisterLoginFeatureTest` | `shouldLogoutAndLoginAgainWithSameCredentials` |
| 29.51 | PASS | `CartCheckoutFeatureTest` | `negativeQuantityKeepsPreviousValue` |
| 29.31 | PASS | `CartCheckoutFeatureTest` | `validQuantityUpdatesInputTotalAndBadge` |
| 29.28 | PASS | `CartCheckoutFeatureTest` | `largeQuantityUpdatesSummaryAndBadge` |
| 29.15 | PASS | `CartCheckoutFeatureTest` | `freeShippingAppearsWhenShippingTotalIsZero` |
| 26.86 | PASS | `ProductDetailsFeatureTest` | `shouldHandleInvalidProductId` |
| 26.71 | PASS | `CatalogFeatureTest` | `shouldNavigateToProductDetailsWhenClickingImage` |
| 22.10 | PASS | `CatalogFeatureTest` | `shouldFilterProductsByCategory` |
| 10.92 | PASS | `LoginFeatureTest` | `credentialsShouldCapAtThirtyCharacters` |
| 9.65 | PASS | `RegisterFeatureTest` | `shouldRejectDuplicateEmail` |
| 9.39 | PASS | `RegisterLanguageFeatureTest` | `shouldCompletePfRegistrationSuccessfully` |
| 7.11 | PASS | `CatalogFeatureTest` | `shouldShowEmptyStateWhenSearchHasNoResults` |
| 6.84 | PASS | `AdminManagementFeatureTest` | `adminShouldDeleteCreatedUser` |
| 6.12 | PASS | `SupportProductsFeatureTest` | `emptySearchShouldShowEmptyMessage` |
| 5.90 | PASS | `SupportProductsFeatureTest` | `supportShouldOpenEditModalWithPrefilledData` |
| 5.43 | PASS | `RegisterFeatureTest` | `shouldSuccessfullyRegisterWithValidData` |
| 5.09 | PASS | `ProductDetailsFeatureTest` | `shouldAddProductToCartAndUpdateBadge` |
| 4.49 | PASS | `SupportProductsFeatureTest` | `supportShouldFilterProductsBySearch` |
| 4.45 | PASS | `RegisterLanguageFeatureTest` | `cartEmptyStateRendersInEnglishAfterLanguageToggle` |
| 4.25 | PASS | `SupportProductsFeatureTest` | `supportShouldAccessProductManagementScreen` |
| 3.77 | PASS | `SupportProductsFeatureTest` | `modalShouldValidateRequiredProductName` |
| 3.72 | PASS | `RegisterLanguageFeatureTest` | `shouldValidateRequiredFieldsOnRegister` |
| 3.72 | PASS | `ProductDetailsFeatureTest` | `shouldDisplayMainProductData` |
| 3.65 | PASS | `LoginFeatureTest` | `successfulLoginRedirectsToAccountArea` |
| 3.57 | PASS | `RegisterFeatureTest` | `shouldValidateMissingRequiredField(RequiredField)[1]` |
| 3.54 | PASS | `LoginFeatureTest` | `sessionShouldPersistAfterReload` |
| 3.42 | PASS | `RegisterFeatureTest` | `shouldValidateMissingRequiredField(RequiredField)[2]` |
| 3.24 | PASS | `CartCheckoutFeatureTest` | `emptyCartShowsEmptyStateAndCheckoutUnavailable` |
| 3.20 | PASS | `RegisterFeatureTest` | `shouldRejectInvalidEmailFormat` |
| 3.20 | PASS | `ProductDetailsFeatureTest` | `shouldReturnToCatalogFromProductDetails` |
| 3.19 | PASS | `RegisterFeatureTest` | `shouldValidateMissingRequiredField(RequiredField)[3]` |
| 3.17 | PASS | `RegisterLoginFeatureTest` | `shouldRejectWrongPasswordAfterRegistration` |
| 3.15 | PASS | `RegisterFeatureTest` | `shouldRejectMismatchedPasswords` |
| 2.96 | PASS | `SupportProductsFeatureTest` | `supportShouldSeeLoadedProductsTable` |
| 2.92 | PASS | `LoginFeatureTest` | `loginWithNextRedirectShouldGoToCart` |
| 2.75 | PASS | `LoginFeatureTest` | `invalidCredentialsShowErrorAlert` |
| 2.73 | PASS | `RegisterFeatureTest` | `shouldValidateMissingRequiredField(RequiredField)[4]` |
| 2.56 | PASS | `LoginFeatureTest` | `blankEmailShouldShowRequiredFieldsValidation` |
| 2.33 | PASS | `LoginFeatureTest` | `emptyPasswordShowsValidationAlert` |
| 2.27 | PASS | `RegisterFeatureTest` | `shouldValidateAllEmptyFields` |
| 1.85 | PASS | `CatalogFeatureTest` | `shouldListProductsWhenPageLoads` |
| 1.76 | PASS | `SecurityFeatureTest` | `directThankYouAccessRedirectsWhenGuest` |
| 0.83 | PASS | `AdminLoginSmokeTest` | `adminAndSupportLoginAvailable` |
| 0.38 | PASS | `JavaModernFeaturesTest` | `recordHoldsGeneratedUserData` |
| 0.01 | PASS | `JavaModernFeaturesTest` | `textBlockBuildsLoginJsonPayload` |
| 0.01 | PASS | `JavaModernFeaturesTest` | `formattedBuildsTestIdSelector` |
| 0.01 | PASS | `JavaModernFeaturesTest` | `recordAndSwitchExpressionResolveBrowserAliases` |