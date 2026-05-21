package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class SupportProductsPageElements extends BasePage {

  protected static final By WRAPPER = By.id("support-products-wrapper");
  protected static final By TITLE = By.id("support-products-title");
  protected static final By NEW_BUTTON = By.id("support-products-new-btn");
  protected static final By SEARCH = By.id("support-products-search");
  protected static final By TABLE = By.id("support-products-table");
  protected static final By EMPTY = By.id("support-products-empty");
  protected static final By ACCOUNT_MENU = By.id("account-menu-minha-conta-suporte-produtos");
  protected static final By DIALOG = By.id("support-product-dialog");
  protected static final By DIALOG_CLOSE = By.id("support-product-dialog-close");
  protected static final By DIALOG_NAME_INPUT = By.id("support-product-name");
  protected static final By DIALOG_PRICE_INPUT = By.id("support-product-price");
  protected static final By DIALOG_SUBMIT_BUTTON = By.id("support-product-save-btn");
  protected static final By TABLE_BODY_ROWS =
      By.cssSelector("#support-products-table tbody tr");

  protected SupportProductsPageElements(WebDriver driver) {
    super(driver);
  }

  protected static By editButton(int productId) {
    return By.id("support-products-edit-" + productId);
  }

  protected static By deleteButton(int productId) {
    return By.id("support-products-delete-" + productId);
  }

  protected static By productRow(int productId) {
    return By.id("support-products-row-" + productId);
  }
}
