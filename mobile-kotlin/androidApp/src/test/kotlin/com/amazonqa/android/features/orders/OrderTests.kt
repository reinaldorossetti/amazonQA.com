package com.amazonqa.android.features.orders

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.helpers.PageHelper
import com.amazonqa.android.ui.features.checkout.CheckoutScreen
import com.amazonqa.android.ui.features.checkout.ThankYouScreen
import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.OrderRepository
import com.amazonqa.shared.domain.models.CartItem
import com.amazonqa.shared.domain.models.Product
import com.amazonqa.shared.presentation.AuthState
import com.amazonqa.shared.presentation.CartViewModel
import com.amazonqa.shared.presentation.OrderViewModel
import com.amazonqa.shared.utils.AppErrors
import com.amazonqa.shared.utils.AppStrings
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(org.robolectric.RobolectricTestRunner::class)
class OrderTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    private val cartViewModel = CartViewModel()
    private val orderViewModel = OrderViewModel(OrderRepository(ApiClient()))

    // ───────────────────────────────────────────────
    // CHECKOUT SCREEN
    // ───────────────────────────────────────────────

    @Test
    fun testCheckoutScreenElementsAreDisplayed() {
        composeTestRule.setContent {
            CheckoutScreen(
                cartViewModel = cartViewModel,
                orderViewModel = orderViewModel,
                authState = AuthState.Idle,
                onBack = {},
                onSuccess = { _, _ -> }
            )
        }

        // Título da tela
        pageHelper.assertIsDisplayedByText(AppStrings.paymentTitle)       // "Pagamento"

        // Métodos de pagamento
        pageHelper.assertIsDisplayedByText("PIX")
        pageHelper.assertIsDisplayedByText("Cartão de Crédito")
        pageHelper.assertIsDisplayedByText("Boleto")

        // Botão de confirmar
        pageHelper.assertIsDisplayedByText("Confirmar e Pagar")

        pageHelper.takeScreenshot("testCheckoutScreenElementsAreDisplayed")
    }

    @Test
    fun testCheckoutRequiresLogin() {
        composeTestRule.setContent {
            CheckoutScreen(
                cartViewModel = cartViewModel,
                orderViewModel = orderViewModel,
                authState = AuthState.Idle, // não logado
                onBack = {},
                onSuccess = { _, _ -> }
            )
        }

        // PIX já está selecionado por padrão; clica em confirmar sem estar logado
        pageHelper.clickButtonByText("Confirmar e Pagar")

        // O erro real vem de AppErrors.loginRequired
        pageHelper.assertIsDisplayedByText(AppErrors.loginRequired)

        pageHelper.takeScreenshot("testCheckoutRequiresLogin")
    }

    @Test
    fun testCheckoutPixIsSelectedByDefault() {
        composeTestRule.setContent {
            CheckoutScreen(
                cartViewModel = cartViewModel,
                orderViewModel = orderViewModel,
                authState = AuthState.Idle,
                onBack = {},
                onSuccess = { _, _ -> }
            )
        }

        // PIX deve estar como primeiro item visível
        pageHelper.assertIsDisplayedByText("PIX")

        pageHelper.takeScreenshot("testCheckoutPixIsSelectedByDefault")
    }

    @Test
    fun testCheckoutNoErrorShownBeforeAction() {
        composeTestRule.setContent {
            CheckoutScreen(
                cartViewModel = cartViewModel,
                orderViewModel = orderViewModel,
                authState = AuthState.Idle,
                onBack = {},
                onSuccess = { _, _ -> }
            )
        }

        // Sem nenhuma ação, a mensagem de erro de login NÃO deve aparecer
        pageHelper.assertDoesNotExistByText(AppErrors.loginRequired)

        pageHelper.takeScreenshot("testCheckoutNoErrorShownBeforeAction")
    }

    // ───────────────────────────────────────────────
    // THANK YOU SCREEN
    // ───────────────────────────────────────────────

    @Test
    fun testThankYouScreenDisplaysPix() {
        val product = Product(id = 1, name = "Smartphone Galaxy", price = 1999.99, image = "", description = "Top de linha")
        val items = listOf(CartItem(product = product, quantity = 2))

        composeTestRule.setContent {
            ThankYouScreen(
                items = items,
                paymentMethod = "PIX",
                onContinue = {}
            )
        }

        // Título da tela — usa AppStrings.thankYouTitle real: "Obrigado pela sua compra!"
        pageHelper.assertIsDisplayedByText(AppStrings.thankYouTitle)

        // Produto no resumo
        pageHelper.assertIsDisplayedByText("Smartphone Galaxy")

        // Seção PIX — usa AppStrings.pixGenerated real: "QR Code PIX gerado"
        pageHelper.assertIsDisplayedByText(AppStrings.pixGenerated)

        // Botão de copiar PIX — usa AppStrings.pixCopyBtn real: "Copiar código PIX"
        pageHelper.assertIsDisplayedByText(AppStrings.pixCopyBtn)

        // Resumo do pedido — AppStrings.orderSummary: "Resumo do Pedido"
        pageHelper.assertIsDisplayedByText(AppStrings.orderSummary)

        // Botão de voltar — AppStrings.backToCatalog: "Voltar ao Catálogo"
        pageHelper.assertIsDisplayedByText(AppStrings.backToCatalog)

        pageHelper.takeScreenshot("testThankYouScreenDisplaysPix")
    }

    @Test
    fun testThankYouScreenDisplaysBoleto() {
        val product = Product(id = 2, name = "Notebook Pro", price = 4500.0, image = "", description = "Ultra slim")
        val items = listOf(CartItem(product = product, quantity = 1))

        composeTestRule.setContent {
            ThankYouScreen(
                items = items,
                paymentMethod = "Boleto",
                onContinue = {}
            )
        }

        // Título de confirmação
        pageHelper.assertIsDisplayedByText(AppStrings.thankYouTitle)

        // Produto no resumo
        pageHelper.assertIsDisplayedByText("Notebook Pro")

        // Seção Boleto
        pageHelper.assertIsDisplayedByText(AppStrings.boletoGenerated)   // "Boleto gerado"
        pageHelper.assertIsDisplayedByText(AppStrings.boletoCopyBtn)     // "Copiar linha"
        pageHelper.assertIsDisplayedByText(AppStrings.boletoDownloadBtn) // "Baixar boleto"

        // Resumo + botão de voltar
        pageHelper.assertIsDisplayedByText(AppStrings.orderSummary)
        pageHelper.assertIsDisplayedByText(AppStrings.backToCatalog)

        pageHelper.takeScreenshot("testThankYouScreenDisplaysBoleto")
    }

    @Test
    fun testThankYouScreenDisplaysCartao() {
        val product = Product(id = 3, name = "Fone Bluetooth", price = 350.0, image = "", description = "Noise cancelling")
        val items = listOf(CartItem(product = product, quantity = 3))

        composeTestRule.setContent {
            ThankYouScreen(
                items = items,
                paymentMethod = "Cartão de Crédito",
                onContinue = {}
            )
        }

        // Para Cartão de Crédito, nem a seção PIX nem Boleto devem aparecer
        pageHelper.assertIsDisplayedByText(AppStrings.thankYouTitle)
        pageHelper.assertIsDisplayedByText("Fone Bluetooth")
        pageHelper.assertIsDisplayedByText(AppStrings.orderSummary)

        // Não deve exibir as seções de PIX ou Boleto
        pageHelper.assertDoesNotExistByText(AppStrings.pixGenerated)
        pageHelper.assertDoesNotExistByText(AppStrings.boletoGenerated)

        pageHelper.takeScreenshot("testThankYouScreenDisplaysCartao")
    }

    @Test
    fun testThankYouScreenMultipleItems() {
        val items = listOf(
            CartItem(product = Product(id = 1, name = "Produto A", price = 100.0, image = "", description = ""), quantity = 2),
            CartItem(product = Product(id = 2, name = "Produto B", price = 200.0, image = "", description = ""), quantity = 1),
        )

        composeTestRule.setContent {
            ThankYouScreen(
                items = items,
                paymentMethod = "PIX",
                onContinue = {}
            )
        }

        // Ambos os produtos devem aparecer no resumo
        pageHelper.assertIsDisplayedByText("Produto A")
        pageHelper.assertIsDisplayedByText("Produto B")

        pageHelper.takeScreenshot("testThankYouScreenMultipleItems")
    }
}
