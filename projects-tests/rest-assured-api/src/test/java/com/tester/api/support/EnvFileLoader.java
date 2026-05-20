package com.tester.api.support;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import io.github.cdimascio.dotenv.Dotenv.Filter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.logging.Logger;

public final class EnvFileLoader {

  private static final Logger LOGGER = Logger.getLogger(EnvFileLoader.class.getName());
  private static volatile Path loadedEnvDirectory;

  private EnvFileLoader() {}

  public static void loadIfPresent() {
    Path envDirectory = resolveEnvDirectory();
    if (envDirectory == null) {
      LOGGER.warning(
          "No REST API .env found. Expected projects-tests/rest-assured-api/.env (cwd: "
              + Path.of("").toAbsolutePath().normalize()
              + ").");
      loadRepoRootFallback();
      return;
    }

    loadedEnvDirectory = envDirectory;
    int loadedCount = loadEnvDirectory(envDirectory, true);
    loadRepoRootFallback();
    LOGGER.info(
        () ->
            "Loaded "
                + loadedCount
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
      Path moduleEnv =
          current.resolve("projects-tests").resolve("rest-assured-api").resolve(".env");
      if (Files.isRegularFile(moduleEnv)) {
        return current.resolve("projects-tests").resolve("rest-assured-api");
      }
      if (Files.isRegularFile(current.resolve(".env"))
          && current.getFileName() != null
          && "rest-assured-api".equals(current.getFileName().toString())) {
        return current;
      }
      current = current.getParent();
    }

    Path relativeModuleEnv = Path.of("projects-tests", "rest-assured-api", ".env");
    if (Files.isRegularFile(relativeModuleEnv)) {
      return Path.of("projects-tests", "rest-assured-api");
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
