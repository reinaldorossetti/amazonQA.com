# Selenium E2E — Headless Run Report

**Generated:** 2026-05-21 18:07  
**Command:** `mvn test -Dheadless=true`  
**Module:** `projects-tests/selenium-e2e`  
**Result:** FAILED (Maven exit code 1)  
**Full log file:** [`logs/headless-run-20260521-180707.log`](logs/headless-run-20260521-180707.log)

## Summary

| Metric | Value |
|--------|-------|
| Total tests | 69 |
| Passed | 55 |
| Failed | 9 |
| Errors | 5 |
| **Average time per test** | **82.25 s** |
| Median per test | 64.41 s |
| Wall-clock duration | 54.2 min (3255 s) |
| Sum of per-test times | 5675.1 s (94.6 min) |
| Parallelism (JUnit) | 1 feature class at a time, up to 3 tests in parallel (`junit-platform.properties`) |

> **Note:** Per-test times can spike on Chrome/session timeouts, not only slow flows.

## Top 10 slowest tests

| Rank | Time (s) | Status | Class | Method |
|------|----------|--------|-------|--------|
| 1 | 555.45 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[2]` |
| 2 | 350.43 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[1]` |
| 3 | 258.47 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` |
| 4 | 218.69 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldRenderAllRequiredCardBrands` |
| 5 | 162.09 | PASS | `CartCheckoutFeatureTest` | `cartClearsAfterCheckoutWhenLeavingThankYouPage` |
| 6 | 160.15 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[3]` |
| 7 | 158.35 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[4]` |
| 8 | 158.26 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[1]` |
| 9 | 157.41 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[2]` |
| 10 | 140.41 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[10]` |

## Average time by test class

| Class | Tests | Avg (s) | Total suite (s) |
|-------|-------|---------|-----------------|
| `PaymentsCardBrandsFeatureTest` | 22 | 147.44 | 3243.8 |
| `OrdersCheckoutFeatureTest` | 4 | 124.42 | 137.1 |
| `CartCheckoutFeatureTest` | 18 | 96.01 | 162.2 |
| `CatalogFeatureTest` | 6 | 23.95 | 64.4 |
| `LoginFeatureTest` | 8 | 5.13 | 6.9 |
| `AdminManagementFeatureTest` | 2 | 3.91 | 7.8 |
| `ProductDetailsFeatureTest` | 4 | 2.80 | 3.1 |
| `AdminLoginSmokeTest` | 1 | 1.05 | 1.2 |
| `JavaModernFeaturesTest` | 4 | 0.15 | 0.5 |

## Tests with errors or failures

| Status | Class | Method | Time (s) | Cause (excerpt) |
|--------|-------|--------|----------|-----------------|
| ERROR | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` | 258.47 | Could not start a new session. Response code 500. Message: session not created from chrome not reachable Host info: host: 'PC-GAMER-REINAL', ip: '172.29.0.1' Build info: version: '… |
| ERROR | `PaymentsCardBrandsFeatureTest` | `shouldRenderAllRequiredCardBrands` | 218.69 | Could not start a new session. Response code 500. Message: session not created from disconnected: unable to connect to renderer Host info: host: 'PC-GAMER-REINAL', ip: '172.29.0.1'… |
| ERROR | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[1]` | 350.43 | Could not start a new session. Possible causes are invalid address of the remote server or browser start-up failure. HTTP connect timed out Host info: host: 'PC-GAMER-REINAL', ip: … |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[2]` | 555.45 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[3]` | 112.88 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[4]` | 113.62 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[5]` | 114.59 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[6]` | 113.48 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[7]` | 113.36 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[8]` | 113.33 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[9]` | 113.23 | expected: <true> but was: <false> |
| FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[10]` | 140.41 | expected: <true> but was: <false> |
| ERROR | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[2]` | 9.91 | Error communicating with the remote browser. It may have died. Build info: version: '4.44.0', revision: 'da2039b' System info: os.name: 'Windows 10', os.arch: 'amd64', os.version: … |
| ERROR | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[3]` | 15.09 | invalid session id: session deleted as the browser has closed the connection from disconnected: Unable to receive message from renderer (Session info: chrome=148.0.7778.168) Build … |

See [`logs/headless-run-20260521-180707.log`](logs/headless-run-20260521-180707.log) for full stack traces and Surefire output.

## Duration by test class (Surefire suite time)

| Class | Suite (s) | Tests | Pass | Fail | Error |
|-------|-----------|-------|------|------|-------|
| `PaymentsCardBrandsFeatureTest` | 3243.8 | 22 | 8 | 9 | 5 |
| `CartCheckoutFeatureTest` | 162.2 | 18 | 18 | 0 | 0 |
| `OrdersCheckoutFeatureTest` | 137.1 | 4 | 4 | 0 | 0 |
| `CatalogFeatureTest` | 64.4 | 6 | 6 | 0 | 0 |
| `AdminManagementFeatureTest` | 7.8 | 2 | 2 | 0 | 0 |
| `LoginFeatureTest` | 6.9 | 8 | 8 | 0 | 0 |
| `ProductDetailsFeatureTest` | 3.1 | 4 | 4 | 0 | 0 |
| `AdminLoginSmokeTest` | 1.2 | 1 | 1 | 0 | 0 |
| `JavaModernFeaturesTest` | 0.5 | 4 | 4 | 0 | 0 |

## All tests sorted by duration

| Time (s) | Status | Class | Method |
|----------|--------|-------|--------|
| 555.45 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[2]` |
| 350.43 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[1]` |
| 258.47 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldShowBrandsStripAfterTypingCardNumber` |
| 218.69 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldRenderAllRequiredCardBrands` |
| 162.09 | PASS | `CartCheckoutFeatureTest` | `cartClearsAfterCheckoutWhenLeavingThankYouPage` |
| 160.15 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[3]` |
| 158.35 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[4]` |
| 158.26 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[1]` |
| 157.41 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod)[2]` |
| 140.41 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[10]` |
| 137.06 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowPaymentErrorWhenPaymentApiReturnsBadRequest` |
| 136.54 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowNotFoundErrorWhenPaymentApiReturnsNotFound` |
| 133.01 | PASS | `CartCheckoutFeatureTest` | `authenticatedUserIsRedirectedToPaymentFromCartCheckout` |
| 132.96 | PASS | `CartCheckoutFeatureTest` | `addingThreeItemsAndRemovingAllEndsWithEmptyCart` |
| 116.09 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[1]` |
| 114.59 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[5]` |
| 113.62 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[4]` |
| 113.48 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[6]` |
| 113.45 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[9]` |
| 113.36 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[7]` |
| 113.33 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[8]` |
| 113.23 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[9]` |
| 112.88 | FAIL | `PaymentsCardBrandsFeatureTest` | `shouldCaptureScreenshotForEachCardBrand(CardBrand)[3]` |
| 112.26 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[8]` |
| 112.06 | PASS | `OrdersCheckoutFeatureTest` | `shouldStayOnCartWhenOrderCreationFails` |
| 112.04 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[4]` |
| 112.02 | PASS | `OrdersCheckoutFeatureTest` | `shouldShowEmptyCartErrorWhenOrderApiReturnsBadRequest` |
| 111.97 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[7]` |
| 111.69 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[5]` |
| 111.65 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[6]` |
| 111.60 | PASS | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[10]` |
| 111.08 | PASS | `CartCheckoutFeatureTest` | `paidShippingAppearsWhenShippingIsGreaterThanZero` |
| 94.98 | PASS | `CartCheckoutFeatureTest` | `removingSingleItemShowsEmptyCart` |
| 73.07 | PASS | `CartCheckoutFeatureTest` | `cartBadgeDecrementsAfterEachItemRemoval` |
| 64.41 | PASS | `CatalogFeatureTest` | `shouldPreserveSearchFilterAfterNavigatingToDetailsAndBack` |
| 62.32 | PASS | `CartCheckoutFeatureTest` | `summaryShowsDistinctItemsAndSubtotalQuantity` |
| 51.38 | PASS | `CartCheckoutFeatureTest` | `largeQuantityUpdatesSummaryAndBadge` |
| 51.20 | PASS | `CartCheckoutFeatureTest` | `negativeQuantityKeepsPreviousValue` |
| 51.07 | PASS | `CartCheckoutFeatureTest` | `validQuantityUpdatesInputTotalAndBadge` |
| 51.07 | PASS | `CartCheckoutFeatureTest` | `freeShippingAppearsWhenShippingTotalIsZero` |
| 49.49 | PASS | `CartCheckoutFeatureTest` | `decimalQuantityIsNormalizedToInteger` |
| 49.34 | PASS | `CartCheckoutFeatureTest` | `zeroQuantityKeepsPreviousValue` |
| 44.05 | PASS | `CatalogFeatureTest` | `shouldSearchByTextAndUpdateCount` |
| 23.63 | PASS | `CatalogFeatureTest` | `shouldFilterProductsByCategory` |
| 20.99 | PASS | `CartCheckoutFeatureTest` | `emptyCartShowsEmptyStateAndCheckoutUnavailable` |
| 15.09 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[3]` |
| 9.91 | ERROR | `PaymentsCardBrandsFeatureTest` | `shouldActivateEachCardBrand(CardBrand)[2]` |
| 6.84 | PASS | `LoginFeatureTest` | `credentialsShouldCapAtThirtyCharacters` |
| 5.74 | PASS | `LoginFeatureTest` | `sessionShouldPersistAfterReload` |
| 5.43 | PASS | `LoginFeatureTest` | `successfulLoginRedirectsToAccountArea` |
| 5.16 | PASS | `LoginFeatureTest` | `loginWithNextRedirectShouldGoToCart` |
| 4.75 | PASS | `LoginFeatureTest` | `blankEmailShouldShowRequiredFieldsValidation` |
| 4.66 | PASS | `AdminManagementFeatureTest` | `adminShouldDeleteCreatedProduct` |
| 4.64 | PASS | `LoginFeatureTest` | `invalidCredentialsShowErrorAlert` |
| 4.57 | PASS | `CatalogFeatureTest` | `shouldShowEmptyStateWhenSearchHasNoResults` |
| 4.31 | PASS | `LoginFeatureTest` | `emptyPasswordShowsValidationAlert` |
| 4.20 | PASS | `LoginFeatureTest` | `emptyFieldsShowValidationAlert` |
| 3.55 | PASS | `CatalogFeatureTest` | `shouldListProductsWhenPageLoads` |
| 3.52 | PASS | `CatalogFeatureTest` | `shouldNavigateToProductDetailsWhenClickingImage` |
| 3.16 | PASS | `AdminManagementFeatureTest` | `adminShouldDeleteCreatedUser` |
| 3.14 | PASS | `ProductDetailsFeatureTest` | `shouldAddProductToCartAndUpdateBadge` |
| 3.02 | PASS | `ProductDetailsFeatureTest` | `shouldReturnToCatalogFromProductDetails` |
| 2.70 | PASS | `ProductDetailsFeatureTest` | `shouldDisplayMainProductData` |
| 2.35 | PASS | `ProductDetailsFeatureTest` | `shouldHandleInvalidProductId` |
| 1.05 | PASS | `AdminLoginSmokeTest` | `adminAndSupportLoginAvailable` |
| 0.50 | PASS | `JavaModernFeaturesTest` | `recordHoldsGeneratedUserData` |
| 0.07 | PASS | `JavaModernFeaturesTest` | `formattedBuildsTestIdSelector` |
| 0.04 | PASS | `JavaModernFeaturesTest` | `recordAndSwitchExpressionResolveBrowserAliases` |
| 0.00 | PASS | `JavaModernFeaturesTest` | `textBlockBuildsLoginJsonPayload` |