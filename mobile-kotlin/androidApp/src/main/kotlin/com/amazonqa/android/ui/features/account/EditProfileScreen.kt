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
import androidx.compose.ui.Alignment

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(accountViewModel: AccountViewModel, onBack: () -> Unit) {
    val state by accountViewModel.state.collectAsState()

    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }

    var initialized by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        accountViewModel.loadProfile()
    }

    LaunchedEffect(state) {
        if (state is AccountState.Success && !initialized) {
            val profile = (state as AccountState.Success).profile
            firstName = profile.first_name ?: ""
            lastName = profile.last_name ?: ""
            email = profile.email
            initialized = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Editar perfil") }, navigationIcon = {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null) }
            })
        }
    ) { padding ->
        if (state is AccountState.Loading && !initialized) {
            Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else {
            Column(modifier = Modifier.padding(padding).padding(16.dp)) {
                OutlinedTextField(value = firstName, onValueChange = { firstName = it }, label = { Text("Nome") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = lastName, onValueChange = { lastName = it }, label = { Text("Sobrenome") }, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("E-mail") }, modifier = Modifier.fillMaxWidth())

                Spacer(Modifier.height(16.dp))
                Button(onClick = {
                    val profileId = (state as? AccountState.Success)?.profile?.id
                    if (profileId != null) {
                        accountViewModel.updateProfile(profileId, mapOf("first_name" to firstName, "last_name" to lastName, "email" to email))
                    }
                }, modifier = Modifier.fillMaxWidth()) {
                    Text("Salvar")
                }
            }
        }
    }
}
