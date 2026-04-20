package com.amazonqa.android.ui.features.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amazonqa.android.ui.theme.*
import com.amazonqa.shared.presentation.*
import com.amazonqa.shared.utils.AppErrors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(authState: AuthState, orderViewModel: OrderViewModel, onBack: () -> Unit, onLogout: () -> Unit) {
    val orderState by orderViewModel.state.collectAsState()

    LaunchedEffect(Unit) {
        orderViewModel.loadOrders()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Seu Perfil") },
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
        Column(modifier = Modifier.padding(padding).fillMaxSize().padding(24.dp)) {
            when (authState) {
                is AuthState.Success -> {
                    Text("Olá, ${authState.user.name}", style = MaterialTheme.typography.headlineSmall)
                    Text(authState.user.email, color = Color.Gray)
                    Spacer(Modifier.height(32.dp))
                    Text("Seus Pedidos", fontWeight = FontWeight.Bold)
                    
                    Spacer(Modifier.height(16.dp))

                    when (val state = orderState) {
                        is OrderState.Loading -> CircularProgressIndicator(color = AmazonOrange)
                        is OrderState.Success -> {
                            if (state.orders.isEmpty()) {
                                Text("Você ainda não possui pedidos.", color = Color.Gray)
                            } else {
                                LazyColumn {
                                    items(state.orders) { order ->
                                        Card(
                                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                            colors = CardDefaults.cardColors(containerColor = Color.White),
                                            border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray)
                                        ) {
                                            Column(Modifier.padding(12.dp)) {
                                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                                    Text("Pedido #${order.id ?: "..."}", fontWeight = FontWeight.Bold)
                                                    Text(order.status.uppercase(), color = if(order.status == "paid") Color(0xFF008a00) else Color.Gray, fontSize = 12.sp)
                                                }
                                                Text("Total: R$ ${order.total}", fontSize = 14.sp)
                                                Text("Data: ${order.createdAt?.split("T")?.get(0) ?: "Hoje"}", fontSize = 12.sp, color = Color.Gray)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        is OrderState.Error -> Text(state.message, color = Color.Red)
                        else -> {}
                    }
                }
                else -> {
                    Text("Você não está logado.")
                }
            }
            
            Spacer(Modifier.weight(1f))
            OutlinedButton(
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Sair da conta")
            }
        }
    }
}
