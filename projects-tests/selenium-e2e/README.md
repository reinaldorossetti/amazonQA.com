# Selenium UI E2E (`selenium-e2e`)

Testes de interface com **Selenium WebDriver**, **JUnit 5** e **Page Object**. O `pom.xml` fixa **Java 23** e integra **Allure Report** e **Datafaker** para massa de dados.

---

## Requisitos

| Item | Detalhe |
|------|---------|
| **JDK** | **23** (`maven.compiler.release=23`). |
| **Maven** | Opcional se usar o **Maven Wrapper** (`mvnw` / `mvnw.cmd`) |
| **Navegador** | Chrome, Firefox ou Edge instalados (drivers resolvidos via **WebDriverManager**) |
| **Aplicação** | Front-end acessível na URL base (padrão `http://localhost:5174`, como no Playwright do monorepo) |

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

## Ferramentas e versões principais

| Tecnologia | Versão no projeto |
|------------|-------------------|
| Java | **23** |
| Selenium Java | **4.28.1** |
| JUnit Jupiter | **5.11.4** |
| WebDriverManager | **5.9.3** |
| Allure JUnit 5 | **2.34.0** (BOM) |
| Allure Maven Plugin | **3.0.1** |
| AspectJ Weaver | **1.9.25.1** (Surefire / `@Step`) |
| Datafaker | **2.5.4** |

---

## Estrutura de pastas

```
selenium-e2e/
├── pom.xml
├── mvnw / mvnw.cmd           # Maven Wrapper
├── scripts/prepare_env.py    # provisiona JDK/truststore (cross-platform)
├── .mvn/wrapper/             # JAR + propriedades do wrapper
├── .gitignore
├── src/
│   ├── main/java/com/tester/web/e2e/
│   │   └── package-info.java
│   └── test/
│       ├── java/com/tester/web/e2e/
│       │   ├── config/      # Browser, WebDriver factory, propriedades de ambiente
│       │   ├── pages/       # Page Objects (BasePage, LoginPage, …)
│       │   ├── support/     # Dados esperados na UI, condições @EnabledIf, etc.
│       │   └── tests/       # Cenários (ex.: LoginFeatureTest)
│       └── resources/
│           └── junit-platform.properties  # auto-detection JUnit extensions (Allure)
└── target/                    # gerado pelo Maven (ignorado no Git)
    ├── allure-results/        # resultados crus após os testes
    └── site/allure-maven/     # relatório HTML após allure:report
```

A cache do relatório **Allure 3** usada pelo plugin pode aparecer também em `.allure/` (também ignorada no `.gitignore` deste módulo).

---

## Executar todos os testes (“global”)

O Maven Wrapper (`mvnw` / `mvnw.cmd`) fica **somente** em `selenium-e2e/`. Na raíz do repositório `tester.com` **não existe** `mvnw` — por isso `./mvnw` ou `mvnw.cmd` sem caminho falham.

### Windows (recomendado)

**PowerShell** — na pasta do módulo:

```powershell
cd selenium-e2e
.\mvnw.cmd clean test
```

**CMD** — na pasta do módulo:

```bat
cd selenium-e2e
mvnw.cmd clean test
```

**Da raíz do repo** (PowerShell ou CMD), sem `cd`:

```bat
selenium-e2e\mvnw.cmd clean test
```

> No PowerShell use `.\mvnw.cmd` (com `.\`). Só `mvnw.cmd` pode não ser encontrado.

### Git Bash (MINGW64)

Na pasta do módulo:

```bash
cd selenium-e2e
./mvnw clean test
```

Da raíz do repo:

```bash
./selenium-e2e/mvnw clean test
# ou
./selenium-e2e/mvnw.cmd clean test
```

### Linux / macOS

```bash
cd selenium-e2e
chmod +x mvnw    # apenas na primeira vez, se precisar
./mvnw clean test
```

### Maven instalado no sistema

```bash
mvn -f selenium-e2e/pom.xml clean test
```

### Problemas comuns no Windows

| Sintoma | Causa | Solução |
|---------|--------|---------|
| `bash: ./mvnw: No such file or directory` | Comando na **raíz** do repo | `cd selenium-e2e` ou use `selenium-e2e\mvnw.cmd` |
| `mvnw.cmd: command not found` (Git Bash) | Sem `cd` e sem `.\` / caminho | `./selenium-e2e/mvnw.cmd clean test` |
| `JAVA_HOME is set to an invalid directory` | `JAVA_HOME` com pasta que não existe | Corrija o `JAVA_HOME` para apontar para um JDK 23 válido |
| `PKIX path building failed` ao baixar do Maven Central | Certificado corporativo/SSL no Java truststore | Importe o certificado da empresa no truststore do Java usado pelo Maven e/ou configure `~/.m2/settings.xml` corporativo |

### TLS/PKIX sem permissão de administrador (Windows/Linux)

Se você não consegue alterar o `cacerts` global, use o truststore local do projeto via script Python:

```bat
cd selenium-e2e
mvnw.cmd clean test -Dbrowser=firefox -Dheadless=true "-Dbase.url=http://127.0.0.1:5174" "-Dlogin.email=teste@example.com" "-Dlogin.password=SenhaForte123"
```

Esse comando:
1. Provisiona JDK 23 (script Python);
2. Gera `.certs/maven-truststore.p12` com certificados do Windows;
3. Define `MAVEN_OPTS` com `javax.net.ssl.trustStore` para o Maven Wrapper.

### Propriedades úteis (linha de comando / CI)

| Propriedade | Exemplo | Descrição |
|-------------|---------|-----------|
| `browser` | `-Dbrowser=chrome` | `chrome`, `firefox` (ou `ff`), `edge` (ou `msedge`) |
| `headless` | `-Dheadless=true` | `true`/`false` |
| `base.url` | `-Dbase.url=http://localhost:5174` | URL da SPA |
| `login.email` / `login.password` | `-Dlogin.email=u@mail.com -Dlogin.password='Secret1!'` | Necessários para o teste feliz de login (`@EnabledIf`) |

Exemplo combinado:

```bash
# dentro de selenium-e2e/
./mvnw clean test -Dbrowser=firefox -Dheadless=true "-Dbase.url=http://127.0.0.1:5174" "-Dlogin.email=teste@example.com" "-Dlogin.password=SenhaForte123"
```

Windows (PowerShell, dentro de `selenium-e2e`):

```powershell
.\mvnw.cmd clean test -Dbrowser=firefox -Dheadless=true "-Dbase.url=http://127.0.0.1:5174" "-Dlogin.email=teste@example.com" "-Dlogin.password=SenhaForte123"
```

---

## Executar por feature (classe ou método)

### Toda a feature **Login**

```bash
cd selenium-e2e
./mvnw test -Dtest=LoginFeatureTest
```

Windows:

```powershell
cd selenium-e2e
.\mvnw.cmd test -Dtest=LoginFeatureTest
```

Ou da raíz do repo:

```bash
mvn -f selenium-e2e/pom.xml test -Dtest=LoginFeatureTest
```

### Um cenário específico (método de teste)

Use o formato `NomeDaClasse#nomeDoMetodo`:

```bash
./mvnw test -Dtest=LoginFeatureTest#invalidCredentialsShowErrorAlert
```

Windows:

```powershell
.\mvnw.cmd test -Dtest=LoginFeatureTest#invalidCredentialsShowErrorAlert
```

Outros métodos em `LoginFeatureTest`: `successfulLoginRedirectsToAccountArea`, `emptyFieldsShowValidationAlert`, `emptyPasswordShowsValidationAlert`.

> O filtro `-Dtest=…` usa a convenção do **Maven Surefire** sobre o nome simples da classe (sem pacote).

---

Em caso de erro de certificado:
````
Importe o certificado raiz/intermediário da sua empresa no cacerts desse Java:

mvn compile -Daether.connector.https.securityMode=insecure
````

## Allure Report

1. Rode os testes para gerar `target/allure-results/`:

   ```bash
   cd selenium-e2e && ./mvnw clean test
   ```

   Windows: `.\mvnw.cmd clean test`

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

O plugin **Allure Maven 3.x** usa por defeito o **runtime Allure 3** (Node empacregado pela cache sob `.allure/`). Para fixar uma versão concreta do CLI de relatório, consulte [Allure Maven](https://github.com/allure-framework/allure-maven) (`reportVersion`, etc.).

---

## Ligação ao front-end do monorepo

Os seletores e fluxos espelham a app em **`web/`** e o exemplo Playwright em **`web/e2e`** (mesmos `data-testid`, rota `/login`, redirecionamento para `/minha-conta`). Garanta que o servidor de desenvolvimento da web está no ar na `base.url` configurada antes de executar os testes.
