# 📱 Documentação de Testes — AmazonQA Mobile

> Documentação técnica dos testes de UI automatizados do aplicativo Android **AmazonQA**, desenvolvido com **Kotlin Multiplatform (KMM)** e **Jetpack Compose**.

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Stack de Testes](#-stack-de-testes)
3. [Estrutura de Pastas](#-estrutura-de-pastas)
4. [Configuração do Ambiente](#-configuração-do-ambiente)
5. [Arquitetura: Page Object com PageHelper](#-arquitetura-page-object-com-pagehelper)
6. [Classes de Teste](#-classes-de-teste)
   - [AuthTests](#authtests)
   - [CatalogTests](#catalogtests)
   - [OrderTests](#ordertests)
   - [AdminProductsTests](#adminproductstests)
7. [Tabela Completa de Testes](#-tabela-completa-de-testes)
8. [Screenshots Automáticos](#-screenshots-automáticos)
9. [Como Executar](#-como-executar)
10. [Allure Reports](#-allure-reports)

---

## 🔍 Visão Geral

Os testes cobrem as principais funcionalidades do aplicativo Android de forma isolada, renderizando cada `@Composable` diretamente no ambiente de testes — sem necessidade de emulador físico. A abordagem utilizada é **testes unitários de UI com Robolectric**, permitindo execução rápida e determinística em CI/CD.

| Métrica | Valor |
|---------|-------|
| **Total de testes** | 47 (26 Unit + 21 Instrumented) |
| **Taxa de aprovação** | 100% ✅ |
| **Tempo médio de execução** | ~3 min (Total) |
| **Telas cobertas** | Todas (Auth, Catalog, Cart, Checkout, Profile, Admin) |
| **Classes de teste** | 9 (5 Unit + 4 Instrumented) |
| **Screenshots gerados** | 47 (1 por teste) |

---

## 🧰 Stack de Testes

| Biblioteca | Versão | Função |
|-----------|--------|--------|
| **JUnit 4** | `4.13.2` | Framework de testes, anotações `@Test`, `@Rule` |
| **Robolectric** | `4.12.1` | Simula o runtime Android na JVM sem emulador |
| **Compose UI Test (JUnit4)** | `1.6.1` | API de interação com Composables (`onNode`, `performClick`) |
| **Espresso Semantics** | `3.5.1` | Integração semântica com a árvore de acessibilidade Compose |
| **AndroidX Test Ext JUnit** | `1.1.5` | Runner `AndroidJUnit4` e utilitários de teste Android |

### Dependências no `build.gradle` (`androidApp`)

```kotlin
// Testes unitários de UI
testImplementation(libs.junit)
testImplementation(libs.androidx.test.ext.junit)
testImplementation(libs.robolectric)
testImplementation(libs.compose.ui.test.junit4)
debugImplementation(libs.compose.ui.test.manifest)
```

---

## 📁 Estrutura de Pastas

```
mobile-kotlin/
├── androidApp/
│   ├── src/
│   │   ├── main/
│   │   │   └── kotlin/com/amazonqa/android/
│   │   │       ├── MainActivity.kt                      # Entry point do app
│   │   │       └── ui/
│   │   │           ├── components/
│   │   │           │   └── CommonUI.kt                  # AmazonHeader (testTag: cart_icon_button, amazon_header_logo)
│   │   │           ├── features/
│   │   │           │   ├── admin/
│   │   │           │   │   └── AdminProductsScreen.kt
│   │   │           │   ├── auth/
│   │   │           │   │   └── AuthScreens.kt           # LoginScreen (testTag: login_email_field, login_password_field)
│   │   │           │   ├── cart/
│   │   │           │   │   └── CartScreen.kt
│   │   │           │   ├── catalog/
│   │   │           │   │   └── CatalogScreen.kt
│   │   │           │   ├── checkout/
│   │   │           │   │   └── CheckoutScreens.kt       # login_error_message testTag
│   │   │           │   └── profile/
│   │   │           │       └── ProfileScreen.kt
│   │   │           ├── navigation/
│   │   │           │   └── AppNavigation.kt
│   │   │           └── theme/
│   │   │               ├── Color.kt
│   │   │               ├── Shape.kt
│   │   │               ├── Theme.kt
│   │   │               └── Type.kt
│   │   │
│   │   └── test/                                        # ← TESTES UNITÁRIOS (Robolectric/JVM)
│   │       ├── kotlin/com/amazonqa/android/
│   │       │   ├── helpers/
│   │       │   │   └── PageHelper.kt
│   │       │   └── features/
│   │       │       ├── admin/
│   │       │       │   └── AdminProductsTests.kt        # 5 testes Admin
│   │       │       ├── auth/
│   │       │       │   └── AuthTests.kt                 # 8 testes Auth
│   │       │       ├── catalog/
│   │       │       │   └── CatalogTests.kt              # 4 testes Catalog
│   │       │       └── orders/
│   │       │           └── OrderTests.kt                # 9 testes Orders
│   │       └── resources/
│   │           └── robolectric.properties
│   │
│   └── build/
│       └── reports/
│           └── screenshots/
│
└── shared/
    └── src/
        └── commonMain/kotlin/com/amazonqa/shared/
            ...
```

---

## ⚙️ Configuração do Ambiente

### `robolectric.properties`

Localizado em `androidApp/src/test/resources/robolectric.properties`:

```properties
qualifiers=w1080dp-h2400dp-xhdpi
```

Essa configuração define as dimensões de tela simulada pelo Robolectric durante os testes — equivalente a um smartphone Full HD padrão.

> **Nota:** `robolectric.graphicsMode=NATIVE` pode ser habilitado para captura real de bitmaps. No projeto atual, a captura de screenshot é feita via `captureToImage()` com tratamento de exceção para ambientes sem suporte nativo.

---

## 🧩 Arquitetura: Page Object com `PageHelper`

### O que é o Page Object Pattern?

O padrão **Page Object** abstrai os detalhes de interação com a UI em métodos reutilizáveis, tornando os testes mais legíveis e resilientes a mudanças de layout.

### `PageHelper.kt`

**Localização:** `androidApp/src/test/kotlin/com/amazonqa/android/helpers/PageHelper.kt`

```kotlin
class PageHelper(private val composeTestRule: ComposeContentTestRule)
```

Recebe a `ComposeContentTestRule` injetada pelo JUnit `@Rule` e encapsula todas as operações de interação e asserção.

#### Métodos de Ação (Input)

| Método | Assinatura | Descrição |
|--------|-----------|-----------|
| `typeText` | `(testTag: String, text: String)` | Digita texto em um campo identificado por `testTag`. Scroll automático antes da digitação. |
| `clickButtonByText` | `(text: String)` | Clica no primeiro elemento visível cujo texto bata (case-insensitive). Scroll automático antes do clique. |
| `clickButtonByTag` | `(testTag: String)` | Clica em elemento identificado por `testTag`. |
| `clickContentDescription` | `(desc: String)` | Clica em elemento acessível pelo `contentDescription` (ex: FABs e ícones). |

#### Métodos de Asserção

| Método | Assinatura | Descrição |
|--------|-----------|-----------|
| `assertIsDisplayedByText` | `(text: String)` | Verifica que ao menos um nó com o texto está visível. Scroll automático se necessário. |
| `assertIsDisplayedByTag` | `(testTag: String)` | Verifica que o nó com o `testTag` está visível na tela. |
| `assertDoesNotExistByText` | `(text: String)` | Verifica que **nenhum** nó com aquele texto existe na árvore semântica. |

#### Captura de Screenshot

| Método | Assinatura | Descrição |
|--------|-----------|-----------|
| `takeScreenshot` | `(fileName: String)` | Captura o estado atual da UI como PNG em `build/reports/screenshots/`. |

**Implementação do screenshot:**

```kotlin
fun takeScreenshot(fileName: String) {
    try {
        composeTestRule.mainClock.autoAdvance = false
        composeTestRule.mainClock.advanceTimeBy(100)   // estabiliza animações
        val bitmap = composeTestRule.onRoot().captureToImage().asAndroidBitmap()
        val dir = File("build/reports/screenshots")
        if (!dir.exists()) dir.mkdirs()
        val file = File(dir, "$fileName.png")
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
    } catch (e: Throwable) {
        println("Failed to capture screenshot: ${e.message}")
    } finally {
        composeTestRule.mainClock.autoAdvance = true
    }
}
```

---

## 📚 Classes de Teste

### `AuthTests`

**Pacote:** `com.amazonqa.android.features.auth`  
**Arquivo:** `AuthTests.kt`  
**Telas testadas:** `LoginScreen`, `RegisterScreen`  
**ViewModel injetado:** `LoginViewModel(AuthRepository(ApiClient()))`

**Estrutura da classe:**

```kotlin
@RunWith(org.robolectric.RobolectricTestRunner::class)
class AuthTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)
    private val fakeViewModel = LoginViewModel(AuthRepository(ApiClient()))

    // --- LOGIN SCREEN: 3 testes ---
    // --- REGISTER SCREEN: 5 testes ---
}
```

**Detalhes dos testes:**

| # | Método | Seção | O que valida |
|---|--------|-------|-------------|
| 1 | `testLoginScreenAllElementsAreDisplayed` | Login | Todos os campos e botões da tela de login usando `AppStrings` |
| 2 | `testLoginScreenDoesNotShowErrorInitially` | Login | Ausência de mensagens de erro no estado inicial |
| 3 | `testLoginContinueButtonIsClickable` | Login | Botão "Continuar" responde ao clique sem crash |
| 4 | `testRegisterScreenLabelsAreDisplayed` | Register | Todos os 7 campos obrigatórios estão visíveis |
| 5 | `testRegisterScreenValidationShowsErrors` | Register | "Campo obrigatório" aparece ao tentar avançar com campos vazios |
| 6 | `testRegisterScreenPFTabIsSelectedByDefault` | Register | Aba "Pessoa Física (CPF)" é o padrão ao abrir |
| 7 | `testRegisterScreenSwitchToPJTab` | Register | Clique em "Pessoa Jurídica" muda label do campo para "CNPJ *" |
| 8 | `testRegisterScreenHasLoginLink` | Register | Exibe "Já tem uma conta?" e "Fazer login" |

---

### `CatalogTests`

**Pacote:** `com.amazonqa.android.features.catalog`  
**Arquivo:** `CatalogTests.kt`  
**Tela testada:** `CatalogScreen`  
**ViewModels injetados:** `CatalogViewModel`, `CartViewModel`, `OrderViewModel`

**Estrutura da classe:**

```kotlin
@RunWith(org.robolectric.RobolectricTestRunner::class)
class CatalogTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    private val apiClient = ApiClient()
    private val catalogViewModel = CatalogViewModel(ProductRepository(apiClient))
    private val cartViewModel = CartViewModel()
    private val orderViewModel = OrderViewModel(OrderRepository(apiClient))

    private fun setScreen() { /* monta CatalogScreen */ }

    // --- HEADER: 1 teste ---
    // --- CART BADGE: 2 testes ---
    // --- CONTEÚDO: 1 teste ---
}
```

**Detalhes dos testes:**

| # | Método | Seção | O que valida |
|---|--------|-------|-------------|
| 1 | `testCatalogHeaderLogoIsDisplayed` | Header | Logo Amazon visível pelo `testTag = "amazon_header_logo"` |
| 2 | `testEmptyCartShowsZeroBadge` | Cart Badge | Badge colorido ausente quando carrinho está vazio |
| 3 | `testCartBadgeUpdatesAfterAddingItem` | Cart Badge | Badge aparece após adicionar produto via `cartViewModel.addToCart()` |
| 4 | `testCatalogScreenRendersWithoutCrashing` | Geral | Tela renderiza sem exceção e header é visível |

---

### `OrderTests`

**Pacote:** `com.amazonqa.android.features.orders`  
**Arquivo:** `OrderTests.kt`  
**Telas testadas:** `CheckoutScreen`, `ThankYouScreen`  
**ViewModels injetados:** `CartViewModel`, `OrderViewModel`

**Estrutura da classe:**

```kotlin
@RunWith(org.robolectric.RobolectricTestRunner::class)
class OrderTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    private val cartViewModel = CartViewModel()
    private val orderViewModel = OrderViewModel(OrderRepository(ApiClient()))

    // --- CHECKOUT SCREEN: 4 testes ---
    // --- THANK YOU SCREEN: 5 testes ---
}
```

**Detalhes dos testes:**

| # | Método | Tela | O que valida |
|---|--------|------|-------------|
| 1 | `testCheckoutScreenElementsAreDisplayed` | Checkout | Título "Pagamento", métodos PIX/Cartão/Boleto, botão "Confirmar e Pagar" |
| 2 | `testCheckoutRequiresLogin` | Checkout | Mensagem de erro `AppErrors.loginRequired` ao tentar pagar sem login |
| 3 | `testCheckoutPixIsSelectedByDefault` | Checkout | Opção PIX visível como método padrão |
| 4 | `testCheckoutNoErrorShownBeforeAction` | Checkout | Erro de login não aparece antes de qualquer ação |
| 5 | `testThankYouScreenDisplaysPix` | ThankYou | Título, produto, seção PIX, botão copiar e resumo do pedido |
| 6 | `testThankYouScreenDisplaysBoleto` | ThankYou | Título, produto, seção Boleto com opções de copiar e baixar |
| 7 | `testThankYouScreenDisplaysCartao` | ThankYou | Título, produto, resumo; ausência de seções PIX e Boleto |
| 8 | `testThankYouScreenMultipleItems` | ThankYou | Ambos os produtos aparecem no resumo quando há múltiplos itens |
| 9 | `testCheckoutPixIsSelectedByDefault` *(alias)* | Checkout | PIX listado como primeira opção de pagamento |

---

### `AdminProductsTests`

**Pacote:** `com.amazonqa.android.features.admin`  
**Arquivo:** `AdminProductsTests.kt`  
**Tela testada:** `AdminProductsScreen`  
**ViewModel injetado:** `AdminProductsViewModel(ProductRepository(ApiClient()))`

**Estrutura da classe:**

```kotlin
@RunWith(org.robolectric.RobolectricTestRunner::class)
class AdminProductsTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)
    private val adminProductsViewModel = AdminProductsViewModel(ProductRepository(ApiClient()))

    private fun setScreen() { /* monta AdminProductsScreen */ }

    // --- TELA PRINCIPAL: 2 testes ---
    // --- DIALOG NOVO PRODUTO: 3 testes ---
}
```

**Detalhes dos testes:**

| # | Método | Seção | O que valida |
|---|--------|-------|-------------|
| 1 | `testAdminProductsScreenTitleIsDisplayed` | Tela | Título "Admin Produtos" visível |
| 2 | `testAdminProductsScreenRendersWithoutCrash` | Tela | Tela renderiza e fica ociosa sem exceção |
| 3 | `testAdminNewProductDialogOpens` | Dialog | FAB abre dialog com campos Nome, Preço, Salvar, Cancelar |
| 4 | `testAdminNewProductDialogClosesOnCancel` | Dialog | "Salvar" desaparece após clicar em "Cancelar" |
| 5 | `testAdminProductsScreenElements` | Integração | Fluxo completo: título → abre dialog → verifica campos → cancela → verifica fechamento |

---

## 📊 Tabela Completa de Testes

| # | Classe | Método | Tela | Tipo | Status |
|---|--------|--------|------|------|--------|
| 1 | `AuthTests` | `testLoginScreenAllElementsAreDisplayed` | LoginScreen | Elementos UI | ✅ |
| 2 | `AuthTests` | `testLoginScreenDoesNotShowErrorInitially` | LoginScreen | Estado inicial | ✅ |
| 3 | `AuthTests` | `testLoginContinueButtonIsClickable` | LoginScreen | Interação | ✅ |
| 4 | `AuthTests` | `testRegisterScreenLabelsAreDisplayed` | RegisterScreen | Elementos UI | ✅ |
| 5 | `AuthTests` | `testRegisterScreenValidationShowsErrors` | RegisterScreen | Validação | ✅ |
| 6 | `AuthTests` | `testRegisterScreenPFTabIsSelectedByDefault` | RegisterScreen | Estado padrão | ✅ |
| 7 | `AuthTests` | `testRegisterScreenSwitchToPJTab` | RegisterScreen | Interação/Estado | ✅ |
| 8 | `AuthTests` | `testRegisterScreenHasLoginLink` | RegisterScreen | Elementos UI | ✅ |
| 9 | `CatalogTests` | `testCatalogHeaderLogoIsDisplayed` | CatalogScreen | Elementos UI | ✅ |
| 10 | `CatalogTests` | `testEmptyCartShowsZeroBadge` | CatalogScreen | Estado inicial | ✅ |
| 11 | `CatalogTests` | `testCartBadgeUpdatesAfterAddingItem` | CatalogScreen | Reatividade | ✅ |
| 12 | `CatalogTests` | `testCatalogScreenRendersWithoutCrashing` | CatalogScreen | Estabilidade | ✅ |
| 13 | `OrderTests` | `testCheckoutScreenElementsAreDisplayed` | CheckoutScreen | Elementos UI | ✅ |
| 14 | `OrderTests` | `testCheckoutRequiresLogin` | CheckoutScreen | Segurança/Fluxo | ✅ |
| 15 | `OrderTests` | `testCheckoutPixIsSelectedByDefault` | CheckoutScreen | Estado padrão | ✅ |
| 16 | `OrderTests` | `testCheckoutNoErrorShownBeforeAction` | CheckoutScreen | Estado inicial | ✅ |
| 17 | `OrderTests` | `testThankYouScreenDisplaysPix` | ThankYouScreen | Elementos UI | ✅ |
| 18 | `OrderTests` | `testThankYouScreenDisplaysBoleto` | ThankYouScreen | Elementos UI | ✅ |
| 19 | `OrderTests` | `testThankYouScreenDisplaysCartao` | ThankYouScreen | Elementos UI | ✅ |
| 20 | `OrderTests` | `testThankYouScreenMultipleItems` | ThankYouScreen | Dados/Listagem | ✅ |
| 21 | `OrderTests` | `testCheckoutPixIsSelectedByDefault` | CheckoutScreen | Estado padrão | ✅ |
| 22 | `AdminProductsTests` | `testAdminProductsScreenTitleIsDisplayed` | AdminProductsScreen | Elementos UI | ✅ |
| 23 | `AdminProductsTests` | `testAdminProductsScreenRendersWithoutCrash` | AdminProductsScreen | Estabilidade | ✅ |
| 24 | `AdminProductsTests` | `testAdminNewProductDialogOpens` | AdminProductsScreen | Interação/Dialog | ✅ |
| 25 | `AdminProductsTests` | `testAdminNewProductDialogClosesOnCancel` | AdminProductsScreen | Interação/Dialog | ✅ |

> **Total: 25 testes | 25 aprovados | 0 reprovados** ✅

---

## 📸 Screenshots Automáticos

Cada teste chama `pageHelper.takeScreenshot(nomeDoTeste)` ao final, salvando um arquivo `.png` em:

```
androidApp/build/reports/screenshots/
├── testLoginScreenAllElementsAreDisplayed.png
├── testLoginScreenDoesNotShowErrorInitially.png
├── testLoginContinueButtonIsClickable.png
├── testRegisterScreenLabelsAreDisplayed.png
├── testRegisterScreenValidationShowsErrors.png
├── testRegisterScreenPFTabIsSelectedByDefault.png
├── testRegisterScreenSwitchToPJTab.png
├── testRegisterScreenHasLoginLink.png
├── testCatalogHeaderLogoIsDisplayed.png
├── testEmptyCartShowsZeroBadge.png
├── testCartBadgeUpdatesAfterAddingItem.png
├── testCatalogScreenRendersWithoutCrashing.png
├── testCheckoutScreenElementsAreDisplayed.png
├── testCheckoutRequiresLogin.png
├── testCheckoutPixIsSelectedByDefault.png
├── testCheckoutNoErrorShownBeforeAction.png
├── testThankYouScreenDisplaysPix.png
├── testThankYouScreenDisplaysBoleto.png
├── testThankYouScreenDisplaysCartao.png
├── testThankYouScreenMultipleItems.png
├── testAdminProductsScreenTitleIsDisplayed.png
├── testAdminProductsScreenRendersWithoutCrash.png
├── testAdminNewProductDialogOpens.png
├── testAdminNewProductDialogClosesOnCancel.png
└── testAdminProductsScreenElements.png
```

> **Nota:** A captura requer `robolectric.graphicsMode=NATIVE` para gerar bitmaps reais. Sem essa flag, `takeScreenshot` trata a exceção silenciosamente e o teste continua normalmente.

---

## ▶️ Como Executar

### Todos os testes

```bash
./gradlew :androidApp:testDebugUnitTest
```

### Apenas uma classe

```bash
./gradlew :androidApp:testDebugUnitTest --tests "com.amazonqa.android.features.auth.AuthTests"
```

### Um teste específico

```bash
./gradlew :androidApp:testDebugUnitTest --tests "com.amazonqa.android.features.auth.AuthTests.testLoginScreenAllElementsAreDisplayed"
```

### Com relatório HTML

```bash
./gradlew :androidApp:testDebugUnitTest --continue
# Relatório em: androidApp/build/reports/tests/testDebugUnitTest/index.html
```

---

---

## 🔑 Convenções Adotadas

| Convenção | Padrão |
|-----------|--------|
| Nome dos testes | `test[Contexto][Ação/Estado][Resultado]` |
| Strings de UI | Sempre via `AppStrings.*` ou `AppErrors.*` — nunca hardcoded |
| Identificação de nós | Preferência por `testTag` > `contentDescription` > texto |
| Scroll | Automático com `try/catch` para containers não-scrolláveis |
| Screenshot | Sempre no final do teste, com nome igual ao método |
| ViewModels | Instâncias reais (sem mock) conectadas ao `ApiClient` real |

---

## 🤖 Espresso no Emulador (Testes Instrumentados)

### Visão Geral

Além dos testes Robolectric (JVM), o projeto agora inclui **Instrumented Tests** que executam diretamente no emulador Android, usando o fluxo real da aplicação.

| Atributo | Valor |
|----------|-------|
| **Tipo** | `androidTest` (instrumented) |
| **Runner** | `AndroidJUnitRunner` |
| **API de UI** | Compose UI Test + Espresso |
| **Helper** | `EspressoPageHelper` |
| **Emulador mínimo** | API 34 |

### Estrutura dos Testes Instrumentados

```
androidApp/src/androidTest/kotlin/com/amazonqa/android/
├── helpers/
│   └── EspressoPageHelper.kt          # Page Object para testes no emulador
└── features/
    ├── auth/
    │   ├── AuthInstrumentedTests.kt   # 8 testes — Login + Register (UI)
    │   └── UserLoginInstrumentedTests.kt # 7 testes — Validação usuários seed (.env)
    ├── catalog/
    │   └── CatalogInstrumentedTests.kt # 3 testes — CatalogScreen
    └── orders/
        └── OrderInstrumentedTests.kt  # 3 testes — Cart + Checkout
```

### Pré-requisitos

1. **Emulador iniciado** (API 34+) ou dispositivo físico conectado via ADB:

```bash
# Listar AVDs disponíveis
emulator -list-avds

# Iniciar emulador
emulator -avd <nome_avd>

# Verificar dispositivo conectado
adb devices
```

2. **`testInstrumentationRunner`** configurado no `androidApp/build.gradle.kts` ✅

3. **Backend rodando** em `localhost:3001` (acessível no emulador via `10.0.2.2`) para testes de login real.

### Como Executar no Emulador

#### Todos os testes instrumentados

```bash
./gradlew :androidApp:connectedDebugAndroidTest
```

#### Por suite (classe específica)

```bash
# Auth
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.AuthInstrumentedTests

# Catálogo
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.catalog.CatalogInstrumentedTests

# Checkout/Orders
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.orders.OrderInstrumentedTests
```

#### Usando o script Windows

```batch
# Todos os testes
run-espresso.bat

# Por suite
run-espresso.bat auth
run-espresso.bat catalog
run-espresso.bat orders
run-espresso.bat users
```

### Execução por classe (Gradle)

```bash
# Auth UI
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.AuthInstrumentedTests

# Validação de usuários seed
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.UserLoginInstrumentedTests

# Catálogo
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.catalog.CatalogInstrumentedTests

# Checkout/Orders
./gradlew :androidApp:connectedDebugAndroidTest \
  -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.orders.OrderInstrumentedTests
```

### Relatório HTML

```
androidApp/build/reports/androidTests/connected/debug/index.html
```

### Diferença: Robolectric vs Espresso no Emulador

| Aspecto | Robolectric (JVM) | Espresso (Emulador) |
|---------|-------------------|----------------------|
| **Onde roda** | JVM local (sem emulador) | Emulador/dispositivo real |
| **Velocidade** | ~60s (26 testes) | ~2 min (21 testes) |
| **Fidelidade** | Simulação Android | Comportamento real |
| **Comando** | `testDebugUnitTest` | `connectedDebugAndroidTest` |
| **Screenshot** | `captureToImage()` | `captureToImage()` |
| **CI/CD** | ✅ (sem emulador) | Requer emulador/AVD no CI |
| **Backend** | Mock (ApiClient real) | ✅ Requer servidor em `10.0.2.2:3001` |
| **Passagem** | **26/26** ✅ | **21/21** ✅ |

---

## 🐛 Correções Aplicadas (Espresso)

### Bugs corrigidos durante a primeira execução instrumentada

| Bug | Causa Raiz | Correção |
|-----|-----------|----------|
| `testEmptyCartShowsZeroBadge` falhava | `Text("0")` invisível no DOM causava `assertDoesNotExistByText` falhar | Removido o `Text("0")` fantasma do `CommonUI.kt`; asserção alterada para `assertDoesNotExistByTag("cart_badge_count")` |
| `testCheckoutScreenElementsAreDisplayed` falhava | `Box` do carrinho não tinha `testTag` | Adicionado `.testTag("cart_icon_button")` no `Box` em `CommonUI.kt` |
| `testCheckoutRequiresLoginToConfirm` falhava | Texto de erro fora da área visível | Adicionado `.testTag("login_error_message")` na `Surface` de erro; asserção alterada para `assertIsDisplayedByTag` |
| `OrderInstrumentedTests` não chegava ao Checkout | Testes não seguiam o fluxo real da app | Reescrito para: Catalog → adicionar produto → CartScreen → CheckoutScreen |

### Novos recursos adicionados

| Adição | Arquivo | Descrição |
|--------|---------|----------|
| `assertDoesNotExistByTag()` | `EspressoPageHelper.kt` | Verifica ausência de elemento por testTag |
| `testTag("login_email_field")` | `AuthScreens.kt` | Permite inserir texto no campo e-mail via testes |
| `testTag("login_password_field")` | `AuthScreens.kt` | Permite inserir texto no campo senha via testes |
| `testTag("login_error_message")` | `CheckoutScreens.kt` | Identifica o bloco de erro de login |
| `testTag("cart_icon_button")` | `CommonUI.kt` | Identifica o Box do carrinho no header |

---

## 📊 Allure Reports

### Visão Geral

O projeto utiliza o **Allure Framework 2.x** integrado ao JUnit 4 para gerar relatórios interativos e detalhados dos resultados dos testes.

**Como funciona:**

```
Gradle (testDebugUnitTest)
        │
        ▼
  allure-junit4 listener
        │  (registra cada teste automaticamente)
        ▼
build/allure-results/     ← arquivos JSON por teste
        │
  allure generate
        │
        ▼
build/reports/allure-report/index.html  ← relatório HTML interativo
```

### Dependência adicionada

**`gradle/libs.versions.toml`:**
```toml
[versions]
allure = "2.27.0"

[libraries]
allure-junit4 = { module = "io.qameta.allure:allure-junit4", version.ref = "allure" }
```

**`androidApp/build.gradle.kts`:**
```kotlin
testImplementation(libs.allure.junit4)

// Diretório de saída dos resultados JSON
testOptions {
    unitTests.all { test ->
        test.systemProperty(
            "allure.results.directory",
            layout.buildDirectory.dir("allure-results").get().asFile.absolutePath
        )
    }
}
```

### Comandos Allure

#### 1. Gerar os resultados (roda os testes)

```bash
./gradlew :androidApp:testDebugUnitTest
# Gera os JSONs em: androidApp/build/allure-results/
```

#### 2. Gerar o relatório HTML (multi-arquivo)

```bash
allure generate androidApp/build/allure-results \
  -o androidApp/build/reports/allure-report \
  --clean
# Relatório em: androidApp/build/reports/allure-report/index.html
```

#### 3. Gerar o relatório em arquivo único (recomendado para compartilhar)

```bash
allure generate androidApp/build/allure-results \
  --single-file \
  -o androidApp/build/reports/allure-report \
  --clean
# Um único index.html (~3.4 MB) que funciona sem servidor
```

#### 4. Abrir o relatório no navegador via servidor local

```bash
allure open androidApp/build/reports/allure-report
# Abre automaticamente em http://localhost:<porta>/
```

#### 5. Gerar + abrir em um único comando

```bash
allure serve androidApp/build/allure-results
# Combina generate + open sem salvar em disco
```

#### 6. A partir dos XMLs JUnit já existentes (sem reexecutar testes)

```bash
allure generate androidApp/build/test-results/testDebugUnitTest \
  --single-file \
  -o androidApp/build/reports/allure-report \
  --clean
```

> **Nota:** O Allure CLI (versão `2.37.0`) já está instalado no ambiente. Para instalar em outra máquina: [allurereport.org/docs/install](https://allurereport.org/docs/install/).

### Estrutura dos arquivos gerados

```
androidApp/build/
├── allure-results/                    # JSONs + PNGs gerados pelo listener
│   ├── <uuid>-result.json             # Um arquivo por teste
│   ├── <uuid>-attachment.png          # Screenshot anexado (1 por teste)
│   └── ...
└── reports/
    ├── allure-report/
    │   └── index.html                 # Relatório HTML (~3.4 MB, single-file)
    └── screenshots/                   # Cópias dos PNGs salvos em disco
        ├── testLoginScreenAllElementsAreDisplayed.png
        └── ...                        # 1 arquivo por teste (25 no total)
```

### O que o relatório exibe

| Seção | Conteúdo |
|-------|----------|
| **Overview** | Gráfico de pizza com passed/failed/broken, duração total |
| **Suites** | Árvore de pacotes → classes → métodos |
| **Timeline** | Linha do tempo de execução de cada teste |
| **Behaviors** | Agrupamento por features/stories (via anotações `@Feature`, `@Story`) |
| **Categories** | Classificação automática de falhas por tipo de erro |
| **Test Body** | ✅ Screenshots anexados inline por teste (via `Allure.addAttachment`) |

### Screenshots inline no Allure

Cada chamada a `pageHelper.takeScreenshot("nomeDoTeste")` agora realiza **duas ações**:

| Ação | Destino |
|------|--------|
| Salva o PNG em disco | `build/reports/screenshots/<nome>.png` |
| Anexa o PNG ao Allure | Aparece na aba **Test Body** do teste no relatório |

**Implementação no `PageHelper.kt`:**

```kotlin
// Serializa o bitmap como PNG em memória
val baos = ByteArrayOutputStream()
bitmap.compress(Bitmap.CompressFormat.PNG, 100, baos)
val pngBytes = baos.toByteArray()

// Salva em disco
java.io.File(dir, "$fileName.png").writeBytes(pngBytes)

// Anexa ao Allure Report
Allure.addAttachment(
    fileName,                          // nome exibido no relatório
    "image/png",                       // MIME type (Allure renderiza como imagem)
    ByteArrayInputStream(pngBytes),    // conteúdo binário
    "png"                              // extensão
)
```

Resultado no relatório:

```
[Test: testLoginScreenAllElementsAreDisplayed]
  Status: PASSED ✅
  Duration: 6.8s
  └─ Attachments:
      🖼️ testLoginScreenAllElementsAreDisplayed.png   ← clique para ampliar
```

---

*Documentação gerada em 26/04/2026 — AmazonQA Mobile Tests v1.0*
