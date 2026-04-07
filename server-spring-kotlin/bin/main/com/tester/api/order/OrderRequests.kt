package com.tester.api.order

data class OrderInputItem(
    val productId: Int? = null,
    val quantity: Int? = null,
)

data class CreateOrderRequest(
    val shippingTotal: Double? = 0.0,
    val discountTotal: Double? = 0.0,
    val paymentMethod: String? = null,
    val shippingAddress: Map<String, Any?>? = null,
    val billingInfo: Map<String, Any?>? = null,
    val items: List<OrderInputItem>? = null,
)

data class UpdateOrderRequest(
    val status: String? = null,
    val paymentMethod: String? = null,
)

data class CreateOrderPaymentRequest(
    val method: String? = null,
    val amount: Double? = null,
    val holderName: String? = null,
    val cardNumber: String? = null,
    val expiry: String? = null,
    val cvv: String? = null,
    val installments: Int? = null,
    val cardBrand: String? = null,
)
