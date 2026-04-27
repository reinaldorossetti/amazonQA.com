package com.amazonqa.shared.domain.models

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

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
data class UserProfile(
    val id: Int,
    val person_type: String? = null,
    val first_name: String? = null,
    val last_name: String? = null,
    val email: String,
    val phone: String? = null,
    val cpf: String? = null,
    val cnpj: String? = null,
    val company_name: String? = null,
    val address_zip: String? = null,
    val address_street: String? = null,
    val address_number: String? = null,
    val address_complement: String? = null,
    val address_neighborhood: String? = null,
    val address_city: String? = null,
    val address_state: String? = null,
    val residence_proof_filename: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null,
    val is_active: Boolean? = true,
    val account_closed_at: String? = null,
    val roles: List<String> = emptyList(),
    val isAdmin: Boolean = false
)

@Serializable
data class UserAddress(
    val address_zip: String? = null,
    val address_street: String? = null,
    val address_number: String? = null,
    val address_complement: String? = null,
    val address_neighborhood: String? = null,
    val address_city: String? = null,
    val address_state: String? = null
)

@Serializable
data class AuthResponse(
    val accessToken: String,
    val user: User
)

@Serializable
data class PaginatedResponse<T>(
    val page: Int,
    val pageSize: Int,
    val total: Int,
    val items: List<T>
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
    val product_id: Int,
    val quantity: Int,
    @SerialName("unit_price_snapshot")
    val price: Double? = 0.0
)

@Serializable
data class Order(
    val id: Int? = null,
    val user_id: Int? = null,
    val items: List<OrderItem> = emptyList(),
    @SerialName("grand_total")
    val total: Double = 0.0,
    val status: String = "pending",
    val created_at: String? = null
)

@Serializable
data class PaymentRequest(
    val orderId: Int,
    val method: String, // PIX, CARD, BOLETO
    val value: Double
)
