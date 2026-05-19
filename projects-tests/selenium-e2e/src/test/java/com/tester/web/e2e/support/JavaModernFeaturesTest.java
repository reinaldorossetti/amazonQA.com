package com.tester.web.e2e.support;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.tester.web.e2e.config.BrowserName;

/**
 * Smoke tests for Java 17+ language features used in this module (no WebDriver).
 * Examples are documented in README — Recursos Java 17+.
 */
class JavaModernFeaturesTest {

  @Test
  void recordAndSwitchExpressionResolveBrowserAliases() {
    assertEquals(BrowserName.FIREFOX, BrowserName.fromSystemProperty("ff"));
    assertEquals(BrowserName.EDGE, BrowserName.fromSystemProperty("msedge"));
  }

  @Test
  void textBlockBuildsLoginJsonPayload() {
    String json = JsonPayloads.loginBody("user@test.com", "secret\"123");
    assertTrue(json.contains("\"email\":\"user@test.com\""));
    assertTrue(json.contains("\"password\":\"secret\\\"123\""));
  }

  @Test
  void formattedBuildsTestIdSelector() {
    assertTrue(Selectors.byTestId("nav-cart-btn").toString().contains("[data-testid='nav-cart-btn']"));
  }

  @Test
  void recordHoldsGeneratedUserData() {
    TestDataGenerator.UserData user = TestDataGenerator.randomUser();
    assertTrue(user.email().contains("@"));
    assertTrue(user.password().length() >= 8);
  }
}
