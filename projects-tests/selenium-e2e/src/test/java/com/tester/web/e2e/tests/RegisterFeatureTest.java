package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import com.tester.web.e2e.pages.RegisterPageAction;
import com.tester.web.e2e.pages.RegisterPageAction.RequiredField;
import com.tester.web.e2e.support.LoginTestData;
import com.tester.web.e2e.support.RegisterValidation;
import com.tester.web.e2e.support.TestDataGenerator;
import com.tester.web.e2e.support.TestDataGenerator.UserData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Register")
class RegisterFeatureTest extends AbstractUiTest {

  private RegisterPageAction register;

  @BeforeEach
  void setupPage() {
    register = new RegisterPageAction(driver);
    register.givenUserOnRegister();
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 should successfully register when all requirements are valid")
  void shouldSuccessfullyRegisterWithValidData() {
    UserData user = TestDataGenerator.randomUser();
    String cpf = TestDataGenerator.validCpf();

    register.whenFillPersonalData(user, cpf);
    register.whenClickNext();
    register.whenFillAddressAndSubmit();
    register.thenValidatedSuccessMessage();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-002 should reject invalid email format")
  void shouldRejectInvalidEmailFormat() {
    UserData user = TestDataGenerator.randomUser();
    register.whenFillPersonalDataWithInvalidEmail(user, TestDataGenerator.invalidEmail());
    register.whenClickNext();
    register.thenValidatedErrorMessage(RegisterValidation.ERROR_EMAIL_INVALID);
    register.thenValidatedStillOnStepZero();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-003 should reject short password on step 0")
  void shouldRejectShortPasswordOnStepZero() {
    UserData user = TestDataGenerator.randomUser();
    register.whenFillPersonalDataWithShortPassword(user, TestDataGenerator.shortPassword());
    register.whenClickNext();
    register.thenValidatedErrorMessage(RegisterValidation.ERROR_PASSWORD_MIN_LENGTH);
    register.thenValidatedStillOnStepZero();
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-004 should reject mismatched passwords")
  void shouldRejectMismatchedPasswords() {
    UserData user = TestDataGenerator.randomUser();
    register.whenFillPersonalDataWithMismatchPassword(user, TestDataGenerator.differentPassword());
    register.whenClickNext();
    register.thenValidatedErrorMessage(RegisterValidation.ERROR_PASSWORD_MISMATCH);
    register.thenValidatedStillOnStepZero();
  }

  @ParameterizedTest(name = "{displayName}: omit {0}")
  @EnumSource(RequiredField.class)
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-005 should show validation and prevent step advancement when required field is empty")
  void shouldValidateMissingRequiredField(RequiredField omittedField) {
    UserData user = TestDataGenerator.randomUser();
    register.whenFillStepZeroOmitting(omittedField, user);
    register.whenClickNext();
    register.thenValidatedStillOnStepZero();
    register.thenValidatedErrorMessage(omittedField.expectedError());
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-006 should reject duplicate email after submit")
  void shouldRejectDuplicateEmail() {
    UserData user = TestDataGenerator.randomUser();
    register.whenFillPersonalData(
        new UserData(user.firstName(), user.lastName(), LoginTestData.VALID_EMAIL, user.password()),
        TestDataGenerator.validCpf());
    register.whenClickNext();
    register.whenFillAddressAndSubmit();
    register.thenValidatedToastErrorMessage(
        RegisterValidation.ERROR_EMAIL_DUPLICATE, RegisterValidation.ERROR_EMAIL_DUPLICATE_EN);
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("TC-007 should validate all empty fields with individual messages")
  void shouldValidateAllEmptyFields() {
    register.whenClickNext();
    register.thenValidatedAllEmptyFieldErrors();
    register.thenValidatedStillOnStepZero();
  }
}
