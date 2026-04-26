package com.amazonqa.android.features.auth

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onAllNodesWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.MainActivity
import com.amazonqa.android.helpers.EspressoPageHelper
import com.amazonqa.shared.utils.AppStrings
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Testes instrumentados de validação de usuários seed — executados no EMULADOR via Espresso.
 *
 * Valida que os 3 perfis de usuário definidos no `.env` conseguem autenticar com sucesso:
 *   - Admin:   reiload@gmail.com        / rei2026@QA
 *   - Normal:  reinaldo.rossetti@...    / qualidade2026@QA
 *   - Suporte: suporte@tester.com       / suporte2026@QA
 *
 * Pré-requisito: backend rodando em localhost:3001 (acessível via 10.0.2.2 no emulador).
 *
 * Execução:
 *   ./gradlew :androidApp:connectedDebugAndroidTest \
 *     -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.auth.UserLoginInstrumentedTests
 */
@RunWith(AndroidJUnit4::class)
class UserLoginInstrumentedTests {

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    private lateinit var page: EspressoPageHelper

    @Before
    fun setup() {
        page = EspressoPageHelper(composeRule)
        page.waitForIdle()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Utilitário de login reutilizável
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Realiza o fluxo de login com as credenciais fornecidas e aguarda navegar ao catálogo.
     * A LoginScreen detecta sucesso quando o AuthState.Success é emitido e navega para "catalog".
     */
    private fun performLogin(email: String, password: String) {
        page.typeText("login_email_field", email)
        page.typeText("login_password_field", password)
        page.clickButtonByText(AppStrings.loginContinue)
        // Aguarda até o catálogo carregar (login bem-sucedido navega para CatalogScreen)
        page.waitUntil(15_000L) {
            composeRule.onAllNodesWithTag("amazon_header_logo")
                .fetchSemanticsNodes().isNotEmpty()
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ADMIN USER — reiload@gmail.com / rei2026@QA
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testAdminUserCanLogin() {
        performLogin(
            email = "reiload@gmail.com",
            password = "rei2026@QA"
        )
        // Após login com sucesso, a CatalogScreen com o header Amazon deve estar visível
        page.assertIsDisplayedByTag("amazon_header_logo")
    }

    @Test
    fun testAdminUserLoginShowsCatalog() {
        performLogin(
            email = "reiload@gmail.com",
            password = "rei2026@QA"
        )
        // Botão do carrinho deve estar visível na CatalogScreen
        page.assertIsDisplayedByTag("cart_icon_button")
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NORMAL USER — reinaldo.rossetti@outlook.com / qualidade2026@QA
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testNormalUserCanLogin() {
        performLogin(
            email = "reinaldo.rossetti@outlook.com",
            password = "qualidade2026@QA"
        )
        page.assertIsDisplayedByTag("amazon_header_logo")
    }

    @Test
    fun testNormalUserLoginShowsCatalog() {
        performLogin(
            email = "reinaldo.rossetti@outlook.com",
            password = "qualidade2026@QA"
        )
        page.assertIsDisplayedByTag("cart_icon_button")
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUPPORT USER — suporte@tester.com / suporte2026@QA
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testSupportUserCanLogin() {
        performLogin(
            email = "suporte@tester.com",
            password = "suporte2026@QA"
        )
        page.assertIsDisplayedByTag("amazon_header_logo")
    }

    @Test
    fun testSupportUserLoginShowsCatalog() {
        performLogin(
            email = "suporte@tester.com",
            password = "suporte2026@QA"
        )
        page.assertIsDisplayedByTag("cart_icon_button")
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CREDENCIAIS INVÁLIDAS — segurança
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testInvalidCredentialsShowsError() {
        page.typeText("login_email_field", "usuario_invalido@teste.com")
        page.typeText("login_password_field", "senhaErrada123")
        page.clickButtonByText(AppStrings.loginContinue)
        // Aguarda resposta da API (máximo 10s) — login inválido NÃO deve navegar ao catálogo
        Thread.sleep(5_000L)
        page.waitForIdle()
        // Deve permanecer na LoginScreen (o header do catálogo não deve aparecer)
        page.assertDoesNotExistByTag("amazon_header_logo")
    }
}
