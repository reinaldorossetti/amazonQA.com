## Detox Mobile — Testes E2E

Este diretório contém a suíte inicial de testes Detox para o app mobile.

Pré-requisitos
- Node.js >= 18
- npm (ou yarn)
- Android SDK (platform-tools, emulator)
- Um AVD configurado (por exemplo `Pixel_8a`) ou dispositivo Android conectado
- Java/Gradle disponíveis no PATH (ou use o `gradlew` do projeto)

Estrutura relevante
- `src/pages/` — Page Objects (Login, Register, Catalog, Cart, Checkout, Base)
- `spec/` — Specs de teste (auth.spec.js, catalog.spec.js, orders.spec.js)
- `package.json` — scripts: `android:build`, `detox:build`, `detox:test`

Comandos rápidos
1) Instalar dependências (dentro deste folder):

```bash
cd projects-tests/detox-mobile
npm install
```

2) Construir o app e o test-APK (usa o gradle wrapper do projeto `mobile-kotlin`).

Use **`npm run android:build`** para Detox: o projeto compila com **`-PdetoxHarnessOnly=true`**, assim o APK de `androidTest` **não** inclui os testes Espresso/JUnit de `androidTest/kotlin/` (caso contrário o `AndroidJUnitRunner` dispara **todos** os testes instrumentados e parece que “rode tudo”, mesmo você tendo passado só `spec/auth.spec.js` no Detox/Jest).

Para builds **com** a suíte instrumentada Espresso (Android Studio/`gradlew connectedDebugAndroidTest`), use `npm run android:build:instrumented`. Para Detox:

```bash
npm run android:build
```

3) Build do Detox (registro/validação do APK apontado no config):

```bash
npm run detox:build
```

4) Rodar os testes Detox:

```bash
npm run detox:test
```

Comandos alternativos (npx):

```bash
npx detox build --configuration android.emu.debug
npx detox test --configuration android.emu.debug
```

Emulador / dispositivos
- Listar AVDs:

```bash
emulator -list-avds
```

- Iniciar um AVD (exemplo):

```bash
emulator -avd Pixel_8a &
# ou via AVD Manager (Android Studio)
```

- Listar dispositivos via ADB:

```bash
adb devices
```

Problemas comuns e dicas de troubleshooting
- Se o Detox reclamar que não encontra o AVD, verifique `avdName` em `package.json` (config `detox.devices`) e atualize para um AVD disponível.
- Se preferir usar um emulador já rodando, configure o device para `android.attached` e use `adb` name (ex.: `emulator-5554`).
- Se o uninstall do app falhar (DELETE_FAILED_INTERNAL_ERROR), tente manualmente:

```bash
adb -s emulator-5554 uninstall com.amazonqa.android || true
adb -s emulator-5554 uninstall com.amazonqa.android.test || true
```

- APKs gerados:
  - App: `mobile-kotlin/androidApp/build/outputs/apk/debug/androidApp-debug.apk`
  - Test APK: `mobile-kotlin/androidApp/build/outputs/apk/androidTest/debug/androidApp-debug-androidTest.apk`

- Se os testes não conseguem conectar ao app (app desconecta/timeout):
  - Verifique se `assembleAndroidTest` foi bem-sucedido
  - Confirme que o `binaryPath` e `app` no `package.json` (`detox.apps`) apontam para os APKs corretos
  - Aumente o timeout do Jest em `package.json` (`jest.testTimeout`) se necessário

Executar um único spec

```bash
npx detox test --configuration android.emu.debug spec/auth.spec.js --loglevel trace
```

**Por que o log Android mostra dezenas de testes (`INSTRUMENTATION_STATUS`, `AuthInstrumentedTests`, …)?**

O Detox filtra apenas **quais specs Jest** rodam (`spec/auth.spec.js` está correto nos logs como `_: ["spec/auth.spec.js"]`). Já **essa outra parte** vem do **APK `-androidTest`**: se ele foi compilado **com** as classes Espresso em `androidTest/kotlin`, o runner nativo pode executá-las todas. Para evitar isso nos fluxos Detox, recompile com `npm run android:build` (com `-PdetoxHarnessOnly=true`).

# listar os testes que o Jest encontra
npx jest --listTests

# rodar (Detox via npm script)
npm test

# ou rodar jest diretamente
npx jest

Notas finais
- Ajuste `projects-tests/detox-mobile/package.json` se seu AVD tiver outro nome ou se preferir utilizar um dispositivo conectado.
- Verifique as mensagens do Detox no terminal para instruções específicas (em particular erros de AVD, adb ou problemas de instalação de APK).

## Comandos úteis (adicionados)

Abaixo estão comandos práticos usados durante a sessão — scripts npm, comandos Detox e ADB para diagnóstico e execução de specs específicas.

Re-executar o spec auth com trace (script adicionado):

```bash
npm run detox:run:auth
# ou
npx detox test --configuration android.emu.debug spec/auth.spec.js --loglevel trace
```

Executar o Detox build configurado para pular o build localmente (release):

```bash
npx detox build --configuration android.emu.release
```

Comandos ADB úteis:

```bash
adb devices
adb -s emulator-5554 shell pm list packages | findstr com.amazonqa
adb -s emulator-5554 shell pm list instrumentation | findstr com.amazonqa
adb -s emulator-5554 shell am instrument -w com.amazonqa.android.test/androidx.test.runner.AndroidJUnitRunner
adb -s emulator-5554 install -r ./app/apk/androidApp-debug.apk
adb -s emulator-5554 install -r ./app/apk/androidApp-debug-androidTest.apk
adb -s emulator-5554 uninstall com.amazonqa.android || true
adb -s emulator-5554 uninstall com.amazonqa.android.test || true
adb -s emulator-5554 logcat -d > logcat.txt
```

Nota: executar a instrumentação manualmente com `am instrument -w` pode revelar falhas de teste nativas (Compose/Espresso) que o Detox pode mascarar; isso foi útil para diagnosticar timeouts e asserts durante a sessão.
