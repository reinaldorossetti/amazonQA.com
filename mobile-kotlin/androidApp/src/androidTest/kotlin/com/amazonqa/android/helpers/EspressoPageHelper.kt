package com.amazonqa.android.helpers

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.AndroidComposeTestRule
import androidx.test.ext.junit.rules.ActivityScenarioRule
import com.amazonqa.android.MainActivity
import io.github.serpro69.kfaker.Faker
import androidx.compose.ui.graphics.asAndroidBitmap
import io.qameta.allure.kotlin.Allure
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

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
    private val faker = Faker()

    // ─────────────────────────────────────────────
    // Ações de Input
    // ─────────────────────────────────────────────

    fun typeText(testTag: String, text: String) {
        val node = rule.onNodeWithTag(testTag)
        try { node.performScrollTo() } catch (_: Throwable) {}
        node.performTextReplacement(text)
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

    fun performImeAction(testTag: String) {
        rule.onNodeWithTag(testTag).performImeAction()
    }

    // ─────────────────────────────────────────────
    // Geração de Dados Randômicos
    // ─────────────────────────────────────────────

    fun generateRandomFirstName() = faker.name.firstName()
    fun generateRandomLastName() = faker.name.lastName()
    fun generateRandomEmail() = "${faker.name.firstName().lowercase()}@${faker.internet.domain()}"
    fun generateRandomPhone() = "(11) 9${faker.random.nextInt(1000, 9999)}-${faker.random.nextInt(1000, 9999)}"

    fun generateValidCPF(): String {
        val num = (1..9).map { (0..9).random() }.toMutableList()
        fun digit(n: List<Int>): Int {
            val d = (n.indices.sumOf { n[it] * (n.size + 1 - it) } % 11)
            return if (d < 2) 0 else 11 - d
        }
        num.add(digit(num))
        num.add(digit(num))
        return num.joinToString("")
    }

    fun generateValidCNPJ(): String {
        val num = (1..12).map { (0..9).random() }.toMutableList()
        fun digit(n: List<Int>, weights: IntArray): Int {
            val d = (n.indices.sumOf { n[it] * weights[it] } % 11)
            return if (d < 2) 0 else 11 - d
        }
        val w1 = intArrayOf(5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
        val w2 = intArrayOf(6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2)
        num.add(digit(num, w1))
        num.add(digit(num, w2))
        return num.joinToString("")
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

    fun assertTextEquals(testTag: String, expectedText: String) {
        rule.onNodeWithTag(testTag).assertTextEquals(expectedText)
    }

    fun assertDoesNotExistByText(text: String) {
        rule.onAllNodesWithText(text, ignoreCase = true).assertCountEquals(0)
    }

    fun assertDoesNotExistByTag(testTag: String) {
        rule.onAllNodesWithTag(testTag).assertCountEquals(0)
    }

    /** Tira screenshot da tela atual e anexa ao Allure Report */
    fun takeScreenshot(fileName: String) {
        rule.waitForIdle()
        try {
            val bitmap = rule.onRoot().captureToImage().asAndroidBitmap()
            val baos = ByteArrayOutputStream()
            bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, baos)
            val pngBytes = baos.toByteArray()

            Allure.attachment(
                name = fileName,
                type = "image/png",
                content = ByteArrayInputStream(pngBytes),
                fileExtension = "png"
            )
            println("Screenshot captured and attached: $fileName")
        } catch (e: Throwable) {
            println("Failed to capture screenshot: ${e.message}")
        }
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
