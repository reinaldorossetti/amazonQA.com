package com.tester.web.e2e.tests;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.tester.web.e2e.config.TestEnvironment;
import com.tester.web.e2e.pages.LoginPage;
import com.tester.web.e2e.pages.NavBarComponent;
import com.tester.web.e2e.support.LoginTestData;
import com.tester.web.e2e.support.LoginUiCopy;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

@Epic("Web UI")
@Feature("Login")
class LoginFeatureTest extends AbstractUiTest {

  private LoginPage loginPage;

  @BeforeEach
  void navigateToLogin() {
    loginPage = new LoginPage(driver);
    loginPage.open();
  }

  @Test
  @DisplayName("Successful login redirects to the account area and shows the user greeting")
  @EnabledIf("com.tester.web.e2e.support.LoginExecutionConditions#credentialsConfigured")
  void successfulLoginRedirectsToAccountArea() {
    loginPage.login(TestEnvironment.loginEmail(), TestEnvironment.loginPassword());

    var wait = new WebDriverWait(driver, TestEnvironment.defaultWait());
    wait.until(ExpectedConditions.urlContains("/minha-conta"));
    wait.until(
        ExpectedConditions.visibilityOfElementLocated(
            By.cssSelector("[data-testid='account-layout-wrapper']")));

    assertTrue(new NavBarComponent(driver).isUserGreetingVisible());
  }

  @Test
  @DisplayName("Invalid credentials show the API error alert")
  void invalidCredentialsShowErrorAlert() {
    loginPage.login(LoginTestData.SAMPLE_VALID_EMAIL, LoginTestData.WRONG_PASSWORD);

    assertTrue(loginPage.isErrorAlertVisible());
    assertTrue(LoginUiCopy.INVALID_CREDENTIALS.matcher(loginPage.errorAlertText()).matches());
  }

  @Test
  @DisplayName("Submitting empty fields shows client-side validation on the alert")
  void emptyFieldsShowValidationAlert() {
    loginPage.submit();

    assertTrue(loginPage.isErrorAlertVisible());
    assertTrue(LoginUiCopy.EMPTY_OR_MISSING_PASSWORD.matcher(loginPage.errorAlertText()).matches());
  }

  @Test
  @DisplayName("Submitting with empty password shows the same validation alert")
  void emptyPasswordShowsValidationAlert() {
    loginPage.fillEmail(LoginTestData.SAMPLE_VALID_EMAIL);
    loginPage.submit();

    assertTrue(loginPage.isErrorAlertVisible());
    assertTrue(LoginUiCopy.EMPTY_OR_MISSING_PASSWORD.matcher(loginPage.errorAlertText()).matches());
  }
}
