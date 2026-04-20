package com.amazonqa.android.ui.navigation

import androidx.compose.runtime.*
import com.amazonqa.android.ui.features.auth.*
import com.amazonqa.android.ui.features.catalog.*
import com.amazonqa.android.ui.features.cart.*
import com.amazonqa.android.ui.features.checkout.*
import com.amazonqa.android.ui.features.profile.*
import com.amazonqa.shared.presentation.*

@Composable
fun AppNavigation(
    loginViewModel: LoginViewModel, 
    catalogViewModel: CatalogViewModel,
    cartViewModel: CartViewModel,
    orderViewModel: OrderViewModel
) {
    var currentScreen by remember { mutableStateOf("login") }
    val authState by loginViewModel.state.collectAsState()
    
    // Sucess checkout state cache
    var lastOrderItems by remember { mutableStateOf(listOf<com.amazonqa.shared.domain.models.CartItem>()) }
    var lastPaymentMethod by remember { mutableStateOf("") }

    // Logic to navigate to catalog after login
    LaunchedEffect(authState) {
        if (authState is AuthState.Success) {
            if (currentScreen == "login" || currentScreen == "register") {
                currentScreen = "catalog"
            }
        }
    }

    when (currentScreen) {
        "login" -> LoginScreen(
            viewModel = loginViewModel,
            onNavigateToRegister = { currentScreen = "register" },
            onSkip = { currentScreen = "catalog" }
        )
        "register" -> RegisterScreen(
            viewModel = loginViewModel,
            onBack = { currentScreen = "login" }
        )
        "catalog" -> CatalogScreen(
            viewModel = catalogViewModel,
            cartViewModel = cartViewModel,
            orderViewModel = orderViewModel,
            onNavigateToCart = { currentScreen = "cart" },
            onNavigateToProfile = { currentScreen = "profile" },
            onLogout = { 
                loginViewModel.logout()
                currentScreen = "login" 
            }
        )
        "cart" -> CartScreen(
            viewModel = cartViewModel,
            onBack = { currentScreen = "catalog" },
            onCheckout = { currentScreen = "checkout" }
        )
        "checkout" -> CheckoutScreen(
            cartViewModel = cartViewModel,
            orderViewModel = orderViewModel,
            authState = authState,
            onBack = { currentScreen = "cart" },
            onSuccess = { items, method -> 
                lastOrderItems = items
                lastPaymentMethod = method
                currentScreen = "thank_you" 
            }
        )
        "thank_you" -> ThankYouScreen(
            items = lastOrderItems,
            paymentMethod = lastPaymentMethod,
            onContinue = { currentScreen = "catalog" }
        )
        "profile" -> ProfileScreen(
            authState = authState,
            orderViewModel = orderViewModel,
            onBack = { currentScreen = "catalog" },
            onLogout = { 
                // In a real app we would call viewModel.logout()
                currentScreen = "login" 
            }
        )
    }
}
