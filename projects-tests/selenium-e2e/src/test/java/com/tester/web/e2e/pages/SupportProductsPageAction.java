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
    wait.until(ExpectedConditions.elementToBeClickable(ACCOUNT_MENU)).click();
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
    WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='dialog']")));
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
    clickElementWithFocus(
        wait.until(ExpectedConditions.elementToBeClickable(
            By.cssSelector("[role='dialog'] button[aria-label='close']"))));
  }

  public void assertTitleContains(String text) {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(TITLE)).getText().contains(text));
  }

  public void assertNewProductButtonVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(NEW_BUTTON)).isDisplayed());
  }

  public void assertTableVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(TABLE)).isDisplayed());
    assertTrue(!driver.findElements(By.cssSelector("#support-products-table tbody tr")).isEmpty());
  }

  public void assertProductListed(String name) {
    assertTextsVisible(name);
  }

  public void assertProductNotListed(String name) {
    wait.until(webDriver -> !webDriver.getPageSource().contains(name));
    assertFalse(driver.getPageSource().contains(name));
  }

  public void assertEmptyStateVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(EMPTY)).isDisplayed());
    assertTextsVisible("Nenhum produto encontrado");
  }

  public void assertCreateDialogVisible() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='dialog']"))).isDisplayed());
    assertTextsVisible("Cadastrar Produto");
  }

  public void assertRequiredNameValidationVisible() {
    assertTextsVisible("obrigatório");
  }

  public void assertEditDialogVisible() {
    assertTextsVisible("Editar Produto");
  }

  public void assertEditDialogNamePrefilled(String name) {
    WebElement dialog = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[role='dialog']")));
    WebElement nameInput = dialog.findElement(By.cssSelector("input"));
    assertEquals(name, nameInput.getAttribute("value"));
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
