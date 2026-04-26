package com.amazonqa.android.features.admin

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.helpers.PageHelper
import com.amazonqa.android.ui.features.admin.AdminProductsScreen
import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.ProductRepository
import com.amazonqa.shared.presentation.AdminProductsViewModel
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(org.robolectric.RobolectricTestRunner::class)
class AdminProductsTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    private val adminProductsViewModel = AdminProductsViewModel(ProductRepository(ApiClient()))

    private fun setScreen() {
        composeTestRule.setContent {
            AdminProductsScreen(
                viewModel = adminProductsViewModel,
                onNavigateBack = {}
            )
        }
    }

    // ───────────────────────────────────────────────
    // TELA PRINCIPAL
    // ───────────────────────────────────────────────

    @Test
    fun testAdminProductsScreenTitleIsDisplayed() {
        setScreen()

        pageHelper.assertIsDisplayedByText("Admin Produtos")

        pageHelper.takeScreenshot("testAdminProductsScreenTitleIsDisplayed")
    }

    @Test
    fun testAdminProductsScreenRendersWithoutCrash() {
        setScreen()
        composeTestRule.waitForIdle()

        pageHelper.assertIsDisplayedByText("Admin Produtos")

        pageHelper.takeScreenshot("testAdminProductsScreenRendersWithoutCrash")
    }

    // ───────────────────────────────────────────────
    // DIALOG: NOVO PRODUTO
    // ───────────────────────────────────────────────

    @Test
    fun testAdminNewProductDialogOpens() {
        setScreen()

        // FAB "Novo Produto"
        pageHelper.clickContentDescription("Novo Produto")

        // Dialog deve abrir com todos os campos
        pageHelper.assertIsDisplayedByText("Novo Produto")
        pageHelper.assertIsDisplayedByText("Nome")
        pageHelper.assertIsDisplayedByText("Preço")
        pageHelper.assertIsDisplayedByText("Salvar")
        pageHelper.assertIsDisplayedByText("Cancelar")

        pageHelper.takeScreenshot("testAdminNewProductDialogOpens")
    }

    @Test
    fun testAdminNewProductDialogClosesOnCancel() {
        setScreen()

        // Abre o dialog
        pageHelper.clickContentDescription("Novo Produto")
        pageHelper.assertIsDisplayedByText("Salvar")

        // Cancela
        pageHelper.clickButtonByText("Cancelar")

        // Dialog deve ter fechado — "Salvar" não deve existir
        pageHelper.assertDoesNotExistByText("Salvar")

        pageHelper.takeScreenshot("testAdminNewProductDialogClosesOnCancel")
    }

    @Test
    fun testAdminProductsScreenElements() {
        setScreen()

        pageHelper.assertIsDisplayedByText("Admin Produtos")

        // Abre e verifica o dialog completo
        pageHelper.clickContentDescription("Novo Produto")

        pageHelper.assertIsDisplayedByText("Novo Produto")
        pageHelper.assertIsDisplayedByText("Nome")
        pageHelper.assertIsDisplayedByText("Preço")
        pageHelper.assertIsDisplayedByText("Salvar")
        pageHelper.assertIsDisplayedByText("Cancelar")

        pageHelper.clickButtonByText("Cancelar")

        pageHelper.assertDoesNotExistByText("Salvar")

        pageHelper.takeScreenshot("testAdminProductsScreenElements")
    }
}
