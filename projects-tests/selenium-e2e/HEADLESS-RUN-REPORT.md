# Selenium E2E — Headless Run Report

**Generated:** 2026-05-21 16:49  
**Command:** `mvn test -Dheadless=true`  
**Module:** `projects-tests/selenium-e2e`  
**Result:** FAILED (Maven exit code 1)  
**Full log file:** [`logs/headless-run-20260521-164900.log`](logs/headless-run-20260521-164900.log)

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 100 |
| Passed | 99 |
| Failed | 0 |
| Errors | 1 |
| **Average time per test** | **44.80 s** |
| Median per test | 31.81 s |
| Wall-clock duration | 28.6 min (1719 s) |
| Sum of per-test times | 4480.3 s (74.7 min) |
| Parallelism (JUnit) | 1 class at a time (`junit-platform.properties`) |

> **Note:** Per-test times can spike on Chrome/session timeouts, not only slow flows.

## Top 10 slowest tests

| Rank | Time (s) | Status | Class | Method |
|------|----------|--------|-------|--------|
| 1 | 227.55 | PASS | `RealPurchaseFlowFeatureTest` | `realLoginProductCheckoutWithCreditCard` |
| 2 | 221.03 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` |
| 3 | 198.95 | PASS | `OrdersCheckoutFeatureTest` | `shouldStayOnCartWhenOrderCreationFails` |
| 4 | 131.18 | PASS | `CartCheckoutFeatureTest` | `cartClearsAfterCheckoutWhenLeavingThankYouPage` |
| 5 | 115.70 | PASS | `RealPurchaseFlowFeatureTest` | `catalogSearchCheckoutWithCreditCard` |
| 6 | 112.63 | PASS | `CartCheckoutFeatureTest` | `addingThreeItemsAndRemovingAllEndsWithEmptyCart` |
| 7 | 105.96 | PASS | `RealPurchaseFlowFeatureTest` | `multipleProductsCheckoutWithPix` |
| 8 | 95.74 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[1]` |
| 9 | 95.70 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[3]` |
| 10 | 95.54 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[4]` |

## Average time by test class

| Class | Tests | Avg (s) | Total suite (s) |
|-------|-------|---------|-----------------|
| `RealPurchaseFlowFeatureTest` | 3 | 149.74 | 449.2 |
| `OrdersCheckoutFeatureTest` | 4 | 114.64 | 458.6 |
| `PaymentsCardBrandsFeatureTest` | 22 | 77.52 | 1705.6 |
| `CartCheckoutFeatureTest` | 18 | 63.47 | 1192.5 |
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

## Tests with errors or failures

| Status | Class | Method | Time (s) | Cause (excerpt) |
|--------|-------|--------|----------|-----------------|
| ERROR | `CartCheckoutFeatureTest` | `decimalQuantityIsNormalizedToInteger` | 31.61 | Timeout when executing request (GET http://localhost:56933/json/version) Build info: version: '4.44.0', revision: 'da2039b' System info: os.name: 'Windows 10', os.arch: 'amd64', os… |

See [`logs/headless-run-20260521-164900.log`](logs/headless-run-20260521-164900.log) for full stack traces and Surefire output.

## Duration by test class (Surefire suite time)

| Class | Suite (s) | Tests | Pass | Fail | Error |
|-------|-----------|-------|------|------|-------|
| `PaymentsCardBrandsFeatureTest` | 1705.6 | 22 | 22 | 0 | 0 |
| `CartCheckoutFeatureTest` | 1192.5 | 18 | 17 | 0 | 1 |
| `OrdersCheckoutFeatureTest` | 458.6 | 4 | 4 | 0 | 0 |
| `RealPurchaseFlowFeatureTest` | 449.2 | 3 | 3 | 0 | 0 |
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
| 227.55 | PASS | `RealPurchaseFlowFeatureTest` | `realLoginProductCheckoutWithCreditCard` |
| 221.03 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` |
| 198.95 | PASS | `OrdersCheckoutFeatureTest` | `shouldStayOnCartWhenOrderCreationFails` |
| 131.18 | PASS | `CartCheckoutFeatureTest` | `cartClearsAfterCheckoutWhenLeavingThankYouPage` |
| 115.70 | PASS | `RealPurchaseFlowFeatureTest` | `catalogSearchCheckoutWithCreditCard` |
| 112.63 | PASS | `CartCheckoutFeatureTest` | `addingThreeItemsAndRemovingAllEndsWithEmptyCart` |
| 105.96 | PASS | `RealPurchaseFlowFeatureTest` | `multipleProductsCheckoutWithPix` |
| 95.74 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[1]` |
| 95.70 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[3]` |
| 95.54 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[4]` |
| 95.32 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[2]` |
| 95.10 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowNotFoundErrorWhenPaymentApiReturnsNotFound` |
| 94.81 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowPaymentErrorWhenPaymentApiReturnsBadRequest` |
| 76.51 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[9]` |
| 74.05 | PASS | `CartCheckoutFeatureTest` | `removingSingleItemShowsEmptyCart` |
| 72.33 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[8]` |
| 70.81 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[2]` |
| 70.77 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[4]` |
| 70.65 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[5]` |
| 70.64 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[10]` |
| 70.62 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[7]` |
| 70.62 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[3]` |
| 70.59 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[6]` |
| 70.55 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[1]` |
| 70.49 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldRenderAllRequiredCardBrands` |
| 70.25 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[2]` |
| 70.16 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[3]` |
| 70.11 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[4]` |
| 70.07 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[1]` |
| 70.01 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[8]` |
| 69.93 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[10]` |
| 69.90 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[9]` |
| 69.88 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[7]` |
| 69.88 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserIsRedirectedToPaymentFromCartCheckout` |
| 69.79 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[5]` |
| 69.75 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[6]` |
| 69.72 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowEmptyCartErrorWhenOrderApiReturnsBadRequest` |
| 68.86 | PASS | `SecurityFeatureTest` | `guestCheckoutRedirectsToLogin` |
| 63.03 | PASS | `CatalogFeatureTest` | `shouldPreserveSearchFilterAfterNavigatingToDetailsAndBack` |
| 54.66 | PASS | `SecurityFeatureTest` | `logoutRevokesProtectedRouteAccess` |
| 54.04 | PASS | `CartCheckoutFeatureTest` | `cartBadgeDecrementsAfterEachItemRemoval` |
| 49.16 | PASS | `CartCheckoutFeatureTest` | `paidShippingAppearsWhenShippingIsGreaterThanZero` |
| 47.13 | PASS | `CartCheckoutFeatureTest` | `emptyCartShowsEmptyStateAndCheckoutUnavailable` |
| 45.18 | PASS | `SupportProductsFeatureTest` | `supportShouldDeleteProductViaDeleteButton` |
| 44.48 | PASS | `CatalogFeatureTest` | `shouldSearchByTextAndUpdateCount` |
| 39.96 | PASS | `RegisterLoginFeatureTest` | `shouldRegisterAndLoginWithSameCredentials` |
| 39.45 | PASS | `CartCheckoutFeatureTest` | `summaryShowsDistinctItemsAndSubtotalQuantity` |
| 34.54 | PASS | `SupportProductsFeatureTest` | `supportShouldOpenCreateProductModal` |
| 33.74 | PASS | `CartCheckoutFeatureTest` | `zeroQuantityKeepsPreviousValue` |
| 32.00 | PASS | `RegisterFeatureTest` | `shouldRejectShortPasswordOnStepZero` |
| 31.61 | ERROR | `CartCheckoutFeatureTest` | `decimalQuantityIsNormalizedToInteger` |
| 31.49 | PASS | `AdminManagementFeatureTest` | `adminShouldDeleteCreatedProduct` |
| 30.41 | PASS | `LoginFeatureTest` | `emptyFieldsShowValidationAlert` |
| 30.19 | PASS | `RegisterLanguageFeatureTest` | `languageTogglePersistsAfterReload` |
| 29.89 | PASS | `RegisterLoginFeatureTest` | `shouldLogoutAndLoginAgainWithSameCredentials` |
| 29.43 | PASS | `CartCheckoutFeatureTest` | `validQuantityUpdatesInputTotalAndBadge` |
| 29.40 | PASS | `CartCheckoutFeatureTest` | `negativeQuantityKeepsPreviousValue` |
| 29.23 | PASS | `CartCheckoutFeatureTest` | `largeQuantityUpdatesSummaryAndBadge` |
| 29.14 | PASS | `CartCheckoutFeatureTest` | `freeShippingAppearsWhenShippingTotalIsZero` |
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