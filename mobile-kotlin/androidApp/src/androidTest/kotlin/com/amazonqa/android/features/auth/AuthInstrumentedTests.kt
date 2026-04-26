package com.amazonqa.android.features.auth

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.MainActivity
import com.amazonqa.android.helpers.EspressoPageHelper
import com.amazonqa.shared.utils.AppStrings
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Testes instrumentados de autenticação — executados no EMULADOR via Espresso.
 *
 * Execução:
 *   ./gradlew :androidApp:connectedDebugAndroidTest \
 *     -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.AuthInstrumentedTests
 */
@RunWith(AndroidJUnit4::class)
class AuthInstrumentedTests {

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    private lateinit var page: EspressoPageHelper

    @Before
    fun setup() {
        page = EspressoPageHelper(composeRule)
        // Aguarda a MainActivity carregar completamente
        page.waitForIdle()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN SCREEN
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testLoginScreenAllElementsAreDisplayed() {
        // A app inicia na LoginScreen — verifica elementos principais
        page.assertIsDisplayedByText(AppStrings.loginEmail)      // "E-mail ou Telefone"
        page.assertIsDisplayedByText(AppStrings.loginPassword)   // "Senha"
        page.assertIsDisplayedByText(AppStrings.loginContinue)   // "Continuar"
        page.assertIsDisplayedByText(AppStrings.loginSkip)       // "Entrar como visitante"
    }

    @Test
    fun testLoginScreenDoesNotShowErrorInitially() {
        page.assertDoesNotExistByText("E-mail ou senha incorretos.")
        page.assertDoesNotExistByText("Erro de conexão")
    }

    @Test
    fun testLoginContinueButtonIsClickable() {
        // Clica em Continuar sem preencher — não deve crashar
        page.clickButtonByText(AppStrings.loginContinue)
        page.waitForIdle()
        // LoginScreen ainda deve estar visível (campos obrigatórios vazios)
        page.assertIsDisplayedByText(AppStrings.loginEmail)
    }

    @Test
    fun testLoginNavigatesToRegisterScreen() {
        // Clica em "Não tem conta? Comece aqui." para navegar ao cadastro
        page.clickButtonByText(AppStrings.loginRegister)
        page.waitForIdle()
        // Após navegar, o formulário de cadastro deve aparecer
        page.assertIsDisplayedByText("Nome *")
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER SCREEN  (navega a partir da LoginScreen)
    // ─────────────────────────────────────────────────────────────────────────

    private fun navigateToRegister() {
        page.clickButtonByText(AppStrings.loginRegister)
        page.waitForIdle()
    }

    @Test
    fun testRegisterScreenLabelsAreDisplayed() {
        navigateToRegister()
        page.assertIsDisplayedByText("Nome *")
        page.assertIsDisplayedByText("Sobrenome *")
        page.assertIsDisplayedByText("CPF *")
        page.assertIsDisplayedByText("Email *")
        page.assertIsDisplayedByText("Senha *")
    }

    @Test
    fun testRegisterScreenPFTabIsSelectedByDefault() {
        navigateToRegister()
        page.assertIsDisplayedByText("Pessoa Física (CPF)")
        page.assertIsDisplayedByText("CPF *")
    }

    @Test
    fun testRegisterScreenSwitchToPJTab() {
        navigateToRegister()
        page.clickButtonByText("Pessoa Jurídica (CNPJ)")
        page.waitForIdle()
        page.assertIsDisplayedByText("CNPJ *")
    }

    @Test
    fun testRegisterScreenValidationShowsErrors() {
        navigateToRegister()
        page.clickButtonByText("Próximo: Endereço")
        page.waitForIdle()
        page.assertIsDisplayedByText("Campo obrigatório")
    }
}
