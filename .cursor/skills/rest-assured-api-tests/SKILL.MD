# SKILL.md — REST Assured with Java 23 (Clean Code, Scalable, CI-Ready)

## Skill Name
`rest-assured-java23-clean-code`

## Goal
Design, implement, and maintain robust REST API automated tests using:

- REST Assured
- Java 23
- JUnit 5
- Hamcrest
- JSON Schema validation
- Allure reporting
- `.env`-based environment configuration

---

## Sources Used

- REST Assured — Getting Started  
  https://github.com/rest-assured/rest-assured/wiki/GettingStarted
- REST Assured — Usage  
  https://github.com/rest-assured/rest-assured/wiki/Usage

---

## Core Principles

1. **Readability first** (`given / when / then` must tell the story).
2. **Single responsibility per test** (one behavior per test method).
3. **No duplicated HTTP setup** (centralize base URI, headers, auth).
4. **No shared mutable state** (parallel-safe tests).
5. **Fail with useful diagnostics** (request/response logging on failures).
6. **Environment-driven configuration** (`.env` + system env + JVM props).

---

## Recommended Test Project Structure

```text
src
└── test
    ├── java
    │   └── com/yourcompany/api
    │       ├── base
    │       │   ├── BaseApiTest.java
    │       │   └── EnvironmentConfig.java
    │       ├── specs
    │       │   ├── RequestSpecs.java
    │       │   └── ResponseSpecs.java
    │       ├── client
    │       │   ├── AuthClient.java
    │       │   └── UsersClient.java
    │       ├── model
    │       │   ├── request
    │       │   │   └── LoginRequest.java
    │       │   └── response
    │       │       └── LoginResponse.java
    │       ├── fixture
    │       │   └── UserFixture.java
    │       └── tests
    │           ├── auth
    │           │   └── LoginTest.java
    │           └── users
    │               └── CreateUserTest.java
    └── resources
        ├── schemas
        │   └── login-response.schema.json
        ├── data
        │   └── invalid-logins.csv
        └── junit-platform.properties
```

---

## Dependency Management (Maven)

> Keep versions in `<properties>` and update continuously via automation (Renovate/Dependabot + `versions-maven-plugin`).

```xml
<properties>
    <maven.compiler.release>23</maven.compiler.release>

    <!-- Pin to current stable versions used by your org baseline -->
    <restassured.version>6.0.0</restassured.version>
    <junit.jupiter.version>5.12.2</junit.jupiter.version>
    <hamcrest.version>3.0</hamcrest.version>
    <jackson.version>2.18.3</jackson.version>
    <allure.version>2.29.1</allure.version>
    <dotenv.version>3.0.0</dotenv.version>
</properties>

<dependencies>
    <!-- REST Assured -->
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <version>${restassured.version}</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>json-schema-validator</artifactId>
        <version>${restassured.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${junit.jupiter.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Hamcrest -->
    <dependency>
        <groupId>org.hamcrest</groupId>
        <artifactId>hamcrest</artifactId>
        <version>${hamcrest.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Jackson (serialization/deserialization) -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>${jackson.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- Allure -->
    <dependency>
        <groupId>io.qameta.allure</groupId>
        <artifactId>allure-rest-assured</artifactId>
        <version>${allure.version}</version>
        <scope>test</scope>
    </dependency>

    <!-- .env reader -->
    <dependency>
        <groupId>io.github.cdimascio</groupId>
        <artifactId>dotenv-java</artifactId>
        <version>${dotenv.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## Static Imports Standard

```java
import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.*;
```

---

## `.env` Configuration (Required)

Create a `.env` file in project root:

```dotenv
BASE_URI=https://qa.api.example.com
BASE_PATH=/api/v1
API_USER=test.user@example.com
API_PASSWORD=SuperSecret123
```

### EnvironmentConfig.java

```java
package com.yourcompany.api.base;

import io.github.cdimascio.dotenv.Dotenv;

public final class EnvironmentConfig {

    private static final Dotenv DOTENV = Dotenv.configure()
            .ignoreIfMalformed()
            .ignoreIfMissing()
            .load();

    private EnvironmentConfig() {}

    public static String baseUri() {
        return firstNonBlank(
                System.getProperty("baseUri"),
                System.getenv("BASE_URI"),
                DOTENV.get("BASE_URI"),
                "https://qa.api.example.com"
        );
    }

    public static String basePath() {
        return firstNonBlank(
                System.getProperty("basePath"),
                System.getenv("BASE_PATH"),
                DOTENV.get("BASE_PATH"),
                "/api/v1"
        );
    }

    public static String apiUser() {
        return firstNonBlank(
                System.getProperty("apiUser"),
                System.getenv("API_USER"),
                DOTENV.get("API_USER"),
                ""
        );
    }

    public static String apiPassword() {
        return firstNonBlank(
                System.getProperty("apiPassword"),
                System.getenv("API_PASSWORD"),
                DOTENV.get("API_PASSWORD"),
                ""
        );
    }

    private static String firstNonBlank(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v;
        }
        return "";
    }
}
```

**Precedence rule:** JVM props (`-D`) > OS env vars > `.env` > default.

---

## Base Setup (Centralized)

```java
package com.yourcompany.api.base;

import io.restassured.RestAssured;
import org.junit.jupiter.api.BeforeAll;

public abstract class BaseApiTest {

    @BeforeAll
    static void globalSetup() {
        RestAssured.baseURI = EnvironmentConfig.baseUri();
        RestAssured.basePath = EnvironmentConfig.basePath();
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }
}
```

---

## Reusable Specs

```java
package com.yourcompany.api.specs;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;

public final class RequestSpecs {
    private RequestSpecs() {}

    public static RequestSpecification json() {
        return new RequestSpecBuilder()
                .setContentType(ContentType.JSON)
                .setAccept(ContentType.JSON)
                .build();
    }

    public static RequestSpecification bearer(String token) {
        return new RequestSpecBuilder()
                .addRequestSpecification(json())
                .addHeader("Authorization", "Bearer " + token)
                .build();
    }
}

public final class ResponseSpecs {
    private ResponseSpecs() {}

    public static ResponseSpecification okJson() {
        return new ResponseSpecBuilder()
                .expectStatusCode(200)
                .expectContentType(ContentType.JSON)
                .build();
    }
}
```

---

## Java 23 Model Style (Records)

```java
package com.yourcompany.api.model.request;
public record LoginRequest(String email, String password) {}
```

```java
package com.yourcompany.api.model.response;
public record LoginResponse(String message, String authorization) {}
```

---

## Domain Client Pattern

```java
package com.yourcompany.api.client;

import com.yourcompany.api.model.request.LoginRequest;
import com.yourcompany.api.specs.RequestSpecs;
import io.restassured.response.Response;

import static io.restassured.RestAssured.given;

public class AuthClient {

    public Response login(LoginRequest payload) {
        return given()
                .spec(RequestSpecs.json())
                .body(payload)
            .when()
                .post("/login");
    }
}
```

---

## Clean Test Example

```java
package com.yourcompany.api.tests.auth;

import com.yourcompany.api.base.BaseApiTest;
import com.yourcompany.api.client.AuthClient;
import com.yourcompany.api.model.request.LoginRequest;
import com.yourcompany.api.model.response.LoginResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.startsWith;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class LoginTest extends BaseApiTest {

    private final AuthClient authClient = new AuthClient();

    @Test
    @DisplayName("CT-LOGIN-001: should authenticate valid user and return Bearer token")
    void shouldAuthenticateAndReturnBearerToken() {
        var payload = new LoginRequest("valid.user@example.com", "ValidPassword123!");

        var response = authClient.login(payload);

        response.then()
                .statusCode(200)
                .body("authorization", startsWith("Bearer "));

        LoginResponse body = response.as(LoginResponse.class);
        assertNotNull(body.authorization(), "Authorization token must not be null");
    }
}
```

---

## Contract Validation (JSON Schema)

```java
response.then()
        .statusCode(200)
        .body(matchesJsonSchemaInClasspath("schemas/login-response.schema.json"));
```

---

## Data-Driven Tests

```java
@ParameterizedTest(name = "Invalid login for email: {0}")
@CsvFileSource(resources = "/data/invalid-logins.csv", numLinesToSkip = 1)
void shouldReturn401ForInvalidCredentials(String email, String password) {
    given()
        .spec(RequestSpecs.json())
        .body(new LoginRequest(email, password))
    .when()
        .post("/login")
    .then()
        .statusCode(401);
}
```

---

## Parallel Execution (JUnit 5)

`src/test/resources/junit-platform.properties`

```properties
junit.jupiter.execution.parallel.enabled=true
junit.jupiter.execution.parallel.mode.default=concurrent
junit.jupiter.execution.parallel.mode.classes.default=concurrent
```

---

## Anti-Patterns (Forbidden)

- Hardcoded token/credentials in source code.
- Repeating `baseURI`, auth headers, and content type in every test.
- Tests dependent on execution order.
- Multi-scenario “mega tests”.
- Assertions without business meaning.
- `Thread.sleep` for synchronization.

---

## Definition of Done (Checklist)

- [ ] Centralized HTTP setup (`BaseApiTest` + `EnvironmentConfig`).
- [ ] `.env` supported via `dotenv-java`.
- [ ] Reusable request/response specs.
- [ ] DTOs modeled as `record`.
- [ ] Business-readable test names (`@DisplayName`).
- [ ] Logging on failure enabled.
- [ ] Contract validation for critical endpoints.
- [ ] Parallel-safe test suite.
- [ ] No secret hardcoding.

---

## Useful Commands

```bash
# Run tests with defaults (.env)
mvn test

# Override by JVM properties
mvn test -DbaseUri=https://dev.api.example.com -DbasePath=/api/v2

# Run single class
mvn -Dtest=LoginTest test

# Check dependency updates
mvn versions:display-dependency-updates
```

---

## Final Expected Outcome
A test suite that is readable, maintainable, deterministic, environment-flexible, and ready for serious CI/CD pipelines.