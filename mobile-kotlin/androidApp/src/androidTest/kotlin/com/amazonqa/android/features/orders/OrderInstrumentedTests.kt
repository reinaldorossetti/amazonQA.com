package com.amazonqa.android.features.orders

import androidx.compose.ui.test.junit4.createAndroidComposeRule
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
 * Testes instrumentados de Checkout — executados no EMULADOR via Espresso.
 *
 * Fluxo completo: LoginScreen → (visitante) → CatalogScreen → aguarda produtos →
 *                 Adiciona ao carrinho → CartScreen → CheckoutScreen.
 *
 * Execução:
 *   ./gradlew :androidApp:connectedDebugAndroidTest \
 *     -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.orders.OrderInstrumentedTests
 */
@RunWith(AndroidJUnit4::class)
class OrderInstrumentedTests {

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    private lateinit var page: EspressoPageHelper

    @Before
    fun setup() {
        page = EspressoPageHelper(composeRule)
        page.waitForIdle()
        // Entra como visitante para chegar à CatalogScreen
        page.clickButtonByText(AppStrings.loginSkip)
        page.waitForIdle()
        // Aguarda produtos carregarem (até 10s)
        page.waitUntil(10_000L) {
            composeRule.onAllNodesWithText("Adicionar ao carrinho", ignoreCase = true)
                .fetchSemanticsNodes().isNotEmpty()
        }
        // Adiciona o primeiro produto ao carrinho
        page.clickButtonByText("Adicionar ao carrinho")
        page.waitForIdle()
        // Navega ao carrinho via ícone no header
        page.clickButtonByTag("cart_icon_button")
        page.waitForIdle()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CART SCREEN
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testCartScreenShowsItems() {
        // CartScreen deve mostrar "Fechar pedido" quando há items
        page.assertIsDisplayedByText("Fechar pedido")
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHECKOUT SCREEN
    // ─────────────────────────────────────────────────────────────────────────

    private fun navigateToCheckout() {
        page.clickButtonByText("Fechar pedido")
        page.waitForIdle()
    }

    @Test
    fun testCheckoutScreenElementsAreDisplayed() {
        navigateToCheckout()
        // CheckoutScreen mostra: título "Pagamento", opções PIX/Cartão/Boleto, botão confirmar
        page.assertIsDisplayedByText("Pagamento")
        page.assertIsDisplayedByText("PIX")
        page.assertIsDisplayedByText("Cartão de Crédito")
        page.assertIsDisplayedByText("Confirmar e Pagar")
    }

    @Test
    fun testCheckoutRequiresLoginToConfirm() {
        navigateToCheckout()
        // Tenta confirmar sem login — deve exibir erro de autenticação
        page.clickButtonByText("Confirmar e Pagar")
        page.waitForIdle()
        // AppErrors.loginRequired contém "Você precisa estar logado..." — verifica pelo testTag
        page.assertIsDisplayedByTag("login_error_message")
    }
}
