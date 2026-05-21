package com.tester.web.e2e.pages;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;

import org.openqa.selenium.WebDriver;
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
    fill(FIRST_NAME, userData.firstName());
    fill(LAST_NAME, userData.lastName());
    fill(CPF, cpf);
    fill(EMAIL, userData.email());
    fill(PHONE, RegisterValidation.VALID_PHONE);
    fill(PASSWORD, userData.password());
    fill(CONFIRM_PASSWORD, userData.password());
  }

  public void whenFillPersonalDataWithoutCpf(UserData userData) {
    fill(FIRST_NAME, userData.firstName());
    fill(LAST_NAME, userData.lastName());
    fill(EMAIL, userData.email());
    fill(PASSWORD, userData.password());
    fill(CONFIRM_PASSWORD, userData.password());
  }

  public void whenFillStepZeroOmitting(RequiredField omitted, UserData userData) {
    switch (omitted) {
      case FIRST_NAME -> {
        fill(LAST_NAME, userData.lastName());
        fill(EMAIL, userData.email());
        fill(PASSWORD, userData.password());
        fill(CONFIRM_PASSWORD, userData.password());
      }
      case LAST_NAME -> {
        fill(FIRST_NAME, userData.firstName());
        fill(EMAIL, userData.email());
        fill(PASSWORD, userData.password());
        fill(CONFIRM_PASSWORD, userData.password());
      }
      case EMAIL -> {
        fill(FIRST_NAME, userData.firstName());
        fill(LAST_NAME, userData.lastName());
        fill(PASSWORD, userData.password());
        fill(CONFIRM_PASSWORD, userData.password());
      }
      case PASSWORD -> {
        fill(FIRST_NAME, userData.firstName());
        fill(LAST_NAME, userData.lastName());
        fill(EMAIL, userData.email());
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
    fill(FIRST_NAME, userData.firstName());
    fill(LAST_NAME, userData.lastName());
    fill(EMAIL, userData.email());
    fill(PASSWORD, userData.password());
    fill(CONFIRM_PASSWORD, confirmPassword);
  }

  public void whenFillPersonalDataWithShortPassword(UserData userData, String shortPassword) {
    fill(FIRST_NAME, userData.firstName());
    fill(LAST_NAME, userData.lastName());
    fill(EMAIL, userData.email());
    fill(PASSWORD, shortPassword);
    fill(CONFIRM_PASSWORD, shortPassword);
  }

  public void whenFillPersonalDataWithInvalidEmail(UserData userData, String invalidEmail) {
    fill(FIRST_NAME, userData.firstName());
    fill(LAST_NAME, userData.lastName());
    fill(EMAIL, invalidEmail);
    fill(PASSWORD, userData.password());
    fill(CONFIRM_PASSWORD, userData.password());
  }

  public void whenClickNext() {
    click(NEXT_BUTTON);
  }

  public void whenFillAddressAndSubmit() {
    moveFocusToElement(FORM_BODY);
    fill(ZIP_CODE, RegisterValidation.VALID_ZIP_CODE);
    new WebDriverWait(driver, Duration.ofSeconds(15))
        .until(webDriver -> {
          String value = webDriver.findElement(STREET).getAttribute("value");
          return value != null && !value.isBlank();
        });
    fill(NUMBER, RegisterValidation.ADDRESS_NUMBER);
    click(SUBMIT_BUTTON);
  }

  public void thenValidatedSuccessMessage() {
    assertTextsVisible(RegisterValidation.SUCCESS_MESSAGE);
    attachScreenshot("registerSuccess");
  }

  public void thenValidatedErrorMessage(String message) {
    assertTextsVisible(message);
  }

  public void thenValidatedStillOnStepZero() {
    assertTrue(isVisible(NEXT_BUTTON));
  }

  public void whenCompletePfRegistration(UserData userData, String cpf) {
    whenFillPersonalData(userData, cpf);
    whenClickNext();
    whenFillAddressAndSubmit();
  }

  public void whenNavigateToLogin() {
    driver.navigate().to(TestEnvironment.baseUrl() + "/login");
    wait.until(ExpectedConditions.urlContains("/login"));
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
}
