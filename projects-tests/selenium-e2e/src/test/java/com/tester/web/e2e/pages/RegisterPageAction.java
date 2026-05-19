package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.tester.web.e2e.config.TestEnvironment;
import com.tester.web.e2e.support.RegisterValidation;
import com.tester.web.e2e.support.TestDataGenerator.UserData;

public class RegisterPageAction extends RegisterPageElements {

  public RegisterPageAction(WebDriver driver) {
    super(driver);
  }

  public void givenUserOnRegister() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/register");
    wait.until(ExpectedConditions.visibilityOfElementLocated(FORM_BODY));
  }

  public void whenFillPersonalData(UserData userData, String cpf) {
    fillField(FIRST_NAME, userData.firstName());
    fillField(LAST_NAME, userData.lastName());
    fillField(CPF, cpf);
    fillField(EMAIL, userData.email());
    fillField(PHONE, RegisterValidation.VALID_PHONE);
    fillField(PASSWORD, userData.password());
    fillField(CONFIRM_PASSWORD, userData.password());
  }

  public void whenFillPersonalDataWithoutCpf(UserData userData) {
    fillField(FIRST_NAME, userData.firstName());
    fillField(LAST_NAME, userData.lastName());
    fillField(EMAIL, userData.email());
    fillField(PASSWORD, userData.password());
    fillField(CONFIRM_PASSWORD, userData.password());
  }

  public void whenFillStepZeroOmitting(RequiredField omitted, UserData userData) {
    switch (omitted) {
      case FIRST_NAME -> {
        fillField(LAST_NAME, userData.lastName());
        fillField(EMAIL, userData.email());
        fillField(PASSWORD, userData.password());
        fillField(CONFIRM_PASSWORD, userData.password());
      }
      case LAST_NAME -> {
        fillField(FIRST_NAME, userData.firstName());
        fillField(EMAIL, userData.email());
        fillField(PASSWORD, userData.password());
        fillField(CONFIRM_PASSWORD, userData.password());
      }
      case EMAIL -> {
        fillField(FIRST_NAME, userData.firstName());
        fillField(LAST_NAME, userData.lastName());
        fillField(PASSWORD, userData.password());
        fillField(CONFIRM_PASSWORD, userData.password());
      }
      case PASSWORD -> {
        fillField(FIRST_NAME, userData.firstName());
        fillField(LAST_NAME, userData.lastName());
        fillField(EMAIL, userData.email());
      }
    }
  }

  public enum RequiredField {
    FIRST_NAME(RegisterValidation.ERROR_FIRST_NAME_REQUIRED),
    LAST_NAME(RegisterValidation.ERROR_LAST_NAME_REQUIRED),
    EMAIL(RegisterValidation.ERROR_EMAIL_INVALID),
    PASSWORD(RegisterValidation.ERROR_PASSWORD_MIN_LENGTH);

    private final String expectedError;

    RequiredField(String expectedError) {
      this.expectedError = expectedError;
    }

    public String expectedError() {
      return expectedError;
    }
  }

  public void whenFillPersonalDataWithMismatchPassword(UserData userData, String confirmPassword) {
    fillField(FIRST_NAME, userData.firstName());
    fillField(LAST_NAME, userData.lastName());
    fillField(EMAIL, userData.email());
    fillField(PASSWORD, userData.password());
    fillField(CONFIRM_PASSWORD, confirmPassword);
  }

  public void whenFillPersonalDataWithShortPassword(UserData userData, String shortPassword) {
    fillField(FIRST_NAME, userData.firstName());
    fillField(LAST_NAME, userData.lastName());
    fillField(EMAIL, userData.email());
    fillField(PASSWORD, shortPassword);
    fillField(CONFIRM_PASSWORD, shortPassword);
  }

  public void whenFillPersonalDataWithInvalidEmail(UserData userData, String invalidEmail) {
    fillField(FIRST_NAME, userData.firstName());
    fillField(LAST_NAME, userData.lastName());
    fillField(EMAIL, invalidEmail);
    fillField(PASSWORD, userData.password());
    fillField(CONFIRM_PASSWORD, userData.password());
  }

  public void whenClickNext() {
    clickField(NEXT_BUTTON);
  }

  public void whenFillAddressAndSubmit() {
    moveFocusToElement(wait.until(ExpectedConditions.visibilityOfElementLocated(FORM_BODY)));
    fillField(ZIP_CODE, RegisterValidation.VALID_ZIP_CODE);
    new WebDriverWait(driver, Duration.ofSeconds(15))
        .until(webDriver -> {
          WebElement street = webDriver.findElement(STREET);
          String value = street.getAttribute("value");
          return value != null && !value.isBlank();
        });
    fillField(NUMBER, RegisterValidation.ADDRESS_NUMBER);
    clickField(SUBMIT_BUTTON);
  }

  public void thenValidatedSuccessMessage() {
    assertTextsVisible(RegisterValidation.SUCCESS_MESSAGE);
    attachScreenshot("registerSuccess");
  }

  public void thenValidatedErrorMessage(String message) {
    assertTextsVisible(message);
  }

  public void thenValidatedStillOnStepZero() {
    assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(NEXT_BUTTON)).isDisplayed());
  }

  public void thenValidatedAllEmptyFieldErrors() {
    assertTextsVisible(
        RegisterValidation.ERROR_FIRST_NAME_REQUIRED,
        RegisterValidation.ERROR_LAST_NAME_REQUIRED,
        RegisterValidation.ERROR_CPF_INVALID,
        RegisterValidation.ERROR_EMAIL_INVALID,
        RegisterValidation.ERROR_PHONE_INVALID,
        RegisterValidation.ERROR_PASSWORD_MIN_LENGTH);
  }

  private void fillField(org.openqa.selenium.By locator, String value) {
    WebElement field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    clickElementWithFocus(field);
    field.clear();
    field.sendKeys(value);
  }

  private void clickField(org.openqa.selenium.By locator) {
    WebElement field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    clickElementWithFocus(field);
  }
}
