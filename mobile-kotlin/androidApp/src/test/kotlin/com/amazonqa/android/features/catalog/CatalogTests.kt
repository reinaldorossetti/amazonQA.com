package com.amazonqa.android.features.catalog

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.helpers.PageHelper
import com.amazonqa.android.ui.features.catalog.CatalogScreen
import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.OrderRepository
import com.amazonqa.shared.data.repository.ProductRepository
import com.amazonqa.shared.presentation.CartViewModel
import com.amazonqa.shared.presentation.CatalogViewModel
import com.amazonqa.shared.presentation.OrderViewModel
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(org.robolectric.RobolectricTestRunner::class)
class CatalogTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    private val apiClient = ApiClient()
    private val catalogViewModel = CatalogViewModel(ProductRepository(apiClient))
    private val cartViewModel = CartViewModel()
    private val orderViewModel = OrderViewModel(OrderRepository(apiClient))

    private fun setScreen() {
        composeTestRule.setContent {
            CatalogScreen(
                viewModel = catalogViewModel,
                cartViewModel = cartViewModel,
                orderViewModel = orderViewModel,
                onNavigateToCart = {},
                onNavigateToProfile = {},
                onLogout = {}
            )
        }
    }

    // ───────────────────────────────────────────────
    // HEADER
    // ───────────────────────────────────────────────

    @Test
    fun testCatalogHeaderLogoIsDisplayed() {
        setScreen()

        // O logo Amazon deve estar visível via testTag
        pageHelper.assertIsDisplayedByTag("amazon_header_logo")

        pageHelper.takeScreenshot("testCatalogHeaderLogoIsDisplayed")
    }

    // ───────────────────────────────────────────────
    // CART BADGE
    // ───────────────────────────────────────────────

    @Test
    fun testEmptyCartShowsZeroBadge() {
        setScreen()

        // Com o carrinho vazio, o badge colorido NÃO deve aparecer
        // (o badge com count > 0 só é exibido quando cartItemCount > 0)
        pageHelper.assertDoesNotExistByText("cart_badge_count")

        pageHelper.takeScreenshot("testEmptyCartShowsZeroBadge")
    }

    @Test
    fun testCartBadgeUpdatesAfterAddingItem() {
        setScreen()

        // Adiciona um produto diretamente ao cartViewModel
        val product = com.amazonqa.shared.domain.models.Product(
            id = 1, name = "Produto Teste", price = 99.99, image = "", description = ""
        )
        cartViewModel.addToCart(product)

        // Força recomposição
        composeTestRule.waitForIdle()

        // Badge com count > 0 deve estar presente
        pageHelper.assertIsDisplayedByTag("cart_badge_count")

        pageHelper.takeScreenshot("testCartBadgeUpdatesAfterAddingItem")
    }

    // ───────────────────────────────────────────────
    // ESTADO DE LOADING / CONTEÚDO
    // ───────────────────────────────────────────────

    @Test
    fun testCatalogScreenRendersWithoutCrashing() {
        // Verifica que a tela renderiza sem crash algum
        setScreen()
        composeTestRule.waitForIdle()

        // Pelo menos o header deve estar na tela
        pageHelper.assertIsDisplayedByTag("amazon_header_logo")

        pageHelper.takeScreenshot("testCatalogScreenRendersWithoutCrashing")
    }
}
