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

  @DisplayName("TC-001 Successful login redirects to the account area and shows the user greeting")

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

  @DisplayName("TC-002 login with next=/cart should redirect to cart with greeting")

  void loginWithNextRedirectShouldGoToCart() {

    loginPage.openWithNextPath("/cart");

    loginPage.loginAction(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, true);

    loginPage.thenValidatedRedirectToCartWithGreeting("Reinaldo");

  }



  @Test

  @Severity(SeverityLevel.NORMAL)

  @DisplayName("TC-003 authenticated session should persist after page reload")

  void sessionShouldPersistAfterReload() {

    loginPage.loginAction(LoginTestData.VALID_EMAIL, LoginTestData.VALID_PASSWORD, true);

    loginPage.validatedLoginInPage("Reinaldo");

    loginPage.thenValidatedSessionPersistsAfterReload("Reinaldo");

  }



  @Test

  @Severity(SeverityLevel.MINOR)

  @DisplayName("TC-004 blank email with filled password should show required fields validation")

  void blankEmailShouldShowRequiredFieldsValidation() {

    loginPage.loginAction("", LoginTestData.VALID_PASSWORD, true);

    loginPage.validatedErrorAlertVisible(LoginTestData.REQUIRED_FIELDS_MESSAGE);

  }



  @Test

  @Severity(SeverityLevel.MINOR)

  @DisplayName("TC-005 email and password fields should cap input at 30 characters")

  void credentialsShouldCapAtThirtyCharacters() {

    loginPage.thenValidatedEmailPasswordMaxLength(LoginTestData.LONG_CREDENTIAL_PAYLOAD);

  }



  @Test

  @Severity(SeverityLevel.NORMAL)

  @DisplayName("TC-006 Invalid credentials show the API error alert")

  void invalidCredentialsShowErrorAlert() {

    loginPage.loginAction(LoginTestData.SAMPLE_VALID_EMAIL, LoginTestData.WRONG_PASSWORD, true);

    loginPage.thenValidatedInvalidCredentialsError();

  }



  @Test

  @Severity(SeverityLevel.MINOR)

  @DisplayName("TC-007 Submitting empty fields shows client-side validation on the alert")

  void emptyFieldsShowValidationAlert() {

    loginPage.loginAction("", "", true);

    loginPage.validatedErrorAlertVisible(LoginTestData.REQUIRED_FIELDS_MESSAGE);

  }



  @Test

  @Severity(SeverityLevel.MINOR)

  @DisplayName("TC-008 Submitting with empty password shows the same validation alert")

  void emptyPasswordShowsValidationAlert() {

    loginPage.loginAction(LoginTestData.SAMPLE_VALID_EMAIL, "", true);

    loginPage.validatedErrorAlertVisible(LoginTestData.REQUIRED_FIELDS_MESSAGE);

  }

}

