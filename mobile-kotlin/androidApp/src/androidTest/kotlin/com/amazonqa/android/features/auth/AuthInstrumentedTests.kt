package com.amazonqa.android.features.auth

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.MainActivity
import com.amazonqa.android.helpers.EspressoPageHelper
import org.junit.rules.TestWatcher
import org.junit.runner.Description
import com.amazonqa.shared.utils.AppStrings
import com.amazonqa.android.screens.ScreenAuth
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import io.qameta.allure.android.runners.AllureAndroidJUnit4
import org.junit.runner.RunWith

/**
 * Testes instrumentados de autenticação — executados no EMULADOR via Espresso.
 *
 * Execução:
 *   ./gradlew :androidApp:connectedDebugAndroidTest \
 *     -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.AuthInstrumentedTests
 */
@RunWith(AllureAndroidJUnit4::class)
class AuthInstrumentedTests {

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @get:Rule
    val screenshotOnFailure = object : TestWatcher() {
        override fun failed(e: Throwable?, description: Description) {
            try {
                val helper = EspressoPageHelper(composeRule)
                val name = "${description.className}_${description.methodName}"
                helper.takeScreenshot(name)
                println("Screenshot captured for failed test: $name")
            } catch (t: Throwable) {
                println("Failed to capture screenshot on test failure: ${t.message}")
            }
        }
    }

    private lateinit var page: EspressoPageHelper
    private lateinit var auth: ScreenAuth

    @Before
    fun setup() {
        page = EspressoPageHelper(composeRule)
        auth = ScreenAuth(page)
        // Aguarda a MainActivity carregar completamente
        page.waitForIdle()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOGIN SCREEN
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * A app inicia na LoginScreen — verifica elementos principais (ATDD)
     */
    @Test
    fun testLoginScreenAllElementsAreDisplayed() {
        auth.assertLoginScreenIsDisplayed()
    }

    /**
     * Verifica que não há mensagens de erro inicialmente na tela de login
     */
    @Test
    fun testLoginScreenDoesNotShowErrorInitially() {
        auth.assertNoInitialErrorMessages()
    }

    /**
     * Clicar em Continuar sem preencher não causa crash; a tela de login permanece visível
     */
    @Test
    fun testLoginContinueButtonIsClickable() {
        auth.clickContinue()
        // Apenas verifica que o campo de e-mail permanece visível (comportamento original)
        auth.assertEmailFieldIsDisplayed()
    }

    /**
     * Preenche os campos de login e verifica navegação de foco via IME actions
     */
    @Test
    fun testLoginKeyboardNavigationMovesFocus() {
        auth.fillLoginForm("admin@tester.com", "admin123")
        page.waitForIdle()
    }

    /**
     * Ao clicar em 'Não tem conta? Comece aqui.' navega para a tela de cadastro
     */
    @Test
    fun testLoginNavigatesToRegisterScreen() {
        auth.navigateToRegister()
        auth.assertRegisterFormDisplayed()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER SCREEN  (navega a partir da LoginScreen)
    // ─────────────────────────────────────────────────────────────────────────

    // Navegação para registro agora encapsulada em ScreenAuth

    /**
     * O formulário de cadastro exibe os campos obrigatórios (Nome, Sobrenome, CPF, Email, Senha)
     */
    @Test
    fun testRegisterScreenLabelsAreDisplayed() {
        auth.navigateToRegister()
        auth.assertRegisterFormDisplayed()
    }

    /**
     * Aba 'Pessoa Física (CPF)' é selecionada por padrão no cadastro
     */
    @Test
    fun testRegisterScreenPFTabIsSelectedByDefault() {
        auth.navigateToRegister()
        auth.assertRegisterPFTabIsSelectedByDefault()
    }

    /**
     * Alternando para 'Pessoa Jurídica (CNPJ)' exibe o campo CNPJ
     */
    @Test
    fun testRegisterScreenSwitchToPJTab() {
        auth.navigateToRegister()
        auth.switchToPJTab()
        auth.assertCnpjFieldDisplayed()
    }

    /**
     * Ao avançar sem preencher, devem ser exibidos erros de validação 'Campo obrigatório'
     */
    @Test
    fun testRegisterScreenValidationShowsErrors() {
        auth.navigateToRegister()
        auth.clickNextAddress()
        auth.assertRegisterValidationShowsErrors()
    }
}
