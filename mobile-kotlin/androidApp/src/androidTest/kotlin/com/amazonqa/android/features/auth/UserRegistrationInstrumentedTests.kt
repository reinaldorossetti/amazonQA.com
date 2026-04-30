package com.amazonqa.android.features.auth

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import com.amazonqa.android.MainActivity
import com.amazonqa.android.helpers.EspressoPageHelper
import com.amazonqa.shared.utils.AppStrings
import io.qameta.allure.android.runners.AllureAndroidJUnit4
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Testes instrumentados de Cadastro de Usuário com dados randômicos.
 * Utiliza Faker para dados pessoais e Stella para CPF/CNPJ válidos.
 */
@RunWith(AllureAndroidJUnit4::class)
class UserRegistrationInstrumentedTests {

    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    private lateinit var page: EspressoPageHelper

    @Before
    fun setup() {
        page = EspressoPageHelper(composeRule)
        page.waitForIdle()
    }

    @Test
    fun testUserRegistrationWithRandomData() {
        // 1. Navega da LoginScreen para a RegisterScreen
        page.clickButtonByText(AppStrings.loginRegister)
        page.waitForIdle()

        // 2. Dados de teste estáveis
        val cpf = page.generateValidCPF()
        val email = "test_${System.currentTimeMillis()}@tester.com"
        val password = "StrongPassword123!"

        // 3. Preenche o formulário (Etapa 1)
        page.typeText("register_firstname_field", "Teste")
        page.typeText("register_lastname_field", "Usuario")
        page.typeText("register_cpf_field", cpf)
        page.typeText("register_email_field", email)
        page.typeText("register_phone_field", "(11) 99999-8888")
        page.typeText("register_password_field", password)
        page.typeText("register_confirm_password_field", password)

        // 4. Vai para a Etapa 2
        page.clickButtonByTag("register_submit_button")
        page.waitForIdle()

        // 5. Preenche Endereço (Etapa 2)
        page.typeText("register_cep_field", "01310-930") // Av. Paulista
        page.waitForIdle()
        // O preenchimento automático deve ocorrer, mas podemos forçar ou validar
        page.typeText("register_number_field", "1000")
        
        // 6. Captura screenshot do formulário preenchido
        page.takeScreenshot("testUserRegistration_Step2_Filled")

        // 7. Submete o cadastro final
        page.clickButtonByTag("register_submit_button")
        
        try {
            // 8. Valida a mudança de tela para o Catálogo (Home)
            page.waitUntil(20000) { 
                composeRule.onAllNodesWithTag("amazon_header_logo").fetchSemanticsNodes().isNotEmpty() 
            }
            page.assertIsDisplayedByTag("amazon_header_logo")
        } finally {
            page.takeScreenshot("testUserRegistration_Final")
        }
    }
    
    @Test
    fun testUserRegistrationAsPJWithRandomData() {
        page.clickButtonByText(AppStrings.loginRegister)
        page.waitForIdle()

        page.clickButtonByText("Pessoa Jurídica (CNPJ)")
        page.waitForIdle()

        val cnpj = page.generateValidCNPJ()
        val email = "pj_${System.currentTimeMillis()}@tester.com"
        val password = "CompanyPassword123!"

        page.typeText("register_firstname_field", "Empresa")
        page.typeText("register_lastname_field", "Teste")
        page.typeText("register_cpf_field", cnpj)
        page.typeText("register_email_field", email)
        page.typeText("register_phone_field", "(11) 99999-8888")
        page.typeText("register_password_field", password)
        page.typeText("register_confirm_password_field", password)

        // Próximo
        page.clickButtonByTag("register_submit_button")
        page.waitForIdle()

        // Endereço
        page.typeText("register_cep_field", "01310-930")
        page.typeText("register_number_field", "500")

        page.takeScreenshot("testUserRegistrationAsPJ_Step2_Filled")

        page.clickButtonByTag("register_submit_button")

        try {
            page.waitUntil(20000) { 
                composeRule.onAllNodesWithTag("amazon_header_logo").fetchSemanticsNodes().isNotEmpty() 
            }
            page.assertIsDisplayedByTag("amazon_header_logo")
        } finally {
            page.takeScreenshot("testUserRegistrationAsPJ_Final")
        }
    }

    @Test
    fun testCepAutoFillValidation() {
        // 1. Navega para Register e preenche Step 1 rápido para chegar no Step 2
        page.clickButtonByText(AppStrings.loginRegister)
        page.typeText("register_firstname_field", "CEP")
        page.typeText("register_lastname_field", "Test")
        page.typeText("register_cpf_field", page.generateValidCPF())
        page.typeText("register_email_field", "cep_test@test.com")
        page.typeText("register_phone_field", "11999998888")
        page.typeText("register_password_field", "12345678")
        page.typeText("register_confirm_password_field", "12345678")
        
        page.clickButtonByTag("register_submit_button")
        page.waitForIdle()

        // 2. Testa o CEP
        val testCep = "01310930" // Av Paulista
        page.typeText("register_cep_field", testCep)
        
        // 3. Aguarda o preenchimento automático (API ViaCEP)
        // Aguarda até que o campo rua seja preenchido com o texto esperado
        page.waitUntil(15000) {
            try {
                page.assertTextEquals("register_street_field", "Avenida Paulista")
                true
            } catch (e: Exception) {
                false
            }
        }
        page.waitForIdle()

        // 4. Valida se os campos foram preenchidos
        // Esperado para 01310-930: Avenida Paulista, São Paulo, SP
        page.assertTextEquals("register_street_field", "Avenida Paulista")
        page.assertTextEquals("register_city_field", "São Paulo")
        page.assertTextEquals("register_state_field", "SP")
        
        page.takeScreenshot("testCepAutoFill_Success")
    }
}
