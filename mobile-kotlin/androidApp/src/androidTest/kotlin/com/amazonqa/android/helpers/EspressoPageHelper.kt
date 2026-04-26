package com.amazonqa.android.helpers

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.AndroidComposeTestRule
import androidx.test.ext.junit.rules.ActivityScenarioRule
import com.amazonqa.android.MainActivity

/**
 * Page Object helper para testes instrumentados (Espresso + Compose UI Test).
 * Executados no emulador/dispositivo real via `./gradlew connectedDebugAndroidTest`.
 *
 * Diferente do PageHelper de testes unitários (Robolectric/JVM), esta versão:
 * - Usa [AndroidComposeTestRule] que encapsula um [ActivityScenarioRule<MainActivity>]
 * - Interage com a app **real** rodando no emulador
 * - Suporta captura de screenshot via [captureToImage]
 */
class EspressoPageHelper(
    private val rule: AndroidComposeTestRule<ActivityScenarioRule<MainActivity>, MainActivity>
) {

    // ─────────────────────────────────────────────
    // Ações de Input
    // ─────────────────────────────────────────────

    fun typeText(testTag: String, text: String) {
        val node = rule.onNodeWithTag(testTag)
        try { node.performScrollTo() } catch (_: Throwable) {}
        node.performTextInput(text)
    }

    fun clickButtonByText(text: String) {
        val node = rule.onAllNodesWithText(text, ignoreCase = true).onFirst()
        try { node.performScrollTo() } catch (_: Throwable) {}
        node.performClick()
    }

    fun clickButtonByTag(testTag: String) {
        val node = rule.onNodeWithTag(testTag)
        try { node.performScrollTo() } catch (_: Throwable) {}
        node.performClick()
    }

    fun clickContentDescription(desc: String) {
        rule.onNodeWithContentDescription(desc).performClick()
    }

    // ─────────────────────────────────────────────
    // Asserções
    // ─────────────────────────────────────────────

    fun assertIsDisplayedByText(text: String) {
        val nodes = rule.onAllNodesWithText(text, ignoreCase = true)
        if (nodes.fetchSemanticsNodes().isNotEmpty()) {
            val node = nodes.onFirst()
            try { node.performScrollTo() } catch (_: Throwable) {}
            node.assertIsDisplayed()
        } else {
            nodes.onFirst().assertIsDisplayed() // falha com mensagem clara
        }
    }

    fun assertIsDisplayedByTag(testTag: String) {
        rule.onNodeWithTag(testTag).assertIsDisplayed()
    }

    fun assertDoesNotExistByText(text: String) {
        rule.onAllNodesWithText(text, ignoreCase = true).assertCountEquals(0)
    }

    fun assertDoesNotExistByTag(testTag: String) {
        rule.onAllNodesWithTag(testTag).assertCountEquals(0)
    }

    // ─────────────────────────────────────────────
    // Utilitários
    // ─────────────────────────────────────────────

    /** Aguarda a UI estabilizar (útil após animações ou mudanças de estado). */
    fun waitForIdle() {
        rule.waitForIdle()
    }

    /** Aguarda até que uma condição seja satisfeita (timeout padrão: 5s). */
    fun waitUntil(timeoutMillis: Long = 5_000L, condition: () -> Boolean) {
        rule.waitUntil(timeoutMillis) { condition() }
    }
}
