# 📱 AmazonQA - Mobile Kotlin Multiplatform (KMM)

![Kotlin Multiplatform](https://img.shields.io/badge/Kotlin-Multiplatform-blue?style=for-the-badge&logo=kotlin)
![Android SDK 34](https://img.shields.io/badge/Android-SDK%2034-green?style=for-the-badge&logo=android)
![Java 22](https://img.shields.io/badge/Java-22-red?style=for-the-badge&logo=openjdk)
![Compose Multiplatform](https://img.shields.io/badge/Compose-Multiplatform-orange?style=for-the-badge&logo=jetpackcompose)

Projeto mobile multiplataforma desenvolvido em **Kotlin Multiplatform (KMM)**, integrando o ecossistema AmazonQA. O aplicativo consome os endpoints REST do backend Next.js e segue os mais rigorosos padrões de **Clean Architecture**, **SOLID** e **Clean Code**.

---

## 🏗️ Arquitetura e Tech Stack

O projeto é dividido em três módulos principais:
- **`shared`**: Core do projeto contendo a lógica de negócio, modelos de domínio, repositórios de dados e clientes de rede (Ktor).
- **`androidApp`**: Camada nativa Android utilizando **Jetpack Compose** para a UI.
- **`iosApp`**: Camada nativa iOS (SwiftUI).

### Tecnologias Utilizadas
- **Linguagem:** Kotlin 2.2.0
- **UI:** Jetpack Compose (Android) / SwiftUI (iOS)
- **Rede:** Ktor Client (Content Negotiation, Logging, Serialization)
- **Injeção de Dependência:** Koin
- **Assincronismo:** Kotlin Coroutines & Flow/StateFlow
- **Serialização:** kotlinx.serialization

---

## 🎨 Identidade Visual
Seguimos a paleta de cores oficial da Amazon para garantir uma experiência consistente:
- **Amazon Dark (#131921):** Header e elementos principais.
- **Amazon Orange (#FF9900):** Destaques e Call-to-Actions.
- **Amazon Yellow (#FFD814):** Botões de compra.
- **Amazon Blue (#007185):** Links e interações.

---

## 🚀 Guia de Inicialização (Passo a Passo)

### Pré-requisitos
- **JDK 22** instalado e configurado no `JAVA_HOME`.
- **Android Studio** (Koala ou superior).
- **Gradle 9.0+** (instalado via wrapper ou global).
- **Emulator** configurado com API 34+.

### 1. Clonagem e Configuração
```bash
git clone https://github.com/reinaldorossetti/tester.com.git
cd mobile-kotlin
```

### 2. Comandos de Build e Execução

#### Gerar Build Completa
```powershell
./gradlew clean assembleDebug
# Ou usando a tarefa customizada:
./gradlew rebuild
```

> [!TIP]
> Foi adicionado em `gradle.properties` a configuração `org.gradle.vfs.watch=false` para ajudar com problemas de arquivos travados no Windows durante o build.

#### Instalar no Emulador Android
Certifique-se de que o emulador está rodando (`adb devices` para verificar).
```powershell
./gradlew :androidApp:installDebug
```

#### Gerenciar Emuladores (Linha de Comando)
Caso precise listar ou iniciar um emulador manualmente:

**Listar emuladores disponíveis:**
```powershell
emulator -list-avds
```

**Iniciar um emulador específico:**
```powershell
# Substitua <NOME_DO_EMULADOR> pelo nome retornado no comando anterior
emulator -avd <NOME_DO_EMULADOR>
```

> [!NOTE]
> No Windows, certifique-se de que o binário `emulator` está no seu PATH (geralmente em `%ANDROID_HOME%\emulator`).

#### Executar Testes Unitários
```powershell
./gradlew :shared:test
```


---

## 🚀 Referência Rápida de Comandos

| Ação | Comando |
| :--- | :--- |
| **Limpar e Build** | `./gradlew clean assembleDebug` |
| **Rebuild Total** | `./gradlew rebuild` |
| **Instalar App** | `./gradlew :androidApp:installDebug` |
| **Rodar Testes** | `./gradlew :shared:test` |
| **Listar Emuladores** | `emulator -list-avds` |
| **Subir Emulador** | `emulator -avd Pixel_8a` |
| **Ver Logs (App)** | `adb logcat *:S AmazonQA:V` |
| **Parar Gradle** | `./gradlew --stop` |
| **Matar Java** | `Stop-Process -Name java -Force` |


adb kill-server
adb start-server
Stop-Process -Name "emulator", "qemu-system-x86_64"

## 🐞 Depuração e Troubleshooting

### Ativar Logs de Debug
Para ver logs detalhados durante o build ou execução:
```powershell
./gradlew :androidApp:installDebug --info --stacktrace
```

### Monitorar Logs do Aplicativo (Logcat)
Use o filtro para capturar apenas as mensagens do AmazonQA:
```powershell
adb logcat *:S AmazonQA:V
```

### ⚠️ Erro Comum: "Unable to delete file / File Lock"
No Windows, é comum o Gradle falhar ao tentar sobrescrever arquivos (`classes.jar` ou `R.jar`). Caso ocorra:

1. Feche o Android Studio/VS Code.
2. Force o fechamento dos daemons travados:
   ```powershell
   ./gradlew --stop
   Stop-Process -Name java -Force
   ```
3. Limpe as pastas de build manualmente:
   ```powershell
   Remove-Item -Path shared/build, androidApp/build -Recurse -Force
   ```

### 🖋️ Sintaxe Kotlin: "Imports are only allowed in the beginning of file"
Se encontrar este erro ao usar anotações de nível de arquivo (como `@file:OptIn`), certifique-se de que a anotação esteja na **primeira linha do arquivo**, antes mesmo da declaração do `package`.

### 🌐 Conectividade Local (Emulator)
O Android Emulator não reconhece `localhost` como a sua máquina host.
- **Backend URL:** Use `http://10.0.2.2:3000` em vez de `localhost`.
- **Imagens:** O projeto utiliza **Coil** para carregamento dinâmico. Foi implementado o mapeamento automático de URLs do backend para o endereço bridge do emulador.

---

## 🗺️ Estrutura de Pastas
```text
mobile-kotlin/
├── androidApp/          # Código nativo Android (Compose)
├── iosApp/              # Código nativo iOS (SwiftUI)
├── shared/              # Código compartilhado entre plataformas
│   ├── src/commonMain/  # Lógica de negócio, Repository, Models
│   ├── src/androidMain/ # Implementações específicas Android
│   └── src/iosMain/     # Implementações específicas iOS
└── gradle/              # Configurações do Gradle e Version Catalog
```

---

## 📝 Regras de Qualidade (DoD)
- **Zero Chamadas HTTP na UI**: Toda comunicação deve passar pelos repositórios no módulo `shared`.
- **Cobertura de Testes**: Mínimo de 80% nas regras de negócio.
- **Lint**: Código formatado conforme `ktlint` e livre de warnings críticos.
- **JWT**: Armazenamento seguro de tokens nas plataformas específicas.

---

**Link Útil**: [Regras de Negócio Oficiais](https://reinaldorossetti.github.io/tester.com/regras-do-sistema.html)
