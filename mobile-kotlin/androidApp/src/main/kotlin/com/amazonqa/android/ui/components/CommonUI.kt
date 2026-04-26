package com.amazonqa.android.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.amazonqa.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AmazonHeader(
        cartItemCount: Int,
        onProfileClick: () -> Unit,
        onCartClick: () -> Unit,
        onLogout: () -> Unit
) {
    Surface(color = AmazonDark, shadowElevation = 4.dp) {
        Row(
                modifier = Modifier.fillMaxWidth().height(60.dp).padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Image(
                    painter = painterResource(id = com.amazonqa.android.R.drawable.logo),
                    contentDescription = "Amazon Logo",
                    modifier = Modifier.height(40.dp).width(110.dp).testTag("amazon_header_logo"),
                    contentScale = ContentScale.Fit
            )

            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onLogout) {
                    Icon(
                            Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Logout",
                            tint = Color.White
                    )
                }

                IconButton(onClick = onProfileClick) {
                    Icon(Icons.Default.Person, contentDescription = "Profile", tint = Color.White)
                }

                Box(modifier = Modifier.testTag("cart_icon_button")) {
                    IconButton(onClick = onCartClick) {
                        Icon(
                                Icons.Default.ShoppingCart,
                                contentDescription = "Cart",
                                tint = Color.White
                        )
                    }
                    if (cartItemCount > 0) {
                        Surface(
                                shape = CircleShape,
                                color = AmazonOrange,
                                modifier = Modifier.align(Alignment.TopEnd).size(18.dp)
                        ) {
                            Text(
                                    text = cartItemCount.toString(),
                                    color = Color.White,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.wrapContentSize(Alignment.Center).testTag("cart_badge_count")
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ErrorStateView(message: String, onRetry: () -> Unit) {
    Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
    ) {
        Icon(
                imageVector = Icons.Default.Info,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = Color.Gray
        )
        Spacer(Modifier.height(16.dp))
        Text(
                message,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                color = Color.Gray
        )
        Spacer(Modifier.height(16.dp))
        Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(containerColor = AmazonOrange)
        ) { Text("Tentar novamente", color = Color.White) }
    }
}
