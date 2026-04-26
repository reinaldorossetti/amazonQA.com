# 📱 AmazonQA - Mobile Kotlin Multiplatform (KMM)

![Kotlin Multiplatform](https://img.shields.io/badge/Kotlin-2.2.0-blue?style=for-the-badge&logo=kotlin)
![Android SDK 34](https://img.shields.io/badge/Android-SDK%2034-green?style=for-the-badge&logo=android)
![Java 21](https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk)
![Compose Multiplatform](https://img.shields.io/badge/Compose-Multiplatform-orange?style=for-the-badge&logo=jetpackcompose)

Projeto mobile multiplataforma desenvolvido em **Kotlin Multiplatform (KMM)**, integrando o ecossistema AmazonQA. O aplicativo consome os endpoints REST do backend Next.js e segue os mais rigorosos padrões de **Clean Architecture**, **SOLID** e **Clean Code**.

---

## 🏗️ Arquitetura e Tech Stack

O projeto é dividido em três módulos principais:
- **`shared`**: Core do projeto contendo a lógica de negócio, modelos de domínio, repositórios de dados e clientes de rede (Ktor).
- **`androidApp`**: Camada nativa Android utilizando **Jetpack Compose** para a UI.

### Tecnologias Utilizadas
- **Linguagem:** Kotlin 2.2.0
- **UI:** Jetpack Compose (Android) com Material 3.
- **Rede:** Ktor Client (Content Negotiation, Logging, Serialization).
- **Injeção de Dependência:** Koin (Core & Android).
- **Assincronismo:** Kotlin Coroutines & Flow/StateFlow.
- **Serialização:** kotlinx.serialization (JSON).
- **Imagens:** Coil Compose (Carregamento assíncrono e cache).
- **Utilidades:** ZXing (Barcode/QR Code scanning).

---

## ✨ Funcionalidades Implementadas

- [x] **Autenticação Completa**: Login, Registro (com validação de campos) e Logout.
- [x] **Catálogo de Produtos**: Listagem dinâmica com carregamento de imagens via Bridge IP (`10.0.2.2`).
- [x] **Carrinho de Compras**: Adição/remoção de itens e persistência de estado.
- [x] **Gestão de Pedidos**: Fluxo de checkout e histórico de ordens.
- [x] **Segurança**: Armazenamento seguro de tokens JWT.
- [x] **Interface Premium**: Design baseado na Amazon com bordas quadradas (`RectangleShape`) e micro-animações.

---

## 🎨 Identidade Visual
Seguimos a paleta de cores oficial da Amazon para garantir uma experiência consistente:
- **Amazon Dark (#131921):** Header e elementos principais.
- **Amazon Orange (#FF9900):** Destaques e Call-to-Actions.
- **Amazon Yellow (#FFD814):** Botões de compra.
- **Amazon Blue (#007185):** Links e interações.

> [!IMPORTANT]
> Conforme requisitos de design, utilizamos **bordas quadradas (Square Edges)** em todos os inputs e botões para manter a robustez visual.

---

## 🗺️ Estrutura de Pastas

```text
mobile-kotlin/
├── androidApp/          # Código nativo Android (Jetpack Compose)
│   └── src/main/kotlin/com/amazonqa/android/ui/
│       ├── components/  # Componentes reutilizáveis (Botões, Cards, etc)
│       ├── features/    # Telas organizadas por funcionalidade (Auth, Cart, Catalog)
│       ├── navigation/  # Configuração de rotas e navegação entre telas
│       └── theme/       # Identidade visual (Cores, Tipografia, Formas)
├── shared/              # Código compartilhado (KMM)
│   ├── src/commonMain/  # Core compartilhado
│   │   ├── data/        # Repositórios e Network (Ktor)
│   │   ├── domain/      # Modelos de dados e lógica de negócio
│   │   ├── presentation/# ViewModels e State Management
│   │   └── util/        # Helpers e utilitários
│   ├── src/commonTest/  # Testes unitários compartilhados
│   └── src/androidMain/ # Implementações específicas Android
└── gradle/              # Version Catalog e configurações
```

### 🏛️ Organização da Camada de UI (Android)
A interface do Android foi projetada seguindo o padrão de **Vertical Slices** dentro da pasta `features`, garantindo que cada funcionalidade seja auto-contida:
- **`components/`**: Widgets globais (ex: `AmazonButton`, `ProductCard`) que mantêm a consistência visual.
- **`features/`**:
    - `auth/`: Fluxos de Login e Cadastro com validações em tempo real.
    - `catalog/`: Navegação por categorias e busca de produtos.
    - `cart/`: Gestão de itens e cálculo de frete/impostos.
    - `checkout/`: Processamento de pagamentos e confirmação.
- **`navigation/`**: Centraliza a lógica de `NavHost`, garantindo um fluxo de usuário fluido e desacoplado.

---

## 🚀 Guia de Inicialização

### Pré-requisitos
- **JDK 21** instalado e configurado no `JAVA_HOME`.
- **Android Studio** (Koala ou superior).
- **Gradle 9.0+** (via wrapper).
- **Emulador Android** (API 34+).

### 1. Comandos de Build e Execução

**Gerar Build Completa:**
```powershell
./gradlew clean assembleDebug
```

**Instalar no Emulador:**
```powershell
./gradlew :androidApp:installDebug
```

**Rodar Testes Unitários (JVM/Robolectric):**
```powershell
./gradlew :androidApp:testDebugUnitTest
```

**Rodar Testes Instrumentados (Espresso/Emulador):**
```powershell
./gradlew :androidApp:connectedDebugAndroidTest
```

---

## 🧪 Qualidade e Automação de Testes

O projeto mobile conta com uma suíte robusta de testes automatizados, dividida em duas camadas principais para garantir estabilidade e performance:

| Tipo | Ferramenta | Qtd | Descrição |
| :--- | :--- | :--- | :--- |
| **Unitários de UI** | Robolectric + Compose | 26 | Testes rápidos rodando na JVM (sem emulador). |
| **Instrumentados** | Espresso + Emulador | 21 | Validação real em dispositivo, incluindo integração com backend. |
| **Total** | | **47** | **100% de aprovação ✅** |

> [!TIP]
> Para uma documentação detalhada de cada teste, fluxos cobertos e como gerar relatórios Allure, consulte o [📱 README de Testes](readme-tests.MD).

---

## 🚀 Referência de Comandos

| Ação | Comando |
| :--- | :--- |
| **Limpar e Build** | `./gradlew clean assembleDebug` |
| **Instalar App** | `./gradlew :androidApp:installDebug` |
| **Rodar Testes** | `./gradlew :shared:test` |
| **Listar Emuladores** | `emulator -list-avds` |
| **Parar Gradle** | `./gradlew --stop` |
| **Matar Java (Lock)** | `Stop-Process -Name java -Force` |

---

## 🐞 Troubleshooting

### ⚠️ Windows File Lock ("Unable to delete file")
Se o Gradle travar ao tentar sobrescrever arquivos:
1. Feche o Android Studio.
2. Execute `./gradlew --stop`.
3. Mate processos java: `Stop-Process -Name java -Force`.
4. Limpe manualmente: `Remove-Item -Path shared/build, androidApp/build -Recurse -Force`.

### 🌐 Conectividade com Backend Local
O Emulador Android usa um IP específico para acessar o `localhost` da sua máquina:
- **URL Base:** `http://10.0.2.2:3000`
- **Network Security:** O app está configurado para aceitar tráfego HTTP em `10.0.2.2` para facilitar o desenvolvimento local.

---

## 📝 Regras de Qualidade (DoD)
- **Zero Chamadas HTTP na UI**: Toda comunicação deve passar pelos repositórios no módulo `shared`.
- **Arquitetura em Camadas**: Separação clara entre Data, Domain e Presentation.
- **Clean Code**: Nomes descritivos e funções de responsabilidade única.
- **Testes**: Validar regras de negócio e conectividade (ver `BackendConnectivityTest`).

---

**Link Útil**: [Regras de Negócio Oficiais](https://reinaldorossetti.github.io/tester.com/regras-do-sistema.html)
