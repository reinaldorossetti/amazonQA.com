package com.amazonqa.android.helpers

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.ComposeContentTestRule
import androidx.compose.ui.graphics.asAndroidBitmap
import io.qameta.allure.Allure
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

/**
 * Utilitário global para testes de UI com Compose e Espresso semantics.
 * Aplica o padrão Page Object no ecossistema Compose.
 *
 * Funcionalidades:
 * - Interações de UI (clique, digitação)
 * - Asserções semânticas (por texto, testTag, contentDescription)
 * - Captura de screenshot com anexo automático ao Allure Report
 */
class PageHelper(private val composeTestRule: ComposeContentTestRule) {

    // ─────────────────────────────────────────────
    // Ações de Input
    // ─────────────────────────────────────────────

    fun typeText(testTag: String, text: String) {
        val node = composeTestRule.onNodeWithTag(testTag)
        try { node.performScrollTo() } catch (e: Throwable) {}
        node.performTextInput(text)
    }

    fun clickButtonByText(text: String) {
        val node = composeTestRule.onAllNodesWithText(text, ignoreCase = true).onFirst()
        try { node.performScrollTo() } catch (e: Throwable) {}
        node.performClick()
    }

    fun clickButtonByTag(testTag: String) {
        val node = composeTestRule.onNodeWithTag(testTag)
        try { node.performScrollTo() } catch (e: Throwable) {}
        node.performClick()
    }

    fun clickContentDescription(desc: String) {
        composeTestRule.onNodeWithContentDescription(desc).performClick()
    }

    // ─────────────────────────────────────────────
    // Asserções
    // ─────────────────────────────────────────────

    fun assertIsDisplayedByText(text: String) {
        val nodes = composeTestRule.onAllNodesWithText(text, ignoreCase = true)
        if (nodes.fetchSemanticsNodes().isNotEmpty()) {
            val node = nodes.onFirst()
            try { node.performScrollTo() } catch (e: Throwable) {}
            node.assertIsDisplayed()
        } else {
            nodes.onFirst().assertIsDisplayed() // falha com mensagem clara
        }
    }

    fun assertIsDisplayedByTag(testTag: String) {
        composeTestRule.onNodeWithTag(testTag).assertIsDisplayed()
    }

    fun assertDoesNotExistByText(text: String) {
        composeTestRule.onAllNodesWithText(text, ignoreCase = true).assertCountEquals(0)
    }

    // ─────────────────────────────────────────────
    // Captura de Tela + Anexo ao Allure
    // ─────────────────────────────────────────────

    /**
     * Captura o estado atual da UI como PNG e:
     * 1. Salva em disco em build/reports/screenshots/<fileName>.png
     * 2. Anexa ao relatório Allure como "Screenshot" (visível inline no relatório)
     *
     * Caso a captura falhe (ex: ambiente sem suporte a NATIVE graphics),
     * o erro é tratado silenciosamente para não quebrar o teste.
     */
    fun takeScreenshot(fileName: String) {
        try {
            composeTestRule.mainClock.autoAdvance = false
            composeTestRule.mainClock.advanceTimeBy(100)

            val bitmap = composeTestRule.onRoot().captureToImage().asAndroidBitmap()

            // 1. Serializa o bitmap em memória como PNG
            val baos = ByteArrayOutputStream()
            bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, baos)
            val pngBytes = baos.toByteArray()

            // 2. Salva em disco
            val dir = java.io.File("build/reports/screenshots")
            if (!dir.exists()) dir.mkdirs()
            val file = java.io.File(dir, "$fileName.png")
            file.writeBytes(pngBytes)
            println("Screenshot saved: ${file.absolutePath}")

            // 3. Anexa ao Allure Report (aparece inline na aba "Test Body")
            Allure.addAttachment(
                fileName,           // nome do anexo exibido no relatório
                "image/png",        // MIME type — Allure renderiza como imagem
                ByteArrayInputStream(pngBytes),
                "png"               // extensão do arquivo
            )

        } catch (e: Throwable) {
            println("Failed to capture screenshot: ${e.message}")
        } finally {
            composeTestRule.mainClock.autoAdvance = true
        }
    }
}
