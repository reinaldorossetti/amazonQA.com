---
name: selenium-e2e-tests
description: Guides creation and maintenance of Java Selenium WebDriver E2E tests in this project. Use when adding, refactoring, debugging, or reviewing tests under projects-tests/selenium-e2e, especially tests that should follow the CartCheckoutFeatureTest Page Object and business-flow pattern.
---

# Selenium E2E Tests

## When To Use

Use this skill for Selenium UI E2E work in `projects-tests/selenium-e2e`, including new features, refactors, flaky test fixes, selector updates, and debugging failures from Maven/JUnit runs.

## Project Stack

- Java Selenium WebDriver with JUnit 5.
- Page Object Model split into `tests`, `pages`, `support`, and `config`.
- All tests extend `AbstractUiTest`, which opens and closes the WebDriver and attaches screenshots to Allure.
- Browser configuration lives in `WebDriverFactory` and `TestEnvironment`.
- Run from `projects-tests/selenium-e2e` with `.\mvnw.cmd test` on Windows.

## Required Test Structure

Follow the pattern from `CartCheckoutFeatureTest.java`:

- Test classes live in `src/test/java/com/tester/web/e2e/tests`.
- Page actions live in `src/test/java/com/tester/web/e2e/pages/*PageAction.java`.
- Selectors live in `src/test/java/com/tester/web/e2e/pages/*PageElements.java`.
- Test data/enums live in `src/test/java/com/tester/web/e2e/support`.
- Tests should contain business flow only: `given...`, `when...`, `then...`, and assertion calls.
- Do not put Selenium clicks, findElement, raw locators, waits, JavaScript, scrolling, or form filling directly in test methods.

## Test Class Pattern

Use JUnit and Allure annotations consistently:

```java
@Epic("Web UI")
@Feature("Cart and Checkout")
class CartCheckoutFeatureTest extends AbstractUiTest {

  private CartCheckoutPageAction cartCheckout;

  @BeforeEach
  void setupPageAction() {
    cartCheckout = new CartCheckoutPageAction(driver);
    cartCheckout.givenLoggedInUser(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, "Olá, Reinaldo");
  }

  @ParameterizedTest(name = "{displayName}: {0}")
  @EnumSource(PaymentMethod.class)
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 authenticated user should complete checkout with payment method")
  void authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod paymentMethod) {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(paymentMethod);
    cartCheckout.thenValidatedSuccessfulCheckoutSummary(paymentMethod, successfulCheckout);
  }
}
```

For permutations, use `@ParameterizedTest` with an enum in `support`, like `PaymentMethod`.

## Test case IDs (`TC-xxx`)

Every `@Test` and `@ParameterizedTest` must expose a **Test Case** id in `@DisplayName`, starting at **`TC-001`** in each `*FeatureTest` class and incrementing by one per method (declaration order in the class).

- **Format:** `TC-001`, `TC-002`, … `TC-099`, `TC-100` (always three digits, zero-padded).
- **Prefix in `@DisplayName`:** put the id first, then a short English description of the scenario.
- **Scope:** numbering **restarts at `TC-001` per class** (e.g. `LoginFeatureTest` and `CartCheckoutFeatureTest` each have their own `TC-001`).
- **Parameterized tests:** one TC id for the whole parameterized method (all enum values share the same case id).
- **Do not** use legacy prefixes alone (`TS01`, `AUTH-01`, `ORD-NEG-01`) as the primary name — fold that traceability into the description after `TC-xxx` if still needed for ATDD docs.

```java
@DisplayName("TC-001 authenticated user should complete checkout with payment method")
@ParameterizedTest(name = "{displayName}: {0}")
void authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod paymentMethod) { ... }

@Test
@DisplayName("TC-002 authenticated user should be redirected to payment from cart checkout")
void authenticatedUserIsRedirectedToPaymentFromCartCheckout() { ... }
```

## Test Method Formatting

Keep test methods compact. Do **not** insert blank lines between consecutive flow steps inside a test method.

- No blank lines between `given...`, `when...`, `thenValidated...`, or `validated...` calls in the same method.
- Follow `CartCheckoutFeatureTest.java`: one statement per line, steps stacked without spacing.
- One blank line between test methods is fine.
- Inside `@BeforeEach`, keep setup statements consecutive without blank lines between them.
- Use a blank line only when separating unrelated blocks in a long test (for example, API setup before UI flow), not between each PageAction call.

Good:

```java
void supportShouldOpenCreateProductModal() {
  supportProducts.whenOpenNewProductModal();
  supportProducts.thenValidatedCreateProductDialogVisible();
}
```

Avoid:

```java
void supportShouldOpenCreateProductModal() {

  supportProducts.whenOpenNewProductModal();

  supportProducts.thenValidatedCreateProductDialogVisible();

}
```

## Page Action Rules

Put all browser behavior in `PageAction` classes:

- Navigation: `givenUserOnCatalog`, `givenUserOnEmptyCart`.
- Setup flows: `givenCartWithOneItem`, `givenCartWithThreeItems`.
- User actions: `whenUpdateFirstItemQuantity`, `whenRemoveFirstCartItem`.
- High-level validations (public API for tests): `thenValidatedCartEmptyStateVisible`, `thenValidatedSuccessfulCheckoutSummary`, `validatedLoginInPage`.
- Internal checks in `BasePage` / page actions: `ensureTextsVisible`, `ensureUrlContains` (not called from `*FeatureTest`).
- Private low-level helpers: `clickDeleteFirstItem`, `selectPaymentMethod`, `waitUntilToastIsGone`.

### Validation naming in `*FeatureTest` (mandatory)

In `src/test/java/com/tester/web/e2e/tests/*FeatureTest.java`:

- **Do not** call PageAction methods whose names start with `assert` (e.g. ~~`cartCheckout.assertUrlContains`~~).
- **Do** delegate checks to PageActions using BDD-style names:
  - `thenValidated…` — most validations (`thenValidatedCartBadgeEquals`, `thenValidatedToastErrorMessage`).
  - `validated…` — login/session checks (`validatedLoginInPage`, `validatedErrorAlertVisible`).
  - `shouldValidate…` / `thenTheSystemShouldShowAMessage` — acceptable when the intent is clearer (wrap in PageAction, not JUnit `assert*` in the test body).
- **Do not** use `org.junit.jupiter.api.Assertions.*` (or `assertTrue` / `assertEquals`) directly in feature test classes; keep assertions inside PageActions.

Good:

```java
loginPage.validatedLoginInPage("Reinaldo");
cartCheckout.thenValidatedCartBadgeEquals("3");
register.thenValidatedToastErrorMessage(RegisterValidation.ERROR_EMAIL_DUPLICATE, RegisterValidation.ERROR_EMAIL_DUPLICATE_EN);
```

Avoid:

```java
cartCheckout.assertUrlContains("/cart");
Assertions.assertTrue(driver.getCurrentUrl().contains("/cart"));
```

Use explicit waits from `BasePage.wait` or short local `WebDriverWait`s. Prefer `BasePage` helpers over raw Selenium in page actions.

### By-first (mandatory)

- **Selectors** live only in `*PageElements` as `protected static final By` or `protected static By foo(...)` for dynamic ids/text.
- **Page actions** call `By` constants from the elements class plus `BasePage` helpers — never inline `By.xpath(...)`, `@FindBy`, `PageFactory`, or `WebElement` parameters/fields in actions.
- **`click(By)`** is the public click API; it waits for clickability, scroll/focus, native click, and JS fallback on `ElementClickInterceptedException`.
- **Shared nav:** `NavBarElements` (selectors) + `NavBarComponent` (actions).

### BasePage helpers (use these in PageActions)

| Helper | Use when |
|--------|----------|
| `click(By)` | Any button/link |
| `clickFirst(By)` | First match in a list (e.g. first delete, first add-to-cart) |
| `fill(By, String)` | Text inputs |
| `fillAndPressEnter(By, String)` | Search fields |
| `inputValue(By)` / `firstInputValue(By)` | Read input value |
| `textOf(By)` | Read visible text |
| `moveFocusToElement(By)` | Before assertions on partially hidden elements |
| `setInputValueWithJs(By, String)` | Controlled inputs (payments, quantity) |
| `waitUntilToastIsGone()` | Before header/cart/checkout clicks (see below) |
| `waitUntilToastCycleCompletes()` | After actions that show a toast (add to cart) |

`WebElement` is allowed only inside `BasePage` private implementation (e.g. `clickOnElement`).

## Page Elements Rules

Keep selectors in `PageElements` classes:

- Prefer stable `id` or `data-element-id` selectors from the React app.
- Use accessibility/text XPath only when no stable id exists.
- Keep selectors `protected static final By` (or `protected static By name(...)` for dynamic ids/text).
- Shared nav selectors live in `NavBarElements`; nav behavior in `NavBarComponent`.
- Do not duplicate selectors inside tests or PageActions.

Example:

```java
protected static final By NAV_CART_BUTTON = By.id("nav-cart-btn");
protected static final By CART_ORDER_TOTAL = By.cssSelector("[data-element-id='cart-order-total']");
```

Dynamic text (category, payment label, product name) — factory on the elements class:

```java
protected static By textContaining(String text) {
  return By.xpath("//*[contains(normalize-space(.), '" + text + "')]");
}
```

## Toast overlays (react-toastify)

The app uses `ToastContainer` at **top-right** (`autoClose={5000}`), same region as `#nav-cart-btn` and checkout actions in the header. Toasts can cause `ElementClickInterceptedException` if clicked too early.

### Waiting for toast to disappear

- Locator: `TOAST_BODY` = `.Toastify__toast-body` in `BasePage`.
- **`waitUntilToastIsGone()`** — waits up to **7 seconds** (`TOAST_DISMISS_TIMEOUT`) for the toast body to become invisible (covers `autoClose` 5s + exit animation).
  - If a toast is already visible: wait until invisible.
  - If none visible: optionally wait for appear-then-dismiss within 7s; if none appears, continue.
- **`waitUntilToastIsGone()`** — if a toast is visible now, delegates to `waitUntilToastIsGone()`; use **after** add-to-cart / delete item.

### When to call

| Moment | Helper |
|--------|--------|
| After `add to cart`, remove item | `waitUntilToastIsGone()` |
| Before `#nav-cart-btn`, proceed to checkout, payment, logout | `waitUntilToastIsGone()` |
| `NavBarComponent.whenOpenCart()` / `whenLogout()` | already calls `waitUntilToastIsGone()` |

Prefer `waitUntilToastIsGone()` in `openCartFromHeader()` after catalog add-to-cart, not only `waitUntilToastIsGone()`.

### Assertions on toast-only messages

Some errors (e.g. duplicate email on register) appear only in the toast, not in `body`. Do not use `assertTextsVisible` on the page body alone — assert via toast text (`TOAST_BODY` / `textOf`) or a dedicated `thenValidatedToastMessage` in the page action.

## Assertions

- Keep assertions readable and business-oriented in tests.
- If an assertion requires waiting or UI lookup, wrap it in the relevant `PageAction`.
- Do not change existing test assertions when the task is specifically to fix element, selector, timing, focus, or scroll errors.
- If a failure is caused by product seed/data mismatch, fix the deterministic setup or test data source, not the assertion text.

## Debugging Workflow

1. Run the smallest relevant test first:
   `.\mvnw.cmd test -Dtest=CartCheckoutFeatureTest#methodName`
2. Identify whether the failure is:
   - Element/timing/focus/overlay/toast: fix `PageAction`, `PageElements`, or `BasePage` (`waitUntilToastIsGone`, `click(By)`).
   - Wrong expected behavior/data: inspect app behavior and seed/mock data before changing tests.
   - Assertion mismatch: report it if the user asked not to change assertions.
3. After fixes, run the affected class:
   `.\mvnw.cmd test -Dtest=CartCheckoutFeatureTest`
4. For final validation, run:
   `.\mvnw.cmd test`

## Parallel execution

Configuration: `projects-tests/selenium-e2e/src/test/resources/junit-platform.properties`.

| Property | Value | Meaning |
|----------|-------|---------|
| `parallel.enabled` | `true` | JUnit 5 parallelism on |
| `config.strategy` | `fixed` | Fixed thread pool (not `dynamic`) |
| `fixed.parallelism` | `3` | Up to **3 test methods** in parallel within the active feature class |
| `mode.default` | `concurrent` | Methods **within the same class** can run in parallel |
| `mode.classes.default` | `same_thread` | **One feature class** (`*FeatureTest`) at a time |

### Strategy in practice

- **One `WebDriver` per `@Test`** in `AbstractUiTest` (`@BeforeEach` open, `@AfterEach` quit).
- **One feature at a time**, up to **3 browsers** for different `@Test` methods in that class (e.g. three `CartCheckoutFeatureTest` methods at once).
- **Do not** add `@Execution(SAME_THREAD)` on `AbstractUiTest` — forces the entire suite serial.
- Classes using the **same seeded user** in parallel may conflict on cart/session; prefer unique users per test or `@Execution(SAME_THREAD)` on that class only.
- **Override:** `-Djunit.jupiter.execution.parallel.config.fixed.parallelism=1` (one browser per feature) or `parallel.enabled=false`.
- **Disable:** `.\mvnw.cmd test "-Djunit.jupiter.execution.parallel.enabled=false"`

Avoid `dynamic.factor` on low-core machines (can collapse to 1 thread). Prefer **fixed** parallelism for predictable Selenium runs.

## Do Not

- Do not place Selenium `click`,`findElement`, `sendKeys`, raw `By`, waits, or JavaScript in test classes.
- Do not use mocked authentication for checkout tests that require real login unless the user explicitly asks.
- Do not add dead/commented code.
- Do not introduce `Thread.sleep`; use explicit waits.
- Do not make tests depend on API ordering. Use deterministic product lookup/setup.
- Do not change config of the project.
- Do not change the test assertions, for the test to pass, it must always follow the business rule.
- Do not make complex tests, keep your tests simple and functions short. Always prefer to use the functions from BasePage.java.
- Do not use cucumber in the tests.
- Do not use assert name on the test folder (\test) classes XXXFeatureTest.java, prefer "then" ou "shouldValidate", "thenTheSystemShouldShowAMessage", "validatedLoginInPage"
- Do not add new tests without a sequential `@DisplayName("TC-xxx …")` in the same `*FeatureTest` class.