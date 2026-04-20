package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.repository.CartRepository
import com.amazonqa.shared.domain.models.CartItem
import com.amazonqa.shared.domain.models.Product
import kotlinx.coroutines.flow.StateFlow

class CartViewModel {
    val items: StateFlow<List<CartItem>> = CartRepository.cartItems

    fun addToCart(product: Product) {
        CartRepository.addToCart(product)
    }

    fun removeFromCart(productId: Int) {
        CartRepository.removeFromCart(productId)
    }

    fun updateQuantity(productId: Int, quantity: Int) {
        CartRepository.updateQuantity(productId, quantity)
    }

    fun clearCart() {
        CartRepository.clearCart()
    }

    fun getTotal(): Double {
        return CartRepository.getTotal()
    }
}
