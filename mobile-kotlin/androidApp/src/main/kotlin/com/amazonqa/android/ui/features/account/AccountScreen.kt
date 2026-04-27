package com.amazonqa.android.ui.features.account

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amazonqa.android.ui.theme.AmazonDark
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import com.amazonqa.shared.presentation.AuthState
import com.amazonqa.shared.presentation.AccountViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountScreen(
    authState: AuthState,
    accountViewModel: AccountViewModel,
    onOrdersClick: () -> Unit,
    onEditProfile: () -> Unit,
    onEditAddress: () -> Unit,
    onCartClick: () -> Unit,
    onBack: () -> Unit,
    onLogout: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Minha conta") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AmazonDark,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp)) {
            // Load profile
            LaunchedEffect(Unit) { accountViewModel.loadProfile() }

            when (val state = accountViewModel.state.collectAsState().value) {
                is com.amazonqa.shared.presentation.AccountState.Loading -> CircularProgressIndicator(color = AmazonDark)
                is com.amazonqa.shared.presentation.AccountState.Success -> {
                    val profile = (state as com.amazonqa.shared.presentation.AccountState.Success).profile
                    Text("Olá, ${profile.first_name ?: profile.email}", fontSize = 20.sp)
                    Spacer(Modifier.height(8.dp))
                    Text(profile.email, color = Color.Gray)

                    Spacer(Modifier.height(24.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Card(modifier = Modifier.weight(1f).padding(8.dp).clickable { onOrdersClick() }, shape = RoundedCornerShape(8.dp)) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Meus pedidos", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                                Text("Acompanhe compras e status", color = Color.Gray)
                            }
                        }

                        Card(modifier = Modifier.weight(1f).padding(8.dp).clickable { onEditProfile() }, shape = RoundedCornerShape(8.dp)) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Meu perfil", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                                Text("Veja seus dados pessoais", color = Color.Gray)
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Card(modifier = Modifier.weight(1f).padding(8.dp).clickable { onEditAddress() }, shape = RoundedCornerShape(8.dp)) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Meu endereço", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                                Text("Consulte e edite endereço", color = Color.Gray)
                            }
                        }

                        Card(modifier = Modifier.weight(1f).padding(8.dp).clickable { onCartClick() }, shape = RoundedCornerShape(8.dp)) {
                            Column(Modifier.padding(16.dp)) {
                                Text("Carrinho", fontWeight = androidx.compose.ui.text.font.FontWeight.Bold)
                                Text("Revise itens antes de comprar", color = Color.Gray)
                            }
                        }
                    }
                }
                is com.amazonqa.shared.presentation.AccountState.Error -> {
                    val msg = (state as com.amazonqa.shared.presentation.AccountState.Error).message
                    Text(msg, color = Color.Red)
                }
                else -> {
                    if (authState !is AuthState.Success) Text("Você não está logado.")
                }
            }

            Spacer(Modifier.weight(1f))
            OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth()) {
                Text("Sair")
            }
        }
    }
}
