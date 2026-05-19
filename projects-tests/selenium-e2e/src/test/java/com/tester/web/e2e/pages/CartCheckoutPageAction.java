package com.tester.web.e2e.pages;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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

  public void givenCartWithOneItem() {
    givenUserOnCatalog();
    addProductToCartByName(DEFAULT_CART_PRODUCT);
    openCartFromHeader();
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

  public void whenAuthenticatedUserCompletesCheckoutToThankYou() {
    whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod.CREDIT);
  }

  public void whenAuthenticatedUserCompletesCheckoutToThankYou(PaymentMethod paymentMethod) {
    assertUrlContains("/cart");
    proceedToCheckout();
    selectPaymentMethod(paymentMethod);
    clickSubmitPayment(paymentMethod);
  }

  public void whenAuthenticatedUserProceedsToCheckout() {
    assertUrlContains("/cart");
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
    List<WebElement> buttons = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(ADD_TO_CART_BUTTONS));
    clickElementWithFocus(buttons.get(0));
    waitUntilToastCycleCompletes();
  }

  private void addProductToCartByName(String productName) {
    searchBy(productName);
    addFirstProductToCart();
  }

  private void searchBy(String searchTerm) {
    WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(NAV_SEARCH_INPUT));
    input.click();
    input.clear();
    input.sendKeys(searchTerm);
    input.sendKeys(Keys.ENTER);
    wait.until(ExpectedConditions.visibilityOfElementLocated(
        By.xpath("//*[contains(normalize-space(.), '" + searchTerm + "')]")));
  }

  private void openCartFromHeader() {
    waitUntilToastIsGone();
    wait.until(ExpectedConditions.elementToBeClickable(NAV_CART_BUTTON)).click();
    wait.until(ExpectedConditions.urlContains("/cart"));
  }

  private void waitUntilToastCycleCompletes() {
    try {
      new WebDriverWait(driver, Duration.ofSeconds(2))
          .until(ExpectedConditions.visibilityOfElementLocated(TOAST_BODY));
    } catch (TimeoutException ignored) {
      LOGGER.fine("No toast appeared after cart action.");
    }
    waitUntilToastIsGone();
  }

  private void waitUntilToastIsGone() {
    new WebDriverWait(driver, Duration.ofSeconds(5))
        .until(ExpectedConditions.invisibilityOfElementLocated(TOAST_BODY));
  }

  private void proceedToCheckout() {
    wait.until(ExpectedConditions.elementToBeClickable(PROCEED_TO_CHECKOUT_BUTTON)).click();
  }

  private void selectPaymentMethod(PaymentMethod paymentMethod) {
    By paymentMethodOption = By.xpath(
        "//button[.//*[contains(normalize-space(.), '" + paymentMethod.displayName() + "')]]");
    waitUntilToastIsGone();
    WebElement paymentOption = wait.until(ExpectedConditions.visibilityOfElementLocated(paymentMethodOption));
    clickElementWithFocus(paymentOption);
  }

  private void clickLoginToCheckout() {
    wait.until(ExpectedConditions.elementToBeClickable(LOGIN_TO_CHECKOUT_BUTTON)).click();
  }

  private void clickSubmitPayment(PaymentMethod paymentMethod) {
    By submitPaymentButton = By.xpath(
        "//button[contains(normalize-space(.), '" + paymentMethod.submitButtonText() + "')]");
    WebElement paymentButton = wait.until(ExpectedConditions.visibilityOfElementLocated(submitPaymentButton));
    clickElementWithFocus(paymentButton);
  }

  private void clickBackToCatalog() {
    wait.until(ExpectedConditions.elementToBeClickable(BACK_TO_CATALOG_BUTTON)).click();
  }

  private void setFirstItemQuantity(String value) {
    WebElement input = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(QUANTITY_INPUTS)).get(0);
    moveFocusToElement(input);
    if (driver instanceof JavascriptExecutor javascriptExecutor) {
      javascriptExecutor.executeScript(
          "const input = arguments[0];"
              + "const value = arguments[1];"
              + "const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;"
              + "setter.call(input, value);"
              + "input.dispatchEvent(new Event('input', { bubbles: true }));",
          input,
          value);
    } else {
      input.click();
      input.clear();
      input.sendKeys(value);
    }
    input.sendKeys(Keys.TAB);
  }

  private void clickDeleteFirstItem() {
    WebElement deleteButton = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(DELETE_BUTTONS)).get(0);
    clickElementWithFocus(deleteButton);
    waitUntilToastCycleCompletes();
  }

  public int deleteButtonsCount() {
    return driver.findElements(DELETE_BUTTONS).size();
  }

  public String firstItemQuantityValue() {
    return wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(QUANTITY_INPUTS))
        .get(0)
        .getAttribute("value");
  }

  public String cartBadgeText() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(NAV_CART_BADGE)).getText().trim();
  }

  public String orderTotalText() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(CART_ORDER_TOTAL)).getText();
  }

  public String shippingText() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(CART_SHIPPING)).getText();
  }

  public String summaryDistinctItemsText() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(CART_SUMMARY_TOTAL_ITEMS)).getText();
  }

  public String summarySubtotalText() {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(CART_SUMMARY_SUBTOTAL)).getText();
  }

  public void assertUrlContains(String expectedPath) {
    wait.until(ExpectedConditions.urlContains(expectedPath));
    assertTrue(driver.getCurrentUrl().contains(expectedPath));
  }

  public void assertUrlMatches(String expectedRegex) {
    wait.until(webDriver -> webDriver.getCurrentUrl().matches(expectedRegex));
    assertTrue(driver.getCurrentUrl().matches(expectedRegex));
  }

  public void assertCartEmptyStateVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_TITLE)).isDisplayed());
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_EMPTY_TITLE)).isDisplayed());
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_EMPTY_DESCRIPTION)).isDisplayed());
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(CART_GO_TO_CATALOG_BUTTON)).isDisplayed());
  }

  public void assertThankYouSummaryVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(THANK_YOU_SUMMARY_WRAPPER)).isDisplayed());
  }

  public void thenValidatedSuccessfulCheckoutSummary(String... texts) {
    LOGGER.info(() -> "Validating successful checkout texts count: " + texts.length);
    assertUrlContains("/thank-you");
    assertThankYouSummaryVisible();
    assertTextsVisible(texts);
    attachScreenshot("validatedSucessoCheckout");
  }

  public void thenValidatedSuccessfulCheckoutSummary(PaymentMethod paymentMethod, String... texts) {
    thenValidatedSuccessfulCheckoutSummary(texts);
    assertEquals(
        paymentMethod.confirmationText(),
        wait.until(ExpectedConditions.visibilityOfElementLocated(THANK_YOU_PAYMENT_METHOD)).getText());
  }

  public void assertQuantityEquals(String expectedValue) {
    assertEquals(expectedValue, firstItemQuantityValue());
  }

  public void assertOrderTotalContains(String expectedText) {
    assertTrue(orderTotalText().contains(expectedText));
  }

  public void assertCartBadgeEquals(String expectedValue) {
    assertEquals(expectedValue, cartBadgeText());
  }

  public void assertDeleteButtonsCount(int expectedCount) {
    new WebDriverWait(driver, Duration.ofSeconds(10))
        .until(webDriver -> webDriver.findElements(DELETE_BUTTONS).size() == expectedCount);
    assertEquals(expectedCount, deleteButtonsCount());
  }

  public void assertDistinctItemsTextEquals(String expectedText) {
    assertEquals(expectedText, summaryDistinctItemsText());
  }

  public void assertSubtotalTextContains(String expectedText) {
    assertTrue(summarySubtotalText().contains(expectedText));
  }

  public void assertShippingTextContains(String expectedText) {
    assertTrue(shippingText().contains(expectedText));
  }

  public void assertShippingTextEquals(String expectedText) {
    assertEquals(expectedText, shippingText());
  }

  public void assertFreeShippingBannerVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(FREE_SHIPPING_BANNER)).isDisplayed());
  }

  public void assertFreeShippingBannerHidden() {
    assertFalse(isVisible(By.xpath("//*[contains(normalize-space(.), 'FREE Shipping')]")));
  }

  private boolean isVisible(By locator) {
    return !driver.findElements(locator).isEmpty() && driver.findElement(locator).isDisplayed();
  }

  public void assertPageTextsVisible(String... texts) {
    assertTextsVisible(texts);
  }
}
