package com.amazonqa.android.ui.features.checkout

import android.graphics.Bitmap
import android.graphics.Color as AndroidColor
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amazonqa.android.ui.theme.*
import com.amazonqa.shared.domain.models.CartItem
import com.amazonqa.shared.presentation.*
import com.amazonqa.shared.utils.AppStrings
import com.amazonqa.shared.utils.AppErrors
import com.amazonqa.shared.utils.toBrazilianCurrency
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    cartViewModel: CartViewModel, 
    orderViewModel: OrderViewModel,
    authState: AuthState,
    onBack: () -> Unit, 
    onSuccess: (List<com.amazonqa.shared.domain.models.CartItem>, String) -> Unit
) {
    var selectedMethod by remember { mutableStateOf("PIX") }
    var isProcessing by remember { mutableStateOf(false) }
    var showLoginError by remember { mutableStateOf(false) }
    val items by cartViewModel.items.collectAsState()
    val total by remember {
        derivedStateOf { items.sumOf { it.product.price * it.quantity } }
    }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(AppStrings.paymentTitle) },
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
            Text("${AppStrings.orderTotalLabel}: ${total.toBrazilianCurrency()}", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(24.dp))
            Text(AppStrings.paymentMethodSelection, fontWeight = FontWeight.SemiBold)
            
            Column(Modifier.padding(vertical = 16.dp)) {
                listOf("PIX", "Cartão de Crédito", "Boleto").forEach { method ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                            .background(if (selectedMethod == method) Color.LightGray.copy(alpha = 0.3f) else Color.Transparent)
                            .clickable { selectedMethod = method }
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(selected = selectedMethod == method, onClick = { selectedMethod = method })
                        Text(method, modifier = Modifier.padding(start = 8.dp))
                    }
                }
            }
            
            if (showLoginError) {
                Surface(
                    color = Color(0xFFFFF1F0),
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color.Red.copy(alpha = 0.5f))
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Warning, null, tint = Color.Red, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(12.dp))
                        Text(
                            AppErrors.loginRequired,
                            fontSize = 13.sp,
                            color = Color(0xFFD32F2F)
                        )
                    }
                }
            }

            Spacer(Modifier.weight(1f))
            
            Button(
                onClick = { 
                    if (authState is AuthState.Success) {
                        scope.launch {
                            isProcessing = true
                            val orderItems = items.toList()
                            val method = selectedMethod
                            val userId = authState.user.id
                            
                            val createdOrder = orderViewModel.createOrder(userId, orderItems, total)
                            
                            if (createdOrder != null) {
                                cartViewModel.clearCart()
                                onSuccess(orderItems, method)
                            }
                            isProcessing = false
                        }
                    } else {
                        showLoginError = true
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                enabled = !isProcessing,
                colors = ButtonDefaults.buttonColors(containerColor = AmazonOrange)
            ) {
                if (isProcessing) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Confirmar e Pagar", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun ThankYouScreen(
    items: List<CartItem>,
    paymentMethod: String,
    onContinue: () -> Unit
) {
    val total = items.sumOf { it.product.price * it.quantity }
    
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = Color(0xFF008a00)
            )
            
            Spacer(Modifier.height(16.dp))
            
            Text(
                text = AppStrings.thankYouTitle,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            
            Text(
                text = AppStrings.orderProcessed,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Gray,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp)
            )
            
            Spacer(Modifier.height(24.dp))
        }

        if (paymentMethod == "PIX") {
            item {
                QRCodeSection(total)
                Spacer(Modifier.height(24.dp))
            }
        } else if (paymentMethod == "Boleto") {
            item {
                BoletoSection()
                Spacer(Modifier.height(24.dp))
            }
        }

        item {
            OrderSummarySection(items, total)
            Spacer(Modifier.height(32.dp))
        }

        item {
            Button(
                onClick = onContinue,
                modifier = Modifier.fillMaxWidth().height(48.dp).padding(horizontal = 48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AmazonYellow),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.ShoppingCart, null, tint = Color.Black, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(AppStrings.backToCatalog, color = Color.Black, fontWeight = FontWeight.Bold)
            }
            
            Spacer(Modifier.height(48.dp))
        }
    }
}

@Composable
fun QRCodeSection(total: Double) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray)
    ) {
        Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(AppStrings.pixGenerated, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth())
            
            Spacer(Modifier.height(8.dp))
            
            Surface(
                color = Color(0xFFE7F3FF),
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Info, null, tint = AmazonBlueLink, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        AppStrings.pixMockInfo,
                        fontSize = 11.sp,
                        color = Color.DarkGray
                    )
                }
            }
            
            Spacer(Modifier.height(24.dp))
            
            val qrCodeBitmap = remember(total) {
                generateQRCode("PIX-PAYMENT-MOCK-$total-${System.currentTimeMillis()}")
            }
            
            qrCodeBitmap?.let {
                Image(
                    bitmap = it.asImageBitmap(),
                    contentDescription = "PIX QR Code",
                    modifier = Modifier.size(200.dp)
                )
            }
            
            Spacer(Modifier.height(16.dp))
            
            OutlinedButton(
                onClick = { /* Seria copiar para o clipboard */ },
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier.height(36.dp)
            ) {
                Text(AppStrings.pixCopyBtn, fontSize = 12.sp, color = Color.Black)
            }
        }
    }
}

@Composable
fun BoletoSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray)
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(AppStrings.boletoGenerated, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth())
            
            Spacer(Modifier.height(8.dp))
            
            Surface(
                color = Color(0xFFE7F3FF),
                shape = RoundedCornerShape(4.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Info, null, tint = AmazonBlueLink, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(
                        AppStrings.boletoMockInfo,
                        fontSize = 11.sp,
                        color = Color.DarkGray
                    )
                }
            }
            
            Spacer(Modifier.height(24.dp))
            
            Row(Modifier.fillMaxWidth()) {
                 OutlinedButton(
                    onClick = { /* Copiar linha */ },
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.height(36.dp).weight(1f)
                ) {
                    Text(AppStrings.boletoCopyBtn, fontSize = 12.sp, color = Color.Black)
                }
                
                Spacer(Modifier.width(8.dp))
                
                Button(
                    onClick = { /* Baixar boleto */ },
                    colors = ButtonDefaults.buttonColors(containerColor = AmazonYellow),
                    shape = RoundedCornerShape(4.dp),
                    modifier = Modifier.height(36.dp).weight(1f)
                ) {
                    Text(AppStrings.boletoDownloadBtn, fontSize = 12.sp, color = Color.Black)
                }
            }
        }
    }
}

@Composable
fun OrderSummarySection(items: List<CartItem>, total: Double) {
    Column {
        Text(AppStrings.orderSummary, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth())
        Spacer(Modifier.height(8.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(0.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.LightGray)
        ) {
            Column(Modifier.fillMaxWidth()) {
                Row(Modifier.background(Color(0xFFF7F7F7)).padding(8.dp)) {
                    Text(AppStrings.productColumn, Modifier.weight(1f), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(AppStrings.quantityColumn, Modifier.width(40.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(AppStrings.totalColumn, Modifier.width(80.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.End)
                }
                
                items.forEach { item ->
                    HorizontalDivider(color = Color(0xFFEEEEEE))
                    Row(Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(item.product.name, Modifier.weight(1f), fontSize = 12.sp, maxLines = 1)
                        Text("${item.quantity}", Modifier.width(40.dp), fontSize = 12.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                        Text((item.product.price * item.quantity).toBrazilianCurrency(), Modifier.width(80.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = androidx.compose.ui.text.style.TextAlign.End)
                    }
                }
                
                HorizontalDivider(color = Color.LightGray, thickness = 1.dp)
                Row(Modifier.background(Color(0xFFF7F7F7)).padding(12.dp)) {
                    Text("VALOR TOTAL", Modifier.weight(1f), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(total.toBrazilianCurrency(), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB12704))
                }
            }
        }
    }
}

fun generateQRCode(text: String): Bitmap? {
    return try {
        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(text, BarcodeFormat.QR_CODE, 512, 512)
        val width = bitMatrix.width
        val height = bitMatrix.height
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
        for (x in 0 until width) {
            for (y in 0 until height) {
                bitmap.setPixel(x, y, if (bitMatrix.get(x, y)) AndroidColor.BLACK else AndroidColor.WHITE)
            }
        }
        bitmap
    } catch (e: Exception) {
        null
    }
}
