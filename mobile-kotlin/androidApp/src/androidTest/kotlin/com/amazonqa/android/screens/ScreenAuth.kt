package com.amazonqa.android.screens

import com.amazonqa.android.helpers.EspressoPageHelper
import com.amazonqa.shared.utils.AppStrings
import com.amazonqa.shared.utils.AppErrors

/**
 * Page Object para telas de autenticação (Login / Registro) usado em testes instrumentados.
 * Fornece métodos de nível de negócio (ATDD) para descrever intenções do usuário.
 *
 * Em ATDD preferimos métodos de alto nível que representem ações/intenções de negócio
 * (ex: login) em vez de expor detalhes de implementação diretamente nos testes.
 */
class ScreenAuth(private val page: EspressoPageHelper) {

    companion object {
        // Tags usadas nos componentes Compose (conforme convensão dos testes)
        const val EMAIL_FIELD_TAG = "login_email_field"
        const val PASSWORD_FIELD_TAG = "login_password_field"
    }

    /**
     * Ação de negócio: preencher o identificador do usuário (e-mail ou telefone).
     * Normaliza o input e suporta a palavra-chave especial "RANDOM_EMAIL" para cenários ATDD.
     */
    fun enterEmail(email: String): ScreenAuth {
        val normalized = email.trim()
        val final = if (normalized.equals("RANDOM_EMAIL", ignoreCase = true)) {
            page.generateRandomEmail()
        } else {
            normalized
        }
        page.typeText(EMAIL_FIELD_TAG, final)
        return this
    }

    /**
     * Ação de negócio: preencher a senha do usuário. Encapsula a lógica de input.
     */
    fun enterPassword(password: String): ScreenAuth {
        val final = password.trim()
        page.typeText(PASSWORD_FIELD_TAG, final)
        return this
    }

    /** Clica no botão Continuar usando a string centralizada de UI. */
    fun clickContinue(buttonText: String = AppStrings.loginContinue) {
        page.clickButtonByText(buttonText)
        page.waitForIdle()
    }

    /** Clica em Entrar como visitante (skip). */
    fun clickSkip(buttonText: String = AppStrings.loginSkip) {
        page.clickButtonByText(buttonText)
        page.waitForIdle()
    }

    /** Navega para a tela de cadastro a partir da tela de login. */
    fun navigateToRegister(buttonText: String = AppStrings.loginRegister) {
        page.clickButtonByText(buttonText)
        page.waitForIdle()
    }

    fun performImeOnEmail() { page.performImeAction(EMAIL_FIELD_TAG) }
    fun performImeOnPassword() { page.performImeAction(PASSWORD_FIELD_TAG) }

    /**
     * Ação de alto nível: realiza o fluxo de login no sistema.
     * Método pensado para ATDD: descreve a intenção "fazer login como X".
     * Se `expectedSuccessText` for fornecido, valida a tela subsequente.
     */
    fun fillLoginForm(email: String, password: String): ScreenAuth {
        enterEmail(email)
        performImeOnEmail()
        enterPassword(password)
        performImeOnPassword()
        return this
    }

    /**
     * Confirma que o login foi realizado com sucesso e valida a tela inicial.
     * Por padrão valida o header da app (`amazon_header_logo`) que indica que
     * navegamos ao catálogo (tela inicial).
     */
    fun confirmLoginSuccess(expectedScreenTag: String = "amazon_header_logo"): ScreenAuth {
        // Submete o formulário
        clickContinue()

        // Aguarda a UI estabilizar e valida a presença do elemento da tela inicial
        page.waitForIdle()
        page.assertIsDisplayedByTag(expectedScreenTag)

        return this
    }

    // ─────────────────────────────────────────────────────────────
    // Asserções e helpers de alto nível (ATDD)
    // ─────────────────────────────────────────────────────────────

    fun assertLoginScreenIsDisplayed() {
        page.assertIsDisplayedByText(AppStrings.loginEmail)
        page.assertIsDisplayedByText(AppStrings.loginPassword)
        page.assertIsDisplayedByText(AppStrings.loginContinue)
        page.assertIsDisplayedByText(AppStrings.loginSkip)
    }

    /** Asserção mais específica: apenas o campo de e-mail está visível. Útil em cenários pós-submit. */
    fun assertEmailFieldIsDisplayed() {
        page.assertIsDisplayedByText(AppStrings.loginEmail)
    }

    fun assertNoInitialErrorMessages() {
        // Mantém as mesmas checagens que os testes originais
        page.assertDoesNotExistByText(AppErrors.authInvalidCredentials)
        page.assertDoesNotExistByText("Erro de conexão")
    }

    // Register flow helpers
    fun assertRegisterFormDisplayed() {
        page.assertIsDisplayedByText("Nome *")
        page.assertIsDisplayedByText("Sobrenome *")
        page.assertIsDisplayedByText("CPF *")
        page.assertIsDisplayedByText("Email *")
        page.assertIsDisplayedByText("Senha *")
    }

    fun assertRegisterPFTabIsSelectedByDefault() {
        page.assertIsDisplayedByText("Pessoa Física (CPF)")
        page.assertIsDisplayedByText("CPF *")
    }

    fun switchToPJTab() {
        page.clickButtonByText("Pessoa Jurídica (CNPJ)")
        page.waitForIdle()
    }

    fun assertCnpjFieldDisplayed() { page.assertIsDisplayedByText("CNPJ *") }

    fun clickNextAddress() {
        page.clickButtonByText("Próximo: Endereço")
        page.waitForIdle()
    }

    fun assertRegisterValidationShowsErrors() { page.assertIsDisplayedByText("Campo obrigatório") }

    fun assertErrorShown(errorMessage: String) { page.assertIsDisplayedByText(errorMessage) }
    fun assertNoErrorShown(errorMessage: String) { page.assertDoesNotExistByText(errorMessage) }

    fun takeScreenshot(name: String) { page.takeScreenshot(name) }
}
