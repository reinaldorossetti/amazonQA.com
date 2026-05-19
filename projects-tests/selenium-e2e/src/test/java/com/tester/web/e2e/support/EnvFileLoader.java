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
  private static volatile Path loadedEnvDirectory;

  private EnvFileLoader() {}

  public static void loadIfPresent() {
    Path envDirectory = resolveEnvDirectory();
    if (envDirectory == null) {
      LOGGER.warning(
          "No Selenium E2E .env found. Expected projects-tests/selenium-e2e/.env "
              + "(working directory: "
              + Path.of("").toAbsolutePath().normalize()
              + ").");
      loadRepoRootFallback();
      return;
    }

    loadedEnvDirectory = envDirectory;
    int loadedCount = loadEnvDirectory(envDirectory, true);
    loadRepoRootFallback();

    int totalLoaded = loadedCount;
    LOGGER.info(
        () ->
            "Loaded "
                + totalLoaded
                + " entries from "
                + envDirectory.resolve(".env").toAbsolutePath());
  }

  public static String loadedEnvPath() {
    Path directory = loadedEnvDirectory;
    if (directory == null) {
      return "not loaded";
    }
    return directory.resolve(".env").toAbsolutePath().normalize().toString();
  }

  private static int loadEnvDirectory(Path envDirectory, boolean overwriteExisting) {
    Dotenv dotenv =
        Dotenv.configure()
            .directory(envDirectory.toString())
            .filename(".env")
            .ignoreIfMalformed()
            .ignoreIfMissing()
            .load();

    int loadedCount = 0;
    for (DotenvEntry entry : dotenv.entries(Filter.DECLARED_IN_ENV_FILE)) {
      String key = entry.getKey();
      String value = normalizeValue(entry.getValue());
      if (key == null || key.isBlank() || value == null) {
        continue;
      }
      if (!overwriteExisting && !isUnset(key)) {
        continue;
      }
      System.setProperty(key, value);
      loadedCount++;
    }
    return loadedCount;
  }

  private static void loadRepoRootFallback() {
    Path repoRoot = findRepoRoot();
    if (repoRoot == null) {
      return;
    }
    int loadedCount = loadEnvDirectory(repoRoot, false);
    if (loadedCount > 0) {
      LOGGER.info(
          () ->
              "Loaded "
                  + loadedCount
                  + " fallback entries from "
                  + repoRoot.resolve(".env").toAbsolutePath());
    }
  }

  private static Path findRepoRoot() {
    Path current = Path.of("").toAbsolutePath().normalize();
    for (int depth = 0; depth < 12 && current != null; depth++) {
      if (Files.isRegularFile(current.resolve(".env"))
          && Files.isDirectory(current.resolve("projects-tests"))) {
        return current;
      }
      current = current.getParent();
    }
    return null;
  }

  private static Path resolveEnvDirectory() {
    Path current = Path.of("").toAbsolutePath().normalize();
    for (int depth = 0; depth < 12 && current != null; depth++) {
      Path moduleEnv = current.resolve("projects-tests").resolve("selenium-e2e").resolve(".env");
      if (Files.isRegularFile(moduleEnv)) {
        return current.resolve("projects-tests").resolve("selenium-e2e");
      }
      if (Files.isRegularFile(current.resolve(".env"))
          && current.getFileName() != null
          && "selenium-e2e".equals(current.getFileName().toString())) {
        return current;
      }
      current = current.getParent();
    }

    Path relativeModuleEnv = Path.of("projects-tests", "selenium-e2e", ".env");
    if (Files.isRegularFile(relativeModuleEnv)) {
      return Path.of("projects-tests", "selenium-e2e");
    }
    if (Files.isRegularFile(Path.of(".env"))) {
      return Path.of(".");
    }
    return null;
  }

  private static boolean isUnset(String key) {
    String property = System.getProperty(key);
    if (property != null && !property.isBlank()) {
      return false;
    }
    String env = System.getenv(key);
    return env == null || env.isBlank();
  }

  static String normalizeValue(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    if (trimmed.length() >= 2
        && ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
            || (trimmed.startsWith("'") && trimmed.endsWith("'")))) {
      return trimmed.substring(1, trimmed.length() - 1);
    }
    return trimmed;
  }
}
