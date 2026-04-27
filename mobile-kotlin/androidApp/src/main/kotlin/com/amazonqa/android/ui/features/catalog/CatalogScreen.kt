package com.amazonqa.android.ui.features.catalog

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
import com.amazonqa.android.ui.components.AmazonHeader
import com.amazonqa.android.ui.components.ErrorStateView
import com.amazonqa.android.ui.theme.*
import com.amazonqa.shared.domain.models.Product
import com.amazonqa.shared.presentation.*
import com.amazonqa.shared.utils.toBrazilianCurrency

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogScreen(
    viewModel: CatalogViewModel, 
    cartViewModel: CartViewModel,
    orderViewModel: OrderViewModel,
    onNavigateToCart: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onLogout: () -> Unit,
    onMenuOpen: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    val cartItems by cartViewModel.items.collectAsState()
    val cartCount = cartItems.sumOf { it.quantity }

    LaunchedEffect(Unit) {
        viewModel.loadProducts()
    }

    Scaffold(
        topBar = { 
            AmazonHeader(
                cartItemCount = cartCount,
                onMenuClick = onMenuOpen,
                onProfileClick = onNavigateToProfile,
                onCartClick = onNavigateToCart,
                onLogout = onLogout
            ) 
        }
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize()) {
            when (val s = state) {
                is CatalogState.Loading -> CircularProgressIndicator(Modifier.align(Alignment.Center), color = AmazonOrange)
                is CatalogState.Success -> {
                    LazyColumn(Modifier.fillMaxSize()) {
                        items(s.products) { product ->
                            ProductCard(product, onAddToCart = { cartViewModel.addToCart(product) })
                        }
                    }
                }
                is CatalogState.Error -> ErrorStateView(s.message, onRetry = { viewModel.loadProducts() })
            }
        }
    }
}

@Composable
fun ProductCard(product: Product, onAddToCart: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        shape = RoundedCornerShape(4.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray.copy(alpha = 0.5f))
    ) {
        Row(modifier = Modifier.padding(12.dp).height(120.dp)) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(product.image)
                    .build(),
                contentDescription = product.name,
                modifier = Modifier.size(100.dp),
                contentScale = ContentScale.Fit
            )
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(product.name, maxLines = 2, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    Text(product.price.toBrazilianCurrency(), color = Color(0xFFB12704), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
                Button(
                    onClick = onAddToCart,
                    colors = ButtonDefaults.buttonColors(containerColor = AmazonYellow),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.height(36.dp).padding(bottom = 0.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp)
                ) {
                    Text("Adicionar ao carrinho", color = Color.Black, fontSize = 12.sp)
                }
            }
        }
    }
}
