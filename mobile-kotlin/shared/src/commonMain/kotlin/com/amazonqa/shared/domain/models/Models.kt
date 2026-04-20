package com.amazonqa.shared.domain.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Int,
    val first_name: String? = null,
    val last_name: String? = null,
    val email: String,
    val role: String? = "user"
) {
    val name: String get() = "${first_name ?: ""} ${last_name ?: ""}".trim().ifEmpty { email }
}

@Serializable
data class AuthResponse(
    val accessToken: String,
    val user: User
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class Product(
    val id: Int,
    val name: String,
    val price: Double,
    val description: String? = null,
    val category: String? = null,
    val image: String? = null,
    val manufacturer: String? = null,
    val shipping_cost: Double? = 0.0,
    val deliveryMinutes: Int? = null
)

@Serializable
data class RegisterRequest(
    val first_name: String,
    val last_name: String,
    val email: String,
    val password: String,
    val role: String? = "user"
)

@Serializable
data class CartItem(
    val product: Product,
    var quantity: Int
)

@Serializable
data class OrderItem(
    val productId: Int,
    val quantity: Int,
    val price: Double
)

@Serializable
data class Order(
    val id: Int? = null,
    val userId: Int,
    val items: List<OrderItem>,
    val total: Double,
    val status: String = "pending",
    val createdAt: String? = null
)

@Serializable
data class PaymentRequest(
    val orderId: Int,
    val method: String, // PIX, CARD, BOLETO
    val value: Double
)
