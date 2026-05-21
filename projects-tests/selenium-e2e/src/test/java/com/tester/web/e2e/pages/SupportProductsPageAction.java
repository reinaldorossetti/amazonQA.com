package com.tester.web.e2e.pages;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
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
    click(ACCOUNT_MENU);
    wait.until(ExpectedConditions.visibilityOfElementLocated(WRAPPER));
  }

  public void whenSearch(String term) {
    fill(SEARCH, term);
    new WebDriverWait(driver, Duration.ofSeconds(2)).until(webDriver -> true);
  }

  public void whenOpenNewProductModal() {
    click(NEW_BUTTON);
  }

  public void whenSubmitNewProductWithoutName() {
    wait.until(ExpectedConditions.visibilityOfElementLocated(DIALOG));
    fill(DIALOG_PRICE_INPUT, "99.99");
    click(DIALOG_SUBMIT_BUTTON);
  }

  public void whenOpenEditProduct(int productId) {
    click(editButton(productId));
  }

  public void whenDeleteProduct(int productId) {
    click(deleteButton(productId));
    WebDriverWait alertWait = new WebDriverWait(driver, Duration.ofSeconds(5));
    alertWait.until(ExpectedConditions.alertIsPresent());
    driver.switchTo().alert().accept();
    wait.until(ExpectedConditions.invisibilityOfElementLocated(productRow(productId)));
  }

  public void whenCloseDialog() {
    click(DIALOG_CLOSE);
  }

  public void thenValidatedProductManagementScreenVisible() {
    assertTrue(textOf(TITLE).contains("Gestão de Produtos"));
    assertTrue(isVisible(NEW_BUTTON));
    attachScreenshot("thenValidatedProductManagementScreenVisible");
  }

  public void thenValidatedProductsTableVisible() {
    assertTrue(isVisible(TABLE));
    assertTrue(!driver.findElements(TABLE_BODY_ROWS).isEmpty());
    attachScreenshot("thenValidatedProductsTableVisible");
  }

  public void thenValidatedProductListed(String name) {
    ensureTextsVisible(name);
    attachScreenshot("thenValidatedProductListed");
  }

  public void thenValidatedProductNotListed(int productId) {
    wait.until(ExpectedConditions.invisibilityOfElementLocated(productRow(productId)));
    attachScreenshot("thenValidatedProductNotListed");
  }

  public void thenValidatedProductNameNotInTable(String name) {
    wait.until(
        ExpectedConditions.invisibilityOfElementLocated(
            By.xpath(
                "//*[@id='support-products-table']//*[contains(normalize-space(.), '"
                    + name
                    + "')]")));
    attachScreenshot("thenValidatedProductNameNotInTable");
  }

  public void thenValidatedEmptySearchStateVisible() {
    assertTrue(isVisible(EMPTY));
    ensureTextsVisible("Nenhum produto encontrado");
    attachScreenshot("thenValidatedEmptySearchStateVisible");
  }

  public void thenValidatedCreateProductDialogVisible() {
    assertTrue(isVisible(DIALOG));
    ensureTextsVisible("Cadastrar Produto");
    attachScreenshot("thenValidatedCreateProductDialogVisible");
  }

  public void thenValidatedRequiredNameValidationVisible() {
    ensureTextsVisible("obrigatório");
    attachScreenshot("thenValidatedRequiredNameValidationVisible");
  }

  public void thenValidatedEditDialogWithPrefilledName(String name) {
    ensureTextsVisible("Editar Produto");
    wait.until(ExpectedConditions.visibilityOfElementLocated(DIALOG));
    assertEquals(name, inputValue(DIALOG_NAME_INPUT));
    attachScreenshot("thenValidatedEditDialogWithPrefilledName");
  }

}
