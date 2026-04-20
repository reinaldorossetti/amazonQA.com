package com.amazonqa.android.ui.features.cart

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.amazonqa.android.ui.theme.*
import com.amazonqa.shared.presentation.*
import com.amazonqa.shared.utils.toBrazilianCurrency

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(viewModel: CartViewModel, onBack: () -> Unit, onCheckout: () -> Unit) {
    val items by viewModel.items.collectAsState()
    val total = viewModel.getTotal()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Carrinho de Compras") },
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
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            if (items.isEmpty()) {
                Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                    Text("Seu carrinho está vazio")
                }
            } else {
                LazyColumn(modifier = Modifier.weight(1f)) {
                    items(items.toList()) { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(8.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray)
                        ) {
                            Row(modifier = Modifier.padding(12.dp).height(80.dp), verticalAlignment = Alignment.CenterVertically) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(item.product.image)
                                        .build(),
                                    contentDescription = null,
                                    modifier = Modifier.size(60.dp),
                                    contentScale = ContentScale.Fit
                                )
                                Spacer(Modifier.width(16.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(item.product.name, maxLines = 1, fontSize = 14.sp)
                                    Text(item.product.price.toBrazilianCurrency(), fontWeight = FontWeight.Bold)
                                }
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    IconButton(onClick = { viewModel.removeFromCart(item.product.id) }) {
                                        Icon(Icons.Default.Delete, contentDescription = null, tint = Color.Red)
                                    }
                                    Text("${item.quantity}", modifier = Modifier.padding(horizontal = 8.dp))
                                    IconButton(onClick = { viewModel.addToCart(item.product) }) {
                                        Icon(Icons.Default.Add, contentDescription = null, tint = Color.Green)
                                    }
                                }
                            }
                        }
                    }
                }
                
                Surface(shadowElevation = 8.dp) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Subtotal", fontSize = 18.sp)
                            Text(total.toBrazilianCurrency(), fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.height(16.dp))
                        Button(
                            onClick = onCheckout,
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AmazonYellow),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Fechar pedido", color = Color.Black, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
