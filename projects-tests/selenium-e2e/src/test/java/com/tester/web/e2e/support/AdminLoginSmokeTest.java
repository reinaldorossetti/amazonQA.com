package com.tester.web.e2e.support;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class AdminLoginSmokeTest {

  @Test
  void adminAndSupportLoginAvailable() {
    EnvFileLoader.loadIfPresent();
    var direct = ApiClient.login(EnvConfig.get("E2E_ADMIN_EMAIL"), EnvConfig.get("E2E_ADMIN_PASSWORD"));
    assertTrue(ApiClient.tryLoginAdmin().isPresent(), "tryLoginAdmin");
    assertTrue(ApiClient.tryLoginSupport().isPresent(), "tryLoginSupport");
  }
}
