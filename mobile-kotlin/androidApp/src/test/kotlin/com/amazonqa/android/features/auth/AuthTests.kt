package com.amazonqa.android.features.auth

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.helpers.PageHelper
import com.amazonqa.android.ui.features.auth.LoginScreen
import com.amazonqa.android.ui.features.auth.RegisterScreen
import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.AuthRepository
import com.amazonqa.shared.presentation.LoginViewModel
import com.amazonqa.shared.utils.AppStrings
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(org.robolectric.RobolectricTestRunner::class)
class AuthTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    private val fakeViewModel = LoginViewModel(AuthRepository(ApiClient()))

    // ───────────────────────────────────────────────
    // LOGIN SCREEN
    // ───────────────────────────────────────────────

    @Test
    fun testLoginScreenAllElementsAreDisplayed() {
        composeTestRule.setContent {
            LoginScreen(
                viewModel = fakeViewModel,
                onNavigateToRegister = {},
                onSkip = {}
            )
        }

        // Campos principais — usando os valores reais de AppStrings
        pageHelper.assertIsDisplayedByText(AppStrings.loginEmail)         // "E-mail ou Telefone"
        pageHelper.assertIsDisplayedByText(AppStrings.loginPassword)      // "Senha"
        pageHelper.assertIsDisplayedByText(AppStrings.loginContinue)      // "Continuar"
        pageHelper.assertIsDisplayedByText(AppStrings.loginRegister)      // "Não tem conta? Comece aqui."
        pageHelper.assertIsDisplayedByText(AppStrings.loginSkip)          // "Entrar como visitante"

        pageHelper.takeScreenshot("testLoginScreenAllElementsAreDisplayed")
    }

    @Test
    fun testLoginScreenDoesNotShowErrorInitially() {
        composeTestRule.setContent {
            LoginScreen(
                viewModel = fakeViewModel,
                onNavigateToRegister = {},
                onSkip = {}
            )
        }

        // Nenhuma mensagem de erro deve estar visível no estado inicial
        pageHelper.assertDoesNotExistByText("E-mail ou senha incorretos.")
        pageHelper.assertDoesNotExistByText("Erro de conexão")

        pageHelper.takeScreenshot("testLoginScreenDoesNotShowErrorInitially")
    }

    @Test
    fun testLoginContinueButtonIsClickable() {
        composeTestRule.setContent {
            LoginScreen(
                viewModel = fakeViewModel,
                onNavigateToRegister = {},
                onSkip = {}
            )
        }

        // Clica em Continuar sem preencher nada (verifica que não crasha)
        pageHelper.clickButtonByText(AppStrings.loginContinue)

        // A tela de login ainda deve estar visível
        pageHelper.assertIsDisplayedByText(AppStrings.loginEmail)

        pageHelper.takeScreenshot("testLoginContinueButtonIsClickable")
    }

    // ───────────────────────────────────────────────
    // REGISTER SCREEN
    // ───────────────────────────────────────────────

    @Test
    fun testRegisterScreenLabelsAreDisplayed() {
        composeTestRule.setContent {
            RegisterScreen(
                viewModel = fakeViewModel,
                onBack = {}
            )
        }

        // Campos obrigatórios visíveis
        pageHelper.assertIsDisplayedByText("Nome *")
        pageHelper.assertIsDisplayedByText("Sobrenome *")
        pageHelper.assertIsDisplayedByText("CPF *")
        pageHelper.assertIsDisplayedByText("Email *")
        pageHelper.assertIsDisplayedByText("Telefone / WhatsApp *")
        pageHelper.assertIsDisplayedByText("Senha *")
        pageHelper.assertIsDisplayedByText("Confirmar Senha *")

        pageHelper.takeScreenshot("testRegisterScreenLabelsAreDisplayed")
    }

    @Test
    fun testRegisterScreenValidationShowsErrors() {
        composeTestRule.setContent {
            RegisterScreen(
                viewModel = fakeViewModel,
                onBack = {}
            )
        }

        // Clica em avançar sem preencher nada
        pageHelper.clickButtonByText("Próximo: Endereço")

        // Deve exibir "Campo obrigatório" para cada campo vazio
        pageHelper.assertIsDisplayedByText("Campo obrigatório")

        pageHelper.takeScreenshot("testRegisterScreenValidationShowsErrors")
    }

    @Test
    fun testRegisterScreenPFTabIsSelectedByDefault() {
        composeTestRule.setContent {
            RegisterScreen(
                viewModel = fakeViewModel,
                onBack = {}
            )
        }

        // Aba Pessoa Física deve estar ativa por padrão
        pageHelper.assertIsDisplayedByText("Pessoa Física (CPF)")
        pageHelper.assertIsDisplayedByText("CPF *")

        pageHelper.takeScreenshot("testRegisterScreenPFTabIsSelectedByDefault")
    }

    @Test
    fun testRegisterScreenSwitchToPJTab() {
        composeTestRule.setContent {
            RegisterScreen(
                viewModel = fakeViewModel,
                onBack = {}
            )
        }

        // Clica na aba Pessoa Jurídica
        pageHelper.clickButtonByText("Pessoa Jurídica (CNPJ)")

        // Agora o label do campo deve mudar para CNPJ
        pageHelper.assertIsDisplayedByText("CNPJ *")

        pageHelper.takeScreenshot("testRegisterScreenSwitchToPJTab")
    }

    @Test
    fun testRegisterScreenHasLoginLink() {
        composeTestRule.setContent {
            RegisterScreen(
                viewModel = fakeViewModel,
                onBack = {}
            )
        }

        pageHelper.assertIsDisplayedByText("Já tem uma conta?")
        pageHelper.assertIsDisplayedByText("Fazer login")

        pageHelper.takeScreenshot("testRegisterScreenHasLoginLink")
    }
}
