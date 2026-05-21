package com.tester.web.e2e.tests;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.tester.web.e2e.pages.LoginPageAction;
import com.tester.web.e2e.pages.NavBarComponent;
import com.tester.web.e2e.pages.RegisterPageAction;
import com.tester.web.e2e.support.ApiClient;
import com.tester.web.e2e.support.ApiClient.CreatedUser;
import com.tester.web.e2e.support.LoginTestData;
import com.tester.web.e2e.support.TestDataGenerator;
import com.tester.web.e2e.support.TestDataGenerator.UserData;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Register and Login")
class RegisterLoginFeatureTest extends AbstractUiTest {

  private RegisterPageAction register;
  private LoginPageAction loginPage;
  private NavBarComponent nav;

  @BeforeEach
  void setupPages() {
    register = new RegisterPageAction(driver);
    loginPage = new LoginPageAction(driver);
    nav = new NavBarComponent(driver);
  }

  @Test
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("REG-LOGIN-01 should register via UI and login with same credentials")
  void shouldRegisterAndLoginWithSameCredentials() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.reg.login." + System.currentTimeMillis() + "@example.com";
    UserData registered = new UserData(user.firstName(), user.lastName(), email, user.password());
    String cpf = TestDataGenerator.validCpf();

    try {
      register.givenUserOnRegister();
      register.whenCompletePfRegistration(registered, cpf);
      register.thenValidatedSuccessMessage();
      register.whenNavigateToLogin();
      loginPage.loginAction(email, user.password(), true);
      loginPage.thenValidatedAccountLayoutVisible(user.firstName());
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(
              admin ->
                  ApiClient.tryLogin(email, user.password())
                      .ifPresent(
                          session -> ApiClient.deleteUser(admin.accessToken(), session.userId())));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("REG-LOGIN-02 should logout and login again with same credentials")
  void shouldLogoutAndLoginAgainWithSameCredentials() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.relogin." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.thenValidatedAccountLayoutVisible(user.firstName());
      nav.whenLogout();
      nav.assertUserGreetingHidden();
      loginPage.open();
      loginPage.loginAction(email, user.password(), true);
      loginPage.thenValidatedAccountLayoutVisible(user.firstName());
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }

  @Test
  @Severity(SeverityLevel.NORMAL)
  @DisplayName("REG-LOGIN-03 should show error for wrong password and stay on login page")
  void shouldRejectWrongPasswordAfterRegistration() {
    UserData user = TestDataGenerator.randomUser();
    String email = "e2e.wrong.pw." + System.currentTimeMillis() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    try {
      loginPage.open();
      loginPage.loginAction(email, LoginTestData.WRONG_PASSWORD, true);
      loginPage.thenValidatedInvalidCredentialsError();
      loginPage.thenValidatedStillOnLoginPage();
    } finally {
      ApiClient.tryLoginAdmin()
          .ifPresent(admin -> ApiClient.deleteUser(admin.accessToken(), created.id()));
    }
  }
}
