package com.tester.web.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class AdminPageElements extends BasePage {

  protected static final By ADMIN_PRODUCTS_WRAPPER = By.id("admin-products-wrapper");
  protected static final By ADMIN_USERS_WRAPPER = By.id("admin-users-wrapper");
  protected static final By ACCOUNT_MENU_ADMIN_PRODUCTS = By.id("account-menu-minha-conta-admin-produtos");
  protected static final By ACCOUNT_MENU_ADMIN_USERS = By.id("account-menu-minha-conta-admin-usuarios");

  protected AdminPageElements(WebDriver driver) {
    super(driver);
  }

  protected static By deleteProductButton(int productId) {
    return By.id("admin-products-delete-" + productId);
  }

  protected static By deleteUserButton(int userId) {
    return By.id("admin-users-delete-" + userId);
  }
}
