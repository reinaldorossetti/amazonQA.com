package com.tester.web.e2e.support;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.logging.Logger;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import io.github.cdimascio.dotenv.Dotenv.Filter;

/**
 * Loads {@code .env} from the selenium-e2e module via dotenv-java into system properties.
 * Values from the module {@code .env} take precedence over pre-existing OS environment variables
 * for the same keys, so local test credentials are not shadowed by stale shell env.
 */
public final class EnvFileLoader {

  private static final Logger LOGGER = Logger.getLogger(EnvFileLoader.class.getName());

  private EnvFileLoader() {}

  public static void loadIfPresent() {
    Path envDirectory = resolveEnvDirectory();
    if (envDirectory == null) {
      LOGGER.fine("No .env file found for Selenium E2E.");
      return;
    }

    Dotenv dotenv =
        Dotenv.configure()
            .directory(envDirectory.toString())
            .filename(".env")
            .ignoreIfMalformed()
            .ignoreIfMissing()
            .load();

    int loadedCount = 0;
    for (DotenvEntry entry : dotenv.entries(Filter.DECLARED_IN_ENV_FILE)) {
      String value = entry.getValue();
      if (value == null) {
        continue;
      }
      System.setProperty(entry.getKey(), value);
      loadedCount++;
    }

    int totalLoaded = loadedCount;
    LOGGER.info(
        () ->
            "Loaded "
                + totalLoaded
                + " entries from "
                + envDirectory.resolve(".env").toAbsolutePath());
  }

  private static Path resolveEnvDirectory() {
    Path moduleEnv = Path.of(".env");
    if (Files.isRegularFile(moduleEnv)) {
      return Path.of(".");
    }
    Path fromRepoRoot = Path.of("projects-tests", "selenium-e2e", ".env");
    if (Files.isRegularFile(fromRepoRoot)) {
      return Path.of("projects-tests", "selenium-e2e");
    }
    return null;
  }
}
