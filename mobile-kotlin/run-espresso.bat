@echo off
REM =============================================================================
REM  run-espresso.bat — Executa os testes instrumentados (Espresso) no emulador
REM =============================================================================
REM
REM  Pré-requisitos:
REM    1. Android SDK instalado e ANDROID_HOME configurado
REM    2. Emulador Android iniciado (API 34+) OU dispositivo físico conectado via ADB
REM    3. Verificar emuladores disponíveis: emulator -list-avds
REM    4. Iniciar emulador:  emulator -avd <nome_avd> &
REM
REM  Uso:
REM    run-espresso.bat                  -> Todos os testes instrumentados
REM    run-espresso.bat auth             -> Apenas AuthInstrumentedTests
REM    run-espresso.bat catalog          -> Apenas CatalogInstrumentedTests
REM    run-espresso.bat orders           -> Apenas OrderInstrumentedTests
REM
REM  Relatório HTML gerado em:
REM    androidApp/build/reports/androidTests/connected/debug/index.html
REM =============================================================================

setlocal

set SUITE=%1

if "%SUITE%"=="" (
    echo [INFO] Executando TODOS os testes instrumentados no emulador...
    call gradlew.bat :androidApp:connectedDebugAndroidTest ^
        --info ^
        2>&1
    goto :end
)

if "%SUITE%"=="auth" (
    echo [INFO] Executando AuthInstrumentedTests...
    call gradlew.bat :androidApp:connectedDebugAndroidTest ^
        -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.AuthInstrumentedTests ^
        --info ^
        2>&1
    goto :end
)

if "%SUITE%"=="catalog" (
    echo [INFO] Executando CatalogInstrumentedTests...
    call gradlew.bat :androidApp:connectedDebugAndroidTest ^
        -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.catalog.CatalogInstrumentedTests ^
        --info ^
        2>&1
    goto :end
)

if "%SUITE%"=="orders" (
    echo [INFO] Executando OrderInstrumentedTests...
    call gradlew.bat :androidApp:connectedDebugAndroidTest ^
        -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.orders.OrderInstrumentedTests ^
        --info ^
        2>&1
    goto :end
)

echo [ERRO] Suite invalida: "%SUITE%". Use: auth, catalog, orders, ou deixe vazio para todos.
exit /b 1

:end
echo.
echo [INFO] Relatorio HTML: androidApp\build\reports\androidTests\connected\debug\index.html
endlocal
