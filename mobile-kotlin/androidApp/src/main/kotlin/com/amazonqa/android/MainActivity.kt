@file:OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
package com.amazonqa.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.amazonqa.android.ui.navigation.AppNavigation
import com.amazonqa.android.ui.theme.AmazonQATheme
import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.AuthRepository
import com.amazonqa.shared.data.repository.OrderRepository
import com.amazonqa.shared.data.repository.ProductRepository
import com.amazonqa.shared.presentation.CartViewModel
import com.amazonqa.shared.presentation.CatalogViewModel
import com.amazonqa.shared.presentation.LoginViewModel
import com.amazonqa.shared.presentation.OrderViewModel

class MainActivity : ComponentActivity() {
    private val apiClient = ApiClient()
    private val authRepo = AuthRepository(apiClient)
    private val productRepo = ProductRepository(apiClient)
    private val orderRepo = OrderRepository(apiClient)

    private val loginViewModel = LoginViewModel(authRepo)
    private val catalogViewModel = CatalogViewModel(productRepo)
    private val cartViewModel = CartViewModel()
    private val orderViewModel = OrderViewModel(orderRepo)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { 
            AmazonQATheme { 
                AppNavigation(loginViewModel, catalogViewModel, cartViewModel, orderViewModel, apiClient)
            } 
        }
    }
}
