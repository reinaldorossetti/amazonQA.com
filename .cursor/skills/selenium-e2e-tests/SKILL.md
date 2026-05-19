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
  @DisplayName("TS01 authenticated user should complete checkout with payment method")
  void authenticatedUserCompletesCheckoutAndSeesThankYouSummary(PaymentMethod paymentMethod) {
    cartCheckout.givenCartWithOneItem();
    cartCheckout.whenAuthenticatedUserCompletesCheckoutToThankYou(paymentMethod);
    cartCheckout.thenValidatedSuccessfulCheckoutSummary(paymentMethod, successfulCheckout);
  }
}
```

For permutations, use `@ParameterizedTest` with an enum in `support`, like `PaymentMethod`.

## Page Action Rules

Put all browser behavior in `PageAction` classes:

- Navigation: `givenUserOnCatalog`, `givenUserOnEmptyCart`.
- Setup flows: `givenCartWithOneItem`, `givenCartWithThreeItems`.
- User actions: `whenUpdateFirstItemQuantity`, `whenRemoveFirstCartItem`.
- High-level assertions/validations: `assertCartEmptyStateVisible`, `thenValidatedSuccessfulCheckoutSummary`.
- Private low-level helpers: `clickDeleteFirstItem`, `selectPaymentMethod`, `waitUntilToastIsGone`.

Use explicit waits from `BasePage.wait` or short local `WebDriverWait`s. For elements hidden by headers/toasts, use existing global helpers such as `moveFocusToElement` and `clickElementWithFocus`.

## Page Elements Rules

Keep selectors in `PageElements` classes:

- Prefer stable `id` or `data-element-id` selectors from the React app.
- Use accessibility/text XPath only when no stable id exists.
- Keep selectors `protected static final By`.
- Do not duplicate selectors inside tests.

Example:

```java
protected static final By NAV_CART_BUTTON = By.id("nav-cart-btn");
protected static final By CART_ORDER_TOTAL = By.cssSelector("[data-element-id='cart-order-total']");
```

## Assertions

- Keep assertions readable and business-oriented in tests.
- If an assertion requires waiting or UI lookup, wrap it in the relevant `PageAction`.
- Do not change existing test assertions when the task is specifically to fix element, selector, timing, focus, or scroll errors.
- If a failure is caused by product seed/data mismatch, fix the deterministic setup or test data source, not the assertion text.

## Debugging Workflow

1. Run the smallest relevant test first:
   `.\mvnw.cmd test -Dtest=CartCheckoutFeatureTest#methodName`
2. Identify whether the failure is:
   - Element/timing/focus/overlay: fix `PageAction`, `PageElements`, or `BasePage`.
   - Wrong expected behavior/data: inspect app behavior and seed/mock data before changing tests.
   - Assertion mismatch: report it if the user asked not to change assertions.
3. After fixes, run the affected class:
   `.\mvnw.cmd test -Dtest=CartCheckoutFeatureTest`
4. For final validation, run:
   `.\mvnw.cmd test`

## Parallel Execution

The project uses `src/test/resources/junit-platform.properties` for JUnit parallelism. Keep Selenium concurrency conservative because each test opens a browser session. If asked for parallel execution, prefer fixed parallelism such as `3`.

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