package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertFalse;

import org.openqa.selenium.Alert;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.tester.web.e2e.config.TestEnvironment;

public class AdminPageAction extends AdminPageElements {

  private final NavBarComponent nav;

  public AdminPageAction(WebDriver driver) {
    super(driver);
    this.nav = new NavBarComponent(driver);
  }

  public void givenAdminOnHome() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/");
    wait.until(ExpectedConditions.visibilityOfElementLocated(NavBarElements.USER_GREETING));
  }

  public void whenOpenAdminProducts() {
    nav.whenOpenAccountFromGreeting();
    click(ACCOUNT_MENU_ADMIN_PRODUCTS);
    wait.until(ExpectedConditions.visibilityOfElementLocated(ADMIN_PRODUCTS_WRAPPER));
  }

  public void whenOpenAdminUsers() {
    nav.whenOpenAccountFromGreeting();
    click(ACCOUNT_MENU_ADMIN_USERS);
    wait.until(ExpectedConditions.visibilityOfElementLocated(ADMIN_USERS_WRAPPER));
  }

  public void whenDeleteProduct(int productId) {
    click(deleteProductButton(productId));
    acceptAlertIfPresent();
  }

  public void whenDeleteUser(int userId) {
    click(deleteUserButton(userId));
    acceptAlertIfPresent();
  }

  public void assertProductListed(String productName) {
    assertTextsVisible(productName);
  }

  public void assertProductNotListed(String productName) {
    wait.until(webDriver -> !webDriver.getPageSource().contains(productName));
    assertFalse(driver.getPageSource().contains(productName));
  }

  public void assertUserListed(String email) {
    assertTextsVisible(email);
  }

  public void assertUserNotListed(String email) {
    wait.until(webDriver -> !webDriver.getPageSource().contains(email));
    assertFalse(driver.getPageSource().contains(email));
  }

  public void assertDeleteUserToast() {
    assertTextsVisible("Usuário excluído com sucesso.");
  }

  private void acceptAlertIfPresent() {
    try {
      Alert alert = driver.switchTo().alert();
      alert.accept();
    } catch (Exception ignored) {
      LOGGER.fine("No browser alert to accept.");
    }
  }
}
