package com.tester.api.cart

data class CartProductInput(
    val productId: Int? = null,
    val quantity: Int? = 1,
)

data class AddCartItemsRequest(
    val products: List<CartProductInput>? = null,
)

data class DeleteCartItemRequest(
    val cartItemId: Int? = null,
)
