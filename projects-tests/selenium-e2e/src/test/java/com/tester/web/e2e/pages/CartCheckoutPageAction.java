package com.tester.web.e2e.pages;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;
import com.tester.web.e2e.support.PaymentMethod;

/**
 * Cart + checkout user actions and assertions for Selenium tests.
 */
public class CartCheckoutPageAction extends CartCheckoutPageElements {

  private static final String DEFAULT_CART_PRODUCT = "Relógio Elegante";
  private static final String SECOND_CART_PRODUCT = "Câmera Vintage";
  private static final String THIRD_CART_PRODUCT = "Fones de Ouvido";

  public CartCheckoutPageAction(WebDriver driver) {
    super(driver);
  }

  public void givenUserOnCatalog() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/");
    wait.until(ExpectedConditions.urlToBe(TestEnvironment.baseUrl() + "/"));
  }

  public void givenUserOnEmptyCart() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/cart");
    wait.until(ExpectedConditions.urlContains("/cart"));
  }

  public void givenLoggedInUser(String email, String password, String expectedGreeting) {
    LoginPageAction loginPage = new LoginPageAction(driver);
    loginPage.open();
    loginPage.loginAction(email, password, true);
    loginPage.validatedLoginInPage(expectedGreeting);
  }

  public void givenCartWithThreeItems() {
    givenUserOnCatalog();
    addProductToCartByName(DEFAULT_CART_PRODUCT);
    addProductToCartByName(SECOND_CART_PRODUCT);
    addProductToCartByName(THIRD_CART_PRODUCT);
    openCartFromHeader();
  }

  public void givenCartWithPaidShippingItem(String searchTerm) {
    givenUserOnCatalog();
    addProductToCartByName(searchTerm);
    openCartFromHeader();
  }

  public void givenCartWithOneItem() {
    givenUserOnCatalog();
    addProductToCartByName(DEFAULT_CART_PRODUCT);
    openCartFromHeader();
  }

  public void whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod paymentMethod) {
    ensureUrlContains("/cart");
    proceedToCheckout();
    selectPaymentMethod(paymentMethod);
    clickSubmitPayment(paymentMethod);
  }

  public void thenValidatedSuccessfulCheckoutSummary(PaymentMethod paymentMethod, String... texts) {
    thenValidatedSuccessfulCheckoutSummary(texts);
    assertEquals(paymentMethod.confirmationText(), textOf(THANK_YOU_PAYMENT_METHOD));
  }

  public void whenAuthenticatedUserProceedsToCheckout() {
    ensureUrlContains("/cart");
    proceedToCheckout();
  }

  public void whenGuestTriesToCheckoutFromCart() {
    clickLoginToCheckout();
  }

  public void whenUpdateFirstItemQuantity(String value) {
    setFirstItemQuantity(value);
  }

  public void whenRemoveFirstCartItem() {
    clickDeleteFirstItem();
  }

  public void whenRemoveAllCartItems() {
    while (deleteButtonsCount() > 0) {
      clickDeleteFirstItem();
    }
  }

  public void whenLeavingThankYouBackToCatalogAndOpeningCart() {
    clickBackToCatalog();
    openCartFromHeader();
  }

  private void addFirstProductToCart() {
    clickFirst(ADD_TO_CART_BUTTONS);
    waitUntilToastIsGone();
  }

  private void addProductToCartByName(String productName) {
    searchBy(productName);
    addFirstProductToCart();
  }

  private void searchBy(String searchTerm) {
    fillAndPressEnter(NAV_SEARCH_INPUT, searchTerm);
    wait.until(ExpectedConditions.visibilityOfElementLocated(textContaining(searchTerm)));
  }

  private void openCartFromHeader() {
    waitUntilToastIsGone();
    click(NAV_CART_BUTTON);
  }

  protected void proceedToCheckout() {
    waitUntilToastIsGone();
    click(PROCEED_TO_CHECKOUT_BUTTON);
  }

  protected void selectPaymentMethod(PaymentMethod paymentMethod) {
    waitUntilToastIsGone();
    click(paymentMethodOption(paymentMethod.displayName()));
  }

  private void clickLoginToCheckout() {
    waitUntilToastIsGone();
    click(LOGIN_TO_CHECKOUT_BUTTON);
  }

  protected void clickSubmitPayment(PaymentMethod paymentMethod) {
    waitUntilToastIsGone();
    click(submitPaymentButton(paymentMethod.submitButtonText()));
  }

  private void clickBackToCatalog() {
    click(BACK_TO_CATALOG_BUTTON);
  }

  private void setFirstItemQuantity(String value) {
    setFirstInputValueWithJs(QUANTITY_INPUTS, value);
  }

  private void clickDeleteFirstItem() {
    clickFirst(DELETE_BUTTONS);
    waitUntilToastIsGone();
  }

  public int deleteButtonsCount() {
    return driver.findElements(DELETE_BUTTONS).size();
  }

  public String firstItemQuantityValue() {
    return firstInputValue(QUANTITY_INPUTS);
  }

  public String cartBadgeText() {
    return textOf(NAV_CART_BADGE);
  }

  public String orderTotalText() {
    return textOf(CART_ORDER_TOTAL);
  }

  public String shippingText() {
    return textOf(CART_SHIPPING);
  }

  public String summaryDistinctItemsText() {
    return textOf(CART_SUMMARY_TOTAL_ITEMS);
  }

  public String summarySubtotalText() {
    return textOf(CART_SUMMARY_SUBTOTAL);
  }

  protected void ensureUrlContains(String expectedPath) {
    wait.until(ExpectedConditions.urlContains(expectedPath));
    assertTrue(driver.getCurrentUrl().contains(expectedPath));
  }

  public void thenValidatedUrlContains(String expectedPath) {
    ensureUrlContains(expectedPath);
  }

  public void thenValidatedUrlMatches(String expectedRegex) {
    wait.until(webDriver -> webDriver.getCurrentUrl().matches(expectedRegex));
    assertTrue(driver.getCurrentUrl().matches(expectedRegex));
  }

  public void thenValidatedCartEmptyStateVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_TITLE)).isDisplayed());
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_EMPTY_TITLE)).isDisplayed());
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_EMPTY_DESCRIPTION)).isDisplayed());
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_GO_TO_CATALOG_BUTTON)).isDisplayed());
  }

  private void ensureThankYouSummaryVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(THANK_YOU_SUMMARY_WRAPPER)).isDisplayed());
  }

  public void thenValidatedSuccessfulCheckoutSummary(String... texts) {
    LOGGER.info(() -> "Validating successful checkout texts count: " + texts.length);
    ensureUrlContains("/thank-you");
    ensureThankYouSummaryVisible();
    ensureTextsVisible(texts);
    attachScreenshot("validatedSucessoCheckout");
  }

  public void thenValidatedQuantityEquals(String expectedValue) {
    assertEquals(expectedValue, firstItemQuantityValue());
  }

  public void thenValidatedOrderTotalContains(String expectedText) {
    assertTrue(orderTotalText().contains(expectedText));
  }

  public void thenValidatedCartBadgeEquals(String expectedValue) {
    assertEquals(expectedValue, cartBadgeText());
  }

  public void thenValidatedDeleteButtonsCount(int expectedCount) {
    assertEquals(expectedCount, deleteButtonsCount());
  }

  public void thenValidatedDistinctItemsTextEquals(String expectedText) {
    assertEquals(expectedText, summaryDistinctItemsText());
  }

  public void thenValidatedSubtotalTextContains(String expectedText) {
    assertTrue(summarySubtotalText().contains(expectedText));
  }

  public void thenValidatedShippingTextContains(String expectedText) {
    assertTrue(shippingText().contains(expectedText));
  }

  public void thenValidatedShippingTextEquals(String expectedText) {
    assertEquals(expectedText, shippingText());
  }

  public void thenValidatedFreeShippingBannerVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(FREE_SHIPPING_BANNER)).isDisplayed());
  }

  public void thenValidatedFreeShippingBannerHidden() {
    assertFalse(isVisible(FREE_SHIPPING_BANNER, Duration.ZERO));
  }

  public void thenValidatedPageTextsVisible(String... texts) {
    ensureTextsVisible(texts);
  }
}
