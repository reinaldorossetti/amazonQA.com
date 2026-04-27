package com.amazonqa.android.ui.features.account

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.amazonqa.shared.presentation.AccountViewModel
import com.amazonqa.shared.presentation.AccountState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.Alignment

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditAddressScreen(accountViewModel: AccountViewModel, onBack: () -> Unit) {
    val state by accountViewModel.state.collectAsState()

    var zip by remember { mutableStateOf("") }
    var street by remember { mutableStateOf("") }
    var number by remember { mutableStateOf("") }
    var complement by remember { mutableStateOf("") }
    var neighborhood by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var stateField by remember { mutableStateOf("") }

    // Always request a fresh profile when the screen is shown
    var initialized by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        accountViewModel.loadAddress()
    }

    LaunchedEffect(state) {
        val currentState = state
        if (currentState is AccountState.AddressSuccess) {
            val address = currentState.address
            if (!initialized || (zip.isEmpty() && street.isEmpty())) {
                zip = address.address_zip ?: ""
                street = address.address_street ?: ""
                number = address.address_number ?: ""
                complement = address.address_complement ?: ""
                neighborhood = address.address_neighborhood ?: ""
                city = address.address_city ?: ""
                stateField = address.address_state ?: ""
                initialized = true
            }
        } else if (currentState is AccountState.Success) {
            val profile = currentState.profile
            if (!initialized || (zip.isEmpty() && street.isEmpty())) {
                zip = profile.address_zip ?: ""
                street = profile.address_street ?: ""
                number = profile.address_number ?: ""
                complement = profile.address_complement ?: ""
                neighborhood = profile.address_neighborhood ?: ""
                city = profile.address_city ?: ""
                stateField = profile.address_state ?: ""
                initialized = true
            }
        }
    }

    Scaffold(topBar = {
        TopAppBar(title = { Text("Editar endereço") }, navigationIcon = {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) }
        })
    }) { padding ->
        if (state is AccountState.Loading && !initialized) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            Column(modifier = Modifier.padding(padding).padding(16.dp).verticalScroll(rememberScrollState())) {
                OutlinedTextField(value = zip, onValueChange = { zip = it }, label = { Text("CEP") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = street, onValueChange = { street = it }, label = { Text("Rua") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = number, onValueChange = { number = it }, label = { Text("Número") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = complement, onValueChange = { complement = it }, label = { Text("Complemento") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = neighborhood, onValueChange = { neighborhood = it }, label = { Text("Bairro") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = city, onValueChange = { city = it }, label = { Text("Cidade") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = stateField, onValueChange = { stateField = it }, label = { Text("Estado") }, modifier = Modifier.fillMaxWidth())

                Spacer(Modifier.height(16.dp))
                Button(onClick = {
                    val body = mapOf(
                        "address_zip" to zip,
                        "address_street" to street,
                        "address_number" to number,
                        "address_complement" to complement,
                        "address_neighborhood" to neighborhood,
                        "address_city" to city,
                        "address_state" to stateField
                    )
                    accountViewModel.updateAddress(body)
                    // Feedback and navigation could be added here, but staying focused on the pre-fill task
                }, modifier = Modifier.fillMaxWidth()) {
                    Text("Salvar endereço")
                }
            }
        }
    }
}
