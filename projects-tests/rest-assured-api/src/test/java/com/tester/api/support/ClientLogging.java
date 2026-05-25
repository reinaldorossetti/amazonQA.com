package com.tester.api.support;

import org.apache.logging.log4j.Logger;

import io.restassured.response.Response;

public final class ClientLogging {

  private static final boolean DEBUG_ENABLED =
      Boolean.parseBoolean(System.getProperty("api.client.debug", "true"));

  private ClientLogging() {}

  public static void logResponse(Logger logger, String action, Response response) {
    logger.info("{}: status {}", action, response.getStatusCode());
    if (DEBUG_ENABLED && logger.isDebugEnabled()) {
      logger.debug("{}: body {}", action, response.getBody().asString());
    }
  }
}
