# REST Assured API Tests (`rest-assured-api`)

Testes de API com **REST Assured**, **JDK 26**, **JUnit 5** e **Allure**. Espelham a suíte Playwright em `web/e2e/specs/api/`.

Bytecode compilado com **`--release 21`** (`maven.compiler.release`).

## Requisitos

- **JDK 26** para compilar e executar (padrão: `C:\Users\reina\.jdks\openjdk-26.0.1`)
- `.mvn/toolchains.xml` aponta para esse JDK (copie de `.mvn/toolchains.xml.example` se necessário)
- API em `http://127.0.0.1:3001` com base path `/api`
- Seed do backend (`npm run seed` em `server-ts/`)
- Arquivo `.env` (copie de `.env.example` ou reutilize credenciais do `selenium-e2e`)

## Estrutura

```
src/test/java/com/tester/api/
├── base/           # BaseApiTest, EnvironmentConfig
├── specs/          # RequestSpecs, ResponseSpecs
├── client/         # UsersClient, ProductsClient, CartClient, OrdersClient, PaymentsClient
├── model/
│   ├── request/    # RegisterUserRequest, ProductRequest, CartAddRequest, ...
│   └── response/   # ProductResponse, OrderResponse, CartItemResponse, ...
├── fixture/        # UserFixture, ProductFixture, BrazilianDocuments
├── support/        # AuthSession, TestFlows, EnvFileLoader
└── tests/
    ├── users/          # UsersApiTest (users.api.spec.ts)
    ├── products/       # ProductsApiTest
    ├── cart/           # CartApiTest
    ├── orders/         # OrdersApiTest
    ├── payments/       # PaymentsApiTest
    └── supportproducts/ # SupportProductsApiTest
```

## Configuração `.env`

```dotenv
BASE_URI=http://127.0.0.1:3001
BASE_PATH=/api

SEED_ADMIN_EMAIL=admin@tester.com
SEED_ADMIN_PASSWORD=

SEED_SUPPORT_EMAIL=suporte@tester.com
SEED_SUPPORT_PASSWORD=suporte2026@QA
```

Precedência: `-D` JVM > variável OS > `.env` > default.

## Executar

```powershell
cd projects-tests/rest-assured-api

$env:JAVA_HOME = "C:\Users\reina\.jdks\openjdk-26.0.1"
.\mvnw.cmd test
```

Com `.mvn/toolchains.xml`, o profile `jdk26-toolchain` usa o JDK 26 configurado no arquivo.

Por domínio:

```powershell
.\mvnw.cmd test -Dtest=UsersApiTest
.\mvnw.cmd test -Dtest=ProductsApiTest,CartApiTest
```

Override de ambiente:

```powershell
.\mvnw.cmd test -DbaseUri=http://127.0.0.1:3001 -DbasePath=/api
```

## Logging (Log4j 2)

O módulo usa **somente Apache Log4j 2** (`org.apache.logging.log4j`). Não há `java.util.logging` no código do projeto.

Configuração: `src/test/resources/log4j2.xml` ([Apache Log4j 2.26.0](https://github.com/apache/logging-log4j2/releases)) — saída no console com **nível e mensagem coloridos** (`%highlight` / `%style`). Logs de bibliotecas que ainda usam JUL são redirecionados via `log4j-jul` (`java.util.logging.manager` no Surefire).

Desativar cores (ex.: CI sem ANSI): `.\mvnw.cmd test -Dlog4j.skipJansi=true`

| Nível | Quando |
|-------|--------|
| **INFO** | Status HTTP de cada request nos `*Client` (`ClientLogging.logResponse`) |
| **DEBUG** | Corpo da response (padrão local; desligado na CI) |

**Local:** o profile `api-client-debug` vem ativo por padrão (`activeByDefault`) — `mvn test` já loga status + body.

```powershell
.\mvnw.cmd test
```

Desligar debug localmente:

```powershell
.\mvnw.cmd test -Dapi.client.debug=false -Dapi.client.log.level=info
```

## CI (GitHub Actions)

Workflow: [`.github/workflows/rest-assured-api-pipeline.yml`](../../.github/workflows/rest-assured-api-pipeline.yml)

- Sobe `postgres` + `server-ts`, executa `./mvnw clean test` com **log INFO** (`-Dapi.client.debug=false`)
- Copia JUnit → `tests-dashboard/reports/api-rest-assured/` (métricas do dashboard)
- Copia Allure → `tests-dashboard/reports/rest-assured-allure-report/`
- Roda `generate-dashboard-metrics.js` e publica o `tests-dashboard` no gh-pages

## Paralelismo

`junit-platform.properties` habilita execução paralela (classes e métodos). Cada teste cria dados únicos (e-mail/CPF) para ser thread-safe.

## Referência Playwright

| Java | Playwright |
|------|------------|
| `UsersApiTest` | `web/e2e/specs/api/users.api.spec.ts` |
| `ProductsApiTest` | `products.api.spec.ts` |
| `CartApiTest` | `cart.api.spec.ts` |
| `OrdersApiTest` | `orders.api.spec.ts` |
| `PaymentsApiTest` | `payments.api.spec.ts` |
| `SupportProductsApiTest` | `support-products.api.spec.ts` |

## Stack

- REST Assured 5.5.0
- JUnit Jupiter 5.11.4
- Hamcrest 3.0
- Allure 2.34.0
- dotenv-java 3.2.0
- Datafaker 2.5.4
- Log4j 2.26.0 (`log4j-api`, `log4j-core`)
