package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.LoginPageAction;
import com.tester.web.e2e.support.LoginTestData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Login")
class LoginFeatureTest extends AbstractUiTest {

  private LoginPageAction loginPage;

  @BeforeEach
  void navigateToLogin() {
    loginPage = new LoginPageAction(driver);
    loginPage.open();
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("Successful login redirects to the account area and shows the user greeting")
  void successfulLoginRedirectsToAccountArea() {
    String[] loginPageTexts = {
      "Entrar",
      "Ao entrar, você concorda com os Termos de Uso.",
      "Esqueceu a senha?",
      "Novo no amazonQA.com?",
      "Criar sua conta"
    };
    loginPage.validatedLoginPage(loginPageTexts);
    loginPage.loginAction(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, true);
    loginPage.validatedLoginInPage("Reinaldo");
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("Invalid credentials show the API error alert")
  void invalidCredentialsShowErrorAlert() {
    loginPage.loginAction(LoginTestData.SAMPLE_VALID_EMAIL, LoginTestData.WRONG_PASSWORD, true);
    loginPage.validatedErrorAlertVisible("Preencha e-mail e senha.");
  }

  @Test
  @Severity(SeverityLevel.MINOR)
  @DisplayName("Submitting empty fields shows client-side validation on the alert")
  void emptyFieldsShowValidationAlert() {
    loginPage.loginAction("", "", true);
    loginPage.validatedErrorAlertVisible("Preencha e-mail e senha.");
  }

  @Test
  @Severity(SeverityLevel.MINOR)
  @DisplayName("Submitting with empty password shows the same validation alert")
  void emptyPasswordShowsValidationAlert() {
    loginPage.loginAction(LoginTestData.SAMPLE_VALID_EMAIL, "", true);
    loginPage.validatedErrorAlertVisible("Preencha e-mail e senha.");
  }
}
