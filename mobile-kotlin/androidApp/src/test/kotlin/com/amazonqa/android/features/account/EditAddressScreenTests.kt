package com.amazonqa.android.features.account

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.amazonqa.android.helpers.PageHelper
import com.amazonqa.android.ui.features.account.EditAddressScreen
import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.UserRepository
import com.amazonqa.shared.domain.models.UserAddress
import com.amazonqa.shared.domain.models.UserProfile
import com.amazonqa.shared.presentation.AccountState
import com.amazonqa.shared.presentation.AccountViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(org.robolectric.RobolectricTestRunner::class)
class EditAddressScreenTests {

    @get:Rule
    val composeTestRule = createComposeRule()

    private val pageHelper = PageHelper(composeTestRule)

    @Test
    fun testEditAddressScreenPopulatesDataCorrectly() {
        val apiClient = ApiClient()
        val userRepository = UserRepository(apiClient)
        val viewModel = AccountViewModel(userRepository)

        // Usando reflection para simular o estado de sucesso (evita chamadas reais de rede no teste)
        val stateField = AccountViewModel::class.java.getDeclaredField("_state")
        stateField.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val stateFlow = stateField.get(viewModel) as MutableStateFlow<AccountState>

        // Mock address data
        val mockAddress = UserAddress(
            address_zip = "12345-678",
            address_street = "Rua de Teste",
            address_number = "100",
            address_complement = "Apto 2",
            address_neighborhood = "Bairro Falso",
            address_city = "Cidade Falsa",
            address_state = "SP"
        )

        stateFlow.value = AccountState.AddressSuccess(mockAddress)

        composeTestRule.setContent {
            EditAddressScreen(
                accountViewModel = viewModel,
                onBack = {}
            )
        }

        // Verifica se os campos foram preenchidos corretamente na tela
        pageHelper.assertIsDisplayedByText("12345-678")
        pageHelper.assertIsDisplayedByText("Rua de Teste")
        pageHelper.assertIsDisplayedByText("100")
        pageHelper.assertIsDisplayedByText("Apto 2")
        pageHelper.assertIsDisplayedByText("Bairro Falso")
        pageHelper.assertIsDisplayedByText("Cidade Falsa")
        pageHelper.assertIsDisplayedByText("SP")

        pageHelper.takeScreenshot("testEditAddressScreenPopulatesDataCorrectly")
    }
}
