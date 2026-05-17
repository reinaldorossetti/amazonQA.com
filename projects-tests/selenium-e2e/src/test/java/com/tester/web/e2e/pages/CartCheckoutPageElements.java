package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/**
 * Cart + checkout selectors aligned with the React app ids and data-element-id markers.
 */
public class CartCheckoutPageElements extends BasePage {

  protected static final By ADD_TO_CART_BUTTONS =
      By.xpath("//button[contains(normalize-space(.), 'Adicionar ao Carrinho') or contains(normalize-space(.), 'Add to Cart')]");
  protected static final By NAV_CART_BUTTON = By.id("nav-cart-btn");
  protected static final By NAV_CART_BADGE = By.id("nav-cart-count-badge");
  protected static final By NAV_SEARCH_INPUT = By.id("nav-search-input");

  protected static final By CART_TITLE = By.cssSelector("[data-element-id='cart-title']");
  protected static final By CART_EMPTY_TITLE = By.cssSelector("[data-element-id='cart-empty-title']");
  protected static final By CART_EMPTY_DESCRIPTION =
      By.cssSelector("[data-element-id='cart-empty-description']");
  protected static final By CART_GO_TO_CATALOG_BUTTON =
      By.cssSelector("[data-element-id='cart-go-to-catalog-btn']");
  protected static final By CART_ORDER_TOTAL = By.cssSelector("[data-element-id='cart-order-total']");
  protected static final By CART_SHIPPING = By.cssSelector("[data-element-id='cart-summary-shipping']");
  protected static final By CART_SUMMARY_TOTAL_ITEMS =
      By.cssSelector("[data-element-id='cart-summary-total-items']");
  protected static final By CART_SUMMARY_SUBTOTAL =
      By.cssSelector("[data-element-id='cart-summary-subtotal']");

  protected static final By QUANTITY_INPUTS =
      By.cssSelector("[data-element-id='cart-item-quantity-wrapper'] input[type='number']");
  protected static final By DELETE_BUTTONS =
      By.xpath("//*[@role='button' and (contains(normalize-space(.), 'Delete') or contains(normalize-space(.), 'Excluir') or @aria-label='delete')]");

  protected static final By PROCEED_TO_CHECKOUT_BUTTON =
      By.xpath("//button[contains(normalize-space(.), 'Fechar Pedido') or contains(normalize-space(.), 'Proceed to Checkout')]");
  protected static final By LOGIN_TO_CHECKOUT_BUTTON =
      By.xpath("//button[contains(normalize-space(.), 'Entrar para Finalizar')]");
  protected static final By THANK_YOU_PAYMENT_METHOD = By.id("thank-you-payment-method");
  protected static final By BACK_TO_CATALOG_BUTTON =
      By.xpath("//button[contains(normalize-space(.), 'Voltar ao Catálogo') or contains(normalize-space(.), 'Back to Catalog')]");
  protected static final By THANK_YOU_SUMMARY_WRAPPER = By.id("thank-you-summary-wrapper");

  protected static final By FREE_SHIPPING_BANNER =
      By.xpath("//*[contains(normalize-space(.), 'FREE Shipping')]");
  protected static final By TOAST_BODY = By.cssSelector(".Toastify__toast-body");

  public CartCheckoutPageElements(WebDriver driver) {
    super(driver);
  }
}
