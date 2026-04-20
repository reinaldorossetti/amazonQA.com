package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.repository.OrderRepository
import com.amazonqa.shared.domain.models.*
import com.amazonqa.shared.utils.AppErrors
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class OrderState {
    object Idle : OrderState()
    object Loading : OrderState()
    data class Success(val orders: List<Order>) : OrderState()
    data class Error(val message: String) : OrderState()
}

class OrderViewModel(private val repository: OrderRepository) {
    private val _state = MutableStateFlow<OrderState>(OrderState.Idle)
    val state = _state.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    fun loadOrders() {
        scope.launch {
            _state.value = OrderState.Loading
            try {
                val orders = repository.getOrders()
                _state.value = OrderState.Success(orders)
            } catch (e: Exception) {
                _state.value = OrderState.Error(AppErrors.orderLoadError)
            }
        }
    }

    suspend fun createOrder(userId: Int, cartItems: List<CartItem>, total: Double): Order? {
        return try {
            val orderItems = cartItems.map { 
                OrderItem(product_id = it.product.id, quantity = it.quantity, price = it.product.price) 
            }
            val order = Order(user_id = userId, items = orderItems, total = total)
            val createdOrder = repository.createOrder(order, "key-${System.currentTimeMillis()}")
            
            // Reload orders after creation
            loadOrders()
            
            createdOrder
        } catch (e: Exception) {
            null
        }
    }
}
