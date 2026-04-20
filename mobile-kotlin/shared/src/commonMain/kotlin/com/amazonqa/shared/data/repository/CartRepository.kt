package com.amazonqa.shared.data.repository

import com.amazonqa.shared.domain.models.CartItem
import com.amazonqa.shared.domain.models.Product
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

object CartRepository {
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    fun addToCart(product: Product) {
        _cartItems.update { currentItems ->
            val existingItem = currentItems.find { it.product.id == product.id }
            if (existingItem != null) {
                currentItems.map {
                    if (it.product.id == product.id) it.copy(quantity = it.quantity + 1) else it
                }
            } else {
                currentItems + CartItem(product, 1)
            }
        }
    }

    fun removeFromCart(productId: Int) {
        _cartItems.update { currentItems ->
            currentItems.filterNot { it.product.id == productId }
        }
    }

    fun updateQuantity(productId: Int, quantity: Int) {
        _cartItems.update { currentItems ->
            currentItems.map {
                if (it.product.id == productId) it.copy(quantity = quantity) else it
            }
        }
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun getTotal(): Double {
        return _cartItems.value.sumOf { it.product.price * it.quantity }
    }
}
