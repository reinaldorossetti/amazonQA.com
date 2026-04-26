package com.amazonqa.android.features.catalog

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
 * Testes instrumentados do Catálogo — executados no EMULADOR via Espresso.
 *
 * Pré-requisito: o app deve navegar à CatalogScreen ao entrar como visitante.
 *
 * Execução:
 *   ./gradlew :androidApp:connectedDebugAndroidTest \
 *     -Pandroid.testInstrumentationRunnerArguments.class=com.amazonqa.android.features.catalog.CatalogInstrumentedTests
 */
@RunWith(AndroidJUnit4::class)
class CatalogInstrumentedTests {

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
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATALOG SCREEN
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    fun testCatalogHeaderLogoIsDisplayed() {
        page.assertIsDisplayedByTag("amazon_header_logo")
    }

    @Test
    fun testCatalogScreenRendersWithoutCrashing() {
        // Verifica que pelo menos o header aparece — se chegou aqui, não crashou
        page.assertIsDisplayedByTag("amazon_header_logo")
    }

    @Test
    fun testEmptyCartShowsZeroBadge() {
        // Badge colorido (tag "cart_badge_count") NÃO deve existir quando o carrinho está vazio
        page.assertDoesNotExistByTag("cart_badge_count")
    }
}
