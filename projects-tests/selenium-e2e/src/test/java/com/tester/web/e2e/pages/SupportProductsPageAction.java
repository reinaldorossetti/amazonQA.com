package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;

public class SupportProductsPageAction extends SupportProductsPageElements {

  private final NavBarComponent nav;

  public SupportProductsPageAction(WebDriver driver) {
    super(driver);
    this.nav = new NavBarComponent(driver);
  }

  public void givenSupportOnProductsPage() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/");
    nav.whenOpenAccountFromGreeting();
    WebElement supportMenu = wait.until(ExpectedConditions.elementToBeClickable(ACCOUNT_MENU));
    clickElementWithFocus(supportMenu);
    wait.until(ExpectedConditions.visibilityOfElementLocated(WRAPPER));
  }

  public void whenSearch(String term) {
    WebElement search = wait.until(ExpectedConditions.visibilityOfElementLocated(SEARCH));
    fill(search, term);
    new WebDriverWait(driver, Duration.ofSeconds(2)).until(webDriver -> true);
  }

  public void whenOpenNewProductModal() {
    clickElementWithFocus(wait.until(ExpectedConditions.elementToBeClickable(NEW_BUTTON)));
  }

  public void whenSubmitNewProductWithoutName() {
    WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(DIALOG));
    WebElement priceInput = dialog.findElements(By.cssSelector("input")).get(1);
    fill(priceInput, "99.99");
    clickElementWithFocus(
        dialog.findElement(By.xpath(".//button[contains(normalize-space(.), 'Cadastrar Produto')]")));
  }

  public void whenOpenEditProduct(int productId) {
    clickElementWithFocus(wait.until(ExpectedConditions.elementToBeClickable(editButton(productId))));
  }

  public void whenDeleteProduct(int productId) {
    clickElementWithFocus(wait.until(ExpectedConditions.elementToBeClickable(deleteButton(productId))));
    acceptAlertIfPresent();
  }

  public void whenCloseDialog() {
    clickElementWithFocus(wait.until(ExpectedConditions.elementToBeClickable(DIALOG_CLOSE)));
  }

  public void thenValidatedProductManagementScreenVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(TITLE)).getText().contains("Gestão de Produtos"));
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(NEW_BUTTON)).isDisplayed());
    attachScreenshot("thenValidatedProductManagementScreenVisible");
  }

  public void thenValidatedProductsTableVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(TABLE)).isDisplayed());
    assertTrue(!driver.findElements(By.cssSelector("#support-products-table tbody tr")).isEmpty());
    attachScreenshot("thenValidatedProductsTableVisible");
  }

  public void thenValidatedProductListed(String name) {
    assertTextsVisible(name);
    attachScreenshot("thenValidatedProductListed");
  }

  public void thenValidatedProductNotListed(String name) {
    wait.until(webDriver -> !webDriver.getPageSource().contains(name));
    assertFalse(driver.getPageSource().contains(name));
    attachScreenshot("thenValidatedProductNotListed");
  }

  public void thenValidatedEmptySearchStateVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(EMPTY)).isDisplayed());
    assertTextsVisible("Nenhum produto encontrado");
    attachScreenshot("thenValidatedEmptySearchStateVisible");
  }

  public void thenValidatedCreateProductDialogVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(DIALOG)).isDisplayed());
    assertTextsVisible("Cadastrar Produto");
    attachScreenshot("thenValidatedCreateProductDialogVisible");
  }

  public void thenValidatedRequiredNameValidationVisible() {
    assertTextsVisible("obrigatório");
    attachScreenshot("thenValidatedRequiredNameValidationVisible");
  }

  public void thenValidatedEditDialogWithPrefilledName(String name) {
    assertTextsVisible("Editar Produto");
    WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(DIALOG));
    WebElement nameInput = dialog.findElement(By.cssSelector("input"));
    assertEquals(name, nameInput.getAttribute("value"));
    attachScreenshot("thenValidatedEditDialogWithPrefilledName");
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
