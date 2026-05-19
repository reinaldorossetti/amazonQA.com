# 🧪 Selenium UI E2E (`selenium-e2e`)

Testes de interface com **Selenium WebDriver**, **JUnit 5** e **Page Object Model**. O `pom.xml` compila com **Java 21** (`maven.compiler.release=21`) e integra **Allure Report**, **WebDriverManager**, **dotenv-java** e **Datafaker**.

**Índice:** [Java 23](#-introdução-ao-java-23) · [Recursos Java 17+](#-recursos-java-17--exemplos-no-código) · [Java 21/22/23](#-recursos-java-21-22-e-23-no-projeto) · [Features](#-visão-geral-das-features) · [Requisitos](#-requisitos) · [WebDriverManager](#-webdrivermanager) · [dotenv-java](#-dotenv-java) · [Datafaker](#-datafaker) · [Estrutura](#-estrutura-de-pastas) · [Configuração `.env`](#-configuração-env) · [Paralelismo](#-execução-paralela-junit) · [Executar testes](#-executar-todos-os-testes-global) · [GitHub Actions](#-esteira-github-actions) · [Allure](#-allure-report) · [Page Object](#-padrão-page-object) · [Referências](#-referências-do-projeto)

## ☕ Introdução ao Java 23

O **Java 23** (OpenJDK, setembro/2024) é a JVM recomendada para **executar** esta suite. Trás runtime atualizado, melhor desempenho em I/O (browser, HTTP) e suporte às bibliotecas atuais (Selenium 4.44, JUnit 5.11).

O código-fonte compila com **`maven.compiler.release=21`**. Para usar `release=23`, o **próprio processo Maven** precisa rodar em JDK 23 (não basta ter JDK 23 instalado se o `java`/`javac` efetivo for 21). Há **um recurso específico do Java 21** no código (`List.getFirst()`); Java 22 e 23 não têm APIs exclusivas no projeto.

```bash
java -version
# openjdk version "23.x" ...
```

> Compilação: **Java 21** (`release=21`). Execução recomendada: **JDK 23** (`java -version` deve apontar para 23 ao rodar os testes).

---

## 🚀 Recursos Java 17+ — exemplos no código

Os exemplos abaixo existem no repositório e são validados por `JavaModernFeaturesTest` (sem WebDriver).

### `record` — DTOs imutáveis

Arquivo: `config/BrowserName.java`, `support/TestDataGenerator.java`

```java
public record BrowserName(String value) {
  public static final BrowserName CHROME = new BrowserName("CHROME");
}

public record UserData(String firstName, String lastName, String email, String password) {}
```

### Switch expression — mapeamento de browser

Arquivo: `config/BrowserName.java`

```java
return switch (normalized) {
  case "CHROME" -> CHROME;
  case "FIREFOX", "FF" -> FIREFOX;
  case "EDGE", "MSEDGE" -> EDGE;
  default -> throw new IllegalArgumentException("Unsupported browser: " + raw);
};
```

### Text block + `formatted()` — payloads JSON da API

Arquivo: `support/JsonPayloads.java` (usado por `ApiClient` e `AuthSessionHelper`)

```java
public static String loginBody(String email, String password) {
  return """
      {"email":"%s","password":"%s"}
      """
      .formatted(escapeJson(email), escapeJson(password));
}
```

### `String.formatted()` — seletores CSS

Arquivo: `support/Selectors.java` (usado por `BasePage.byTestId`)

```java
public static By byTestId(String testId) {
  return By.cssSelector("[data-testid='%s']".formatted(testId));
}
```

### Pattern matching `instanceof` — cast seguro no WebDriver

Arquivo: `pages/BasePage.java`, `tests/AbstractUiTest.java`

```java
if (driver instanceof JavascriptExecutor javascriptExecutor) {
  javascriptExecutor.executeScript("arguments[0].click();", element);
}

if (driver instanceof TakesScreenshot takesScreenshot) {
  byte[] screenshot = takesScreenshot.getScreenshotAs(OutputType.BYTES);
}
```

### Switch com `->` — fluxo de cadastro

Arquivo: `pages/RegisterPageAction.java`

```java
switch (omitted) {
  case FIRST_NAME -> {
    fillField(LAST_NAME, userData.lastName());
    fillField(EMAIL, userData.email());
  }
  case EMAIL -> { /* ... */ }
}
```

### `HttpClient` + `Duration` — cliente REST nativo

Arquivo: `support/ApiClient.java`

```java
private static final HttpClient HTTP =
    HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .connectTimeout(Duration.ofSeconds(15))
        .build();
```

### Rodar só os exemplos de linguagem

```powershell
cd projects-tests/selenium-e2e
.\mvnw.cmd test -Dtest=JavaModernFeaturesTest
```

- **record** — Java 16/17: `BrowserName`, `TestDataGenerator.UserData`, `ApiClient.LoginResponse`
- **Switch expression** — Java 14/17: `BrowserName.fromSystemProperty`
- **Text blocks** — Java 15+: `JsonPayloads`
- **formatted()** — Java 15+: `Selectors`, `JsonPayloads`
- **Pattern matching** — Java 16+: `BasePage`, `AbstractUiTest`
- **HttpClient** — Java 11+: `ApiClient`

---

## ☕ Recursos Java 21, 22 e 23 no projeto

Resumo honesto do que o código **realmente usa** (não apenas o que o JDK suporta).

### Java 21 — em uso

Baseline de compilação: `maven.compiler.release=21` no `pom.xml`.

- **`List.getFirst()`** — API de **Sequenced Collections** (Java 21) em `CatalogPageAction.whenAddFirstProductToCart()`:

```java
wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(ADD_TO_CART_BUTTONS))
    .getFirst();
```

- **Demais construções modernas** (`record`, switch expression, text blocks, `formatted()`, pattern matching em `instanceof`/`catch`) compilam no release 21, mas são de releases anteriores (14–17) — ver seção [Recursos Java 17+](#-recursos-java-17--exemplos-no-código).

### Java 22 — não utilizado

Nenhuma API ou sintaxe exclusiva do Java 22 aparece no código, por exemplo:

- Unnamed variables (`_`)
- Stream Gatherers
- Foreign Function & Memory API

### Java 23 — runtime recomendado

- **JDK 23** é a JVM recomendada para **executar** os testes (local e CI GitHub Actions).
- **Compilação** usa `release=21` — o código não exige APIs exclusivas do Java 23.
- **Nenhum recurso exclusivo do Java 23** é usado no código-fonte.

### Resumo

- **Compila com:** Java 21 (`release=21`) — requer JDK ≥ 21 no processo Maven
- **Executa com:** Java 23 (recomendado)
- **API 21+ no código:** `getFirst()` em `CatalogPageAction`
- **API 22/23 no código:** nenhuma exclusiva hoje

---

## 🗂️ Visão geral das features

Cenários em `src/test/java/com/tester/web/e2e/tests/*FeatureTest.java`. Padrão: `given` / `when` / `thenValidated` nos Page Actions.

- 🔐 **Login** — `LoginFeatureTest`: login válido, credenciais inválidas, campos vazios
- 📝 **Register** — `RegisterFeatureTest`: cadastro PF, validações, e-mail duplicado
- 🌐 **Register + Language** — `RegisterLanguageFeatureTest`: cadastro, toggle PT/EN persistente
- 🛍️ **Catalog** — `CatalogFeatureTest`: listagem, busca, categoria, empty state, detalhes
- 📦 **Product Details** — `ProductDetailsFeatureTest`: dados do produto, add to cart, ID inválido
- 🛒 **Cart & Checkout** — `CartCheckoutFeatureTest`: checkout autenticado, quantidades, frete, thank-you
- 💳 **Payments** — `PaymentsCardBrandsFeatureTest`: bandeiras de cartão, detecção por BIN
- 🔁 **Real Purchase Flow** — `RealPurchaseFlowFeatureTest`: registro API → login → checkout real
- 🛡️ **Security** — `SecurityFeatureTest`: rotas protegidas, guest checkout, logout
- 👑 **Admin** — `AdminManagementFeatureTest`: admin lista/exclui produtos e usuários via API+UI
- 🎧 **Support Products** — `SupportProductsFeatureTest`: CRUD de produtos pelo perfil suporte

**Apoio:** `ApiClient` (REST), `AuthSessionHelper` (sessão no `localStorage`), Allure (screenshots).

---

## ✅ Requisitos

- **JDK** — **21+** para compilar (Maven usa o JDK do processo; `release=21`). **23** recomendado para executar os testes
- **Maven** — **4.0.0-rc-5** (obrigatório para `maven-compiler-plugin` 4.x). Use o **Maven Wrapper** (`mvnw` / `mvnw.cmd`) em `projects-tests/selenium-e2e/` — não precisa instalar Maven globalmente
- **Navegador** — Chrome, Firefox ou Edge instalados (drivers resolvidos via WebDriverManager)
- **Aplicação** — API (`server-ts`) em `http://127.0.0.1:3001` e SPA em `http://127.0.0.1:5174`
- **Seed** — `npm run seed` em `server-ts/` (admin, suporte, usuário normal)

> **Locale:** o `WebDriverFactory` força **pt-BR** nos browsers (Chrome/Edge/Firefox) para garantir textos em português.

### Instalar e configurar o Java 23

1. Instale um **JDK 23** (por exemplo [Eclipse Temurin](https://adoptium.net/) ou a distribuição da sua empresa).
2. Defina **`JAVA_HOME`** para a pasta raiz do JDK (não use apenas o JRE).
3. Confirme no terminal:

   ```bash
   java -version
   # esperado: versão 23.x

   echo %JAVA_HOME%
   REM Windows CMD

   echo $env:JAVA_HOME
   REM Windows PowerShell
   ```

4. Reinicie o terminal/IDE depois de alterar variáveis de ambiente.

---

## 🚗 WebDriverManager

O [WebDriverManager](https://bonigarcia.dev/webdrivermanager/) (Bonigarcia) baixa e sincroniza **ChromeDriver**, **GeckoDriver** e **EdgeDriver** com o browser instalado.

**No projeto:** `WebDriverFactory` chama `WebDriverManager.chromedriver().setup()` (e equivalentes) antes de criar o driver.

```java
WebDriverManager.chromedriver().setup();
return new ChromeDriver(chromeOptions());
```

- `-Dbrowser=chrome` — padrão: Chrome headless ou headed
- `-Dbrowser=firefox` — CI Firefox: usa `FIREFOX_BIN` quando definido
- `-Dheadless=true` — padrão no `pom.xml`: `--headless=new` (Chrome/Edge)

---

## 🔐 dotenv-java

O [dotenv-java](https://github.com/cdimascio/dotenv-java) carrega `projects-tests/selenium-e2e/.env` em `System.setProperty` no startup de `AbstractUiTest`.

**Chaves principais:** `BASE_URL`, `API_BASE_URL`, `LOGIN_*`, `E2E_ADMIN_*`, `E2E_SUPPORT_*`, `SEED_*`.

Valores entre aspas no `.env` são normalizados (`"senha@QA"` → `senha@QA`). O loader sobe diretórios a partir do CWD (IDE ou Maven).

---

## 🎲 Datafaker

O [Datafaker](https://www.datafaker.net/) gera massa de dados **pt-BR** em `TestDataGenerator`:

```java
private static final Faker FAKER = new Faker(new Locale("pt", "BR"));

public static UserData randomUser() { /* nome, e-mail, senha */ }
public static String validCpf() { /* CPF com dígitos verificadores */ }
```

Usado em `RegisterFeatureTest`, `RealPurchaseFlowFeatureTest`, `AdminManagementFeatureTest` e registro via `ApiClient`.

---

## 📁 Estrutura de pastas

```
projects-tests/selenium-e2e/
├── pom.xml
├── mvnw / mvnw.cmd           # Maven Wrapper
├── scripts/prepare_env.py    # provisiona JDK/truststore (cross-platform)
├── .mvn/wrapper/             # JAR + propriedades do wrapper
├── .env                          # credenciais locais (gitignored)
├── src/
│   ├── main/java/com/tester/web/e2e/
│   │   └── package-info.java
│   └── test/
│       ├── java/com/tester/web/e2e/
│       │   ├── config/      # Browser, WebDriver factory, propriedades de ambiente
│       │   ├── pages/       # Page Objects (BasePage, LoginPage, …)
│       │   ├── support/     # ApiClient, JsonPayloads, Selectors, TestDataGenerator, …
│       │   └── tests/       # Cenários (ex.: LoginFeatureTest)
│       └── resources/
│           └── junit-platform.properties  # auto-detection JUnit extensions (Allure)
└── target/                    # gerado pelo Maven (ignorado no Git)
    ├── allure-results/        # resultados crus após os testes
    └── site/allure-maven/     # relatório HTML após allure:report
allure-report/                 # relatório HTML gerado via Allure CLI (opcional)
```

A cache do relatório **Allure 3** usada pelo plugin pode aparecer também em `.allure/` (também ignorada no `.gitignore` deste módulo).

---

## ⚙️ Configuração (`.env`)

Arquivo em `projects-tests/selenium-e2e/.env` (não versionado). Alinhado ao seed de `server-ts/`:

```env
BASE_URL=http://127.0.0.1:5174
API_BASE_URL=http://127.0.0.1:3001/api

LOGIN_EMAIL=reinaldo.rossetti@outlook.com
LOGIN_PASSWORD=qualidade2026@QA

E2E_ADMIN_EMAIL=reiload@gmail.com
E2E_ADMIN_PASSWORD=rei2026@QA

E2E_SUPPORT_EMAIL=suporte@tester.com
E2E_SUPPORT_PASSWORD=suporte2026@QA
```

Antes dos testes:

```bash
cd server-ts && npm run seed && npm run dev
# em outro terminal:
cd projects-tests/selenium-e2e && ./mvnw clean test
```

---

## ⚡ Execução paralela (JUnit)

Configuração em `src/test/resources/junit-platform.properties`:

- `parallel.enabled` = `true` — ativa paralelismo
- `mode.classes.default` = `concurrent` — classes em paralelo
- `mode.default` = `concurrent` — métodos globais (UI usa `@Execution(SAME_THREAD)`)
- `config.strategy` = `fixed` — pool fixo
- `fixed.parallelism` = `4` — até 4 threads

`AbstractUiTest` usa `@Execution(SAME_THREAD)` — cada classe Selenium executa métodos em sequência (1 `WebDriver` por `@Test`).

Desabilitar para debug:

```powershell
.\mvnw.cmd test "-Djunit.jupiter.execution.parallel.enabled=false"
```

---

## ▶️ Executar todos os testes (“global”)

O Maven Wrapper fica em **`projects-tests/selenium-e2e/`**. Na raiz do repo `tester.com` use o caminho completo.

### Windows (recomendado)

**PowerShell** — na pasta do módulo:

```powershell
cd projects-tests/selenium-e2e
.\mvnw.cmd clean test
```

**CMD** — na pasta do módulo:

```bat
cd projects-tests\selenium-e2e
mvnw.cmd clean test
```

**Da raíz do repo** (PowerShell ou CMD), sem `cd`:

```bat
projects-tests\selenium-e2e\mvnw.cmd clean test
```

> No PowerShell use `.\mvnw.cmd` (com `.\`). Só `mvnw.cmd` pode não ser encontrado.

### Git Bash (MINGW64)

Na pasta do módulo:

```bash
cd projects-tests/selenium-e2e
./mvnw clean test
```

Da raiz do repo:

```bash
./projects-tests/selenium-e2e/mvnw clean test
```

### Linux / macOS

```bash
cd projects-tests/selenium-e2e
chmod +x mvnw
./mvnw clean test
```

### Maven instalado no sistema

```bash
mvn -f projects-tests/selenium-e2e/pom.xml clean test
```

### Problemas comuns no Windows

- `No such property: maven.mainClass` — causa: Maven Wrapper com Maven 4.0.0-beta-5 a rc-4 sem a propriedade de bootstrap. Solução: atualize o repo (`.mvn/jvm.config`, `mvnw` com `-Dmaven.mainClass=org.apache.maven.cling.MavenCling`, wrapper em **4.0.0-rc-5**) e rode de `projects-tests/selenium-e2e/` com `.\mvnw.cmd` ou `./mvnw`
- `No enum constant SourceVersion.RELEASE_23` — causa: `release=23` no `pom.xml`, mas o **Maven está rodando em JDK 21 ou 22** (`java -version`). Solução: use `release=21` (padrão do projeto) **ou** configure IDE/terminal para executar Maven com JDK 23
- `bash: ./mvnw: No such file or directory` — causa: comando na **raiz** do repo. Solução: `cd projects-tests/selenium-e2e`
- `mvnw.cmd: command not found` (Git Bash) — causa: sem caminho completo. Solução: `./projects-tests/selenium-e2e/mvnw.cmd clean test`
- `JAVA_HOME is set to an invalid directory` — causa: `JAVA_HOME` com pasta que não existe. Solução: corrija o `JAVA_HOME` para apontar para um JDK 23 válido
- `PKIX path building failed` ao baixar do Maven Central — causa: certificado corporativo/SSL no Java truststore. Solução: importe o certificado da empresa no truststore do Java usado pelo Maven e/ou configure `~/.m2/settings.xml` corporativo

### TLS/PKIX sem permissão de administrador (Windows/Linux)

Se você não consegue alterar o `cacerts` global, use o truststore local do projeto via script Python:

```bat
cd projects-tests\selenium-e2e
mvnw.cmd clean test -Dbrowser=firefox -Dheadless=true "-Dbase.url=http://127.0.0.1:5174"
```

Esse comando:
1. Provisiona JDK 23 (script Python);
2. Gera `.certs/maven-truststore.p12` com certificados do Windows;
3. Define `MAVEN_OPTS` com `javax.net.ssl.trustStore` para o Maven Wrapper.

### Propriedades úteis (linha de comando / CI)

- `browser` — exemplo: `-Dbrowser=chrome`. Descrição: `chrome`, `firefox` (ou `ff`), `edge` (ou `msedge`)
- `headless` — exemplo: `-Dheadless=true`. Descrição: `true`/`false`
- `base.url` — exemplo: `-Dbase.url=http://127.0.0.1:5174`. Descrição: URL da SPA
- `login.email` / `login.password` — exemplo: `-Dlogin.email=u@mail.com -Dlogin.password='Secret1!'`. Descrição: necessários para o teste feliz de login (`@EnabledIf`)

Exemplo combinado:

```bash
cd projects-tests/selenium-e2e
./mvnw clean test -Dbrowser=firefox -Dheadless=true "-Dbase.url=http://127.0.0.1:5174"
```

Windows (PowerShell):

```powershell
cd projects-tests/selenium-e2e
.\mvnw.cmd clean test -Dbrowser=firefox -Dheadless=true "-Dbase.url=http://127.0.0.1:5174"
```

---

## 🎯 Executar por feature (classe ou método)

```powershell
cd projects-tests/selenium-e2e
.\mvnw.cmd test -Dtest=CartCheckoutFeatureTest
.\mvnw.cmd test -Dtest=SupportProductsFeatureTest
.\mvnw.cmd test -Dtest=LoginFeatureTest#successfulLoginRedirectsToAccountArea
```

> O filtro `-Dtest=…` usa a convenção do **Maven Surefire** sobre o nome simples da classe (sem pacote).

---

Em caso de erro de certificado:
````
Importe o certificado raiz/intermediário da sua empresa no cacerts desse Java:

mvn compile -Daether.connector.https.securityMode=insecure
````

---

## 🔄 Esteira GitHub Actions

Workflow: [`.github/workflows/selenium-e2e-pipeline.yml`](../../.github/workflows/selenium-e2e-pipeline.yml)

### Quando roda

Dispara em **push** e **pull request** para `main`, quando há alterações em:

- `projects-tests/selenium-e2e/**`
- `web/**`
- `server-ts/**`
- `docker-compose.yml`
- o próprio workflow

### Jobs (paralelos)

- `selenium-e2e-chrome` — Chrome headless, timeout 45 min
- `selenium-e2e-firefox` — Firefox headless + geckodriver, timeout 45 min

### Fluxo de cada job

```mermaid
flowchart TD
  A[checkout] --> B[setup Node 22 + Java 23]
  B --> C[setup browser + driver]
  C --> D[npm install em web/]
  D --> E[docker compose up -d --build]
  E --> F[wait-on API :3001 e SPA :5174]
  F --> G[mvnw clean test headless]
  G --> H[allure generate]
  H --> I[copia p/ tests-dashboard/reports]
  I --> J[publica gh-pages se push main]
  J --> K[docker compose down]
```

1. **Checkout** do repositório.
2. **Setup:** Node.js 22 (cache npm em `web/`), Java 23 Temurin (cache Maven).
3. **Browser:** Chrome via `browser-actions/setup-chrome@v1`; Firefox via `setup-firefox@v1` + `setup-geckodriver@latest` (token `GITHUB_TOKEN`).
4. **Stack:** `docker compose up -d --build` (API + web + banco).
5. **Readiness:** `wait-on` em `http://127.0.0.1:3001/api/products` e `http://127.0.0.1:5174`.
6. **Testes:** `./mvnw clean test` em `projects-tests/selenium-e2e` (`continue-on-error: true`).
7. **Allure:** CLI 2.34.0 → gera `allure-report/`.
8. **Cópia:** relatório para `tests-dashboard/reports/selenium-allure-report-chrome|firefox/`.
9. **Publish:** em push na `main`, publica no branch `gh-pages` (`peaceiris/actions-gh-pages@v4`).
10. **Teardown:** `docker compose down` (sempre, via `if: always()`).

### Variáveis e secrets na CI

- `SELENIUM_LOGIN_EMAIL` — GitHub Secret — login nos testes autenticados
- `SELENIUM_LOGIN_PASSWORD` — GitHub Secret — senha do usuário de teste
- `GITHUB_TOKEN` — Actions (automático) — geckodriver + publish gh-pages
- `browser` — env do job — `chrome` ou `firefox`
- `headless` — env do job — `"true"`
- `BASE_URL` — env do job — `http://127.0.0.1:5174`
- `FIREFOX_BIN` — output do setup-firefox — caminho do Firefox (job Firefox)

Comando equivalente ao da esteira (Chrome):

```bash
cd projects-tests/selenium-e2e
./mvnw clean test \
  -Dbrowser=chrome \
  -Dheadless=true \
  -Dbase.url=http://127.0.0.1:5174 \
  -Dlogin.email="$LOGIN_EMAIL" \
  -Dlogin.password="$LOGIN_PASSWORD"
```

### Relatórios publicados

- Repo (cópia local no workspace) — `tests-dashboard/reports/selenium-allure-report-chrome/`
- Repo (cópia local no workspace) — `tests-dashboard/reports/selenium-allure-report-firefox/`
- GitHub Pages (`gh-pages`) — `tests-dashboard/reports/selenium-allure-report-chrome/`
- GitHub Pages (`gh-pages`) — `tests-dashboard/reports/selenium-allure-report-firefox/`

> Os testes usam `continue-on-error: true` — a pipeline gera relatório Allure mesmo com falhas. Verifique o status do job no GitHub Actions.

---

## 📊 Allure Report

Relatório online: [https://reinaldorossetti.github.io/amazonQA.com/tests-dashboard/reports/selenium-allure-report-chrome/](https://reinaldorossetti.github.io/amazonQA.com/tests-dashboard/reports/selenium-allure-report-chrome/)

1. Rode os testes para gerar `allure-results/`:

   ```powershell
   cd projects-tests/selenium-e2e
   .\mvnw.cmd clean test
   ```

2. **Gerar HTML estático**

   ```bash
   ./mvnw allure:report
   ```

   Windows: `.\mvnw.cmd allure:report`

   Abra o arquivo gerado pelo plugin Allure Maven (tipicamente):

   `target/site/allure-maven/index.html`

3. **Servir o relatório localmente** (abre no navegador)

   ```bash
   ./mvnw allure:serve
   ```

   Windows: `.\mvnw.cmd allure:serve`

4. **Allure CLI (opção direta, fora do Maven)**

    Gere o relatório e suba um servidor local:

    ```bash
    allure generate allure-results -o allure-report --clean
    allure open allure-report
    ```

    O servidor informa a URL local (ex.: `http://127.0.0.1:58xxx`).

> **Screenshots:** o projeto anexa imagens automaticamente **antes de cada teste** e ao final de validações de login (`validatedLoginPage` e `validatedLoginInPage`). Essas imagens aparecem no Allure.

O plugin **Allure Maven 3.x** usa por defeito o **runtime Allure 3** (Node empacregado pela cache sob `.allure/`). Para fixar uma versão concreta do CLI de relatório, consulte [Allure Maven](https://github.com/allure-framework/allure-maven) (`reportVersion`, etc.).

---

## 🌐 Ligação ao front-end do monorepo

Os seletores e fluxos espelham a app em **`web/`** e o exemplo Playwright em **`web/e2e`** (mesmos `data-testid`, rota `/login`, redirecionamento para `/minha-conta`). Garanta que o servidor de desenvolvimento da web está no ar na `base.url` configurada antes de executar os testes.

---

## 🧩 Padrão Page Object

Fluxo: `*FeatureTest` → `*PageAction` → `*PageElements` → `BasePage`

- **FeatureTest** — Cenário de negócio (`given` / `when` / `thenValidated`). Exemplo: `SupportProductsFeatureTest`
- **PageAction** — Clicks, waits, validações, screenshots. Exemplo: `CartCheckoutPageAction`
- **PageElements** — Seletores estáveis (`id`, `data-testid`). Exemplo: `LoginPageElements`
- **BasePage** — Toast, focus, `assertTextsVisible`. Exemplo: `BasePage`

Exemplo compacto (sem linhas vazias entre passos):

```java
void supportShouldOpenCreateProductModal() {
  supportProducts.whenOpenNewProductModal();
  supportProducts.thenValidatedCreateProductDialogVisible();
}
```

Skill do repositório: `.cursor/skills/selenium-e2e-tests/SKILL.md`

---

## Mapeamento de fluxo (Login)

**Fluxo principal:**

`LoginFeatureTest.java` ➜ `LoginPageAction.java` ➜ `LoginPageElements.java` ➜ `BasePage.java`

### O papel de cada classe

- **`LoginFeatureTest`**: testes de alto nível (cenários). Orquestra as ações e validações do login, deve ter somente a lógica do teste, sem click e select.
- **`LoginPageAction`**: implementa as ações e validações do fluxo de login (ex.: preencher campos, enviar, validar telas). Aqui vai fazer as ações de click, select entre outras.
- **`LoginPageElements`**: guarda os elementos e seletores da tela de login (Page Elements).
- **`BasePage`**: utilitários comuns para páginas (esperas, asserts de texto, helpers de Selenium e screenshots).

---

## 📚 Referências do projeto

Bibliotecas, plugins e documentação oficial usados em `projects-tests/selenium-e2e`.

### Stack principal

- **Java (JDK)** — 21 release / 23 target — Linguagem e runtime — [Adoptium](https://adoptium.net/) · [Java docs](https://docs.oracle.com/en/java/)
- **Selenium Java** — 4.44.0 — Automação WebDriver (Chrome, Firefox, Edge) — [selenium.dev](https://www.selenium.dev/documentation/) · [Maven Central](https://central.sonatype.com/artifact/org.seleniumhq.selenium/selenium-java)
- **JUnit Jupiter** — 5.11.4 — Runner, parametrização, paralelismo, assumptions — [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- **Maven Surefire** — 3.5.5 — Execução dos testes no build — [Surefire Plugin](https://maven.apache.org/surefire/maven-surefire-plugin/)
- **Maven Compiler Plugin** — 4.0.0-beta-4 — Compilação Java 21 (`release=21`; `release=23` exige Maven rodando em JDK 23) — [Compiler Plugin](https://maven.apache.org/plugins/maven-compiler-plugin/)
- **Apache Maven** — 4.0.0-rc-5 — Versão fixada no Maven Wrapper (`.mvn/wrapper/maven-wrapper.properties`)
- **Maven Wrapper** — 3.3.4 — Build reproduzível sem Maven global — [Maven Wrapper](https://maven.apache.org/wrapper/)

### Automação e dados

- **WebDriverManager** — 6.3.4 — Download/sync automático de ChromeDriver, GeckoDriver, EdgeDriver — [bonigarcia.dev/wdm](https://bonigarcia.dev/webdrivermanager/) · [GitHub](https://github.com/bonigarcia/webdrivermanager)
- **Datafaker** — 2.5.4 — Massa de dados pt-BR (`TestDataGenerator`) — [datafaker.net](https://www.datafaker.net/) · [GitHub](https://github.com/datafaker-net/datafaker)
- **dotenv-java** — 3.2.0 — Carrega `.env` do módulo (`EnvFileLoader`) — [GitHub](https://github.com/cdimascio/dotenv-java)

### Relatórios

- **Allure JUnit 5** — 2.34.0 — `@Epic`, `@Feature`, screenshots, steps — [docs.qameta.io/allure](https://docs.qameta.io/allure/)
- **Allure Maven Plugin** — 3.0.1 — `allure:report` / `allure:serve` local — [allure-maven](https://github.com/allure-framework/allure-maven)
- **Allure CLI** — 2.34.0 — Geração de HTML na CI — [Allure Report](https://github.com/allure-framework/allure2)
- **AspectJ Weaver** — 1.9.25.1 — Integração `@Step` com Surefire — [Eclipse AspectJ](https://www.eclipse.org/aspectj/)

### Monorepo (espelhado nos testes)

- **SPA React** — `web/` — Front-end testado (rotas, `id`, `data-testid`)
- **API REST** — `server-ts/` — Seed users, login, CRUD via `ApiClient`
- **Specs Playwright** — `web/e2e/` — Cenários de referência para paridade Selenium
- **Docker Compose** — `docker-compose.yml` — Stack local e CI (web + API + DB)

### Arquivos de configuração

- `pom.xml` — Dependências, Surefire, Allure, propriedades `-Dbrowser`, `-Dheadless`
- `.env` — Credenciais locais (`LOGIN_*`, `SEED_*`, `E2E_*`, `API_BASE_URL`)
- `src/test/resources/junit-platform.properties` — Paralelismo JUnit, autodetection Allure
- `.github/workflows/selenium-e2e-pipeline.yml` — Esteira CI (Chrome + Firefox)
