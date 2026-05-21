package com.tester.web.e2e.tests;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

import com.tester.web.e2e.pages.AdminPageAction;
import com.tester.web.e2e.support.ApiClient;
import com.tester.web.e2e.support.ApiClient.CreatedProduct;
import com.tester.web.e2e.support.ApiClient.CreatedUser;
import com.tester.web.e2e.support.ApiClient.LoginResponse;
import com.tester.web.e2e.support.AuthSessionHelper;
import com.tester.web.e2e.support.TestDataGenerator;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;

@Epic("Web UI")
@Feature("Admin Management")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminManagementFeatureTest extends AbstractUiTest {

  private AdminPageAction admin;
  private LoginResponse adminSession;

  @BeforeEach
  void setupPage() {
    admin = new AdminPageAction(driver);
    adminSession = ApiClient.tryLoginAdmin().orElse(null);
    Assumptions.assumeTrue(adminSession != null, "Admin login unavailable");
    AuthSessionHelper.setAuthenticatedSession(driver, adminSession);
    admin.givenAdminOnHome();
  }

  @Test
  @Order(1)
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-001 admin should list real products and delete the created one")
  void adminShouldDeleteCreatedProduct() {
    CreatedProduct created =
        ApiClient.createProduct(
            adminSession.accessToken(), "Produto Admin E2E " + TestDataGenerator.randomNumeric8());

    admin.whenOpenAdminProducts();
    admin.thenValidatedProductListed(created.name());
    admin.whenDeleteProduct(created.id());
    admin.thenValidatedProductNotListed(created.name());
  }

  @Test
  @Order(2)
  @Severity(SeverityLevel.CRITICAL)
  @DisplayName("TC-002 admin should list real users and delete the created one")
  void adminShouldDeleteCreatedUser() {
    var user = TestDataGenerator.randomUser();
    String email = "e2e.admin.user." + TestDataGenerator.randomNumeric8() + "@example.com";
    CreatedUser created = ApiClient.registerUser(email, user.password(), user.firstName(), user.lastName());

    admin.whenOpenAdminUsers();
    admin.thenValidatedUserListed(created.email());
    admin.whenDeleteUser(created.id());
    admin.thenValidatedDeleteUserToast();
    admin.thenValidatedUserNotListed(created.email());
  }
}
