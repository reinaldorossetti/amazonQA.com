package com.amazonqa.shared.data.repository

import com.amazonqa.shared.domain.models.Product
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertEquals

class CartRepositoryTest {

    private val testProduct1 = Product(
        id = 1,
        name = "Test Product 1",
        price = 10.0,
        image = "http://example.com/image1.jpg"
    )

    private val testProduct2 = Product(
        id = 2,
        name = "Test Product 2",
        price = 20.0,
        image = "http://example.com/image2.jpg"
    )

    @BeforeTest
    fun setUp() {
        CartRepository.clearCart()
    }

    @AfterTest
    fun tearDown() {
        CartRepository.clearCart()
    }

    @Test
    fun `addToCart should add product to empty cart`() {
        val initialCount = CartRepository.cartItems.value.size
        CartRepository.addToCart(testProduct1)
        assertEquals(initialCount + 1, CartRepository.cartItems.value.size)
        val cartItem = CartRepository.cartItems.value.first()
        assertEquals(testProduct1.id, cartItem.product.id)
        assertEquals(1, cartItem.quantity)
    }

    @Test
    fun `addToCart should increase quantity when product already exists`() {
        CartRepository.addToCart(testProduct1)
        val initialQuantity = CartRepository.cartItems.value.first().quantity
        CartRepository.addToCart(testProduct1)
        val cartItem = CartRepository.cartItems.value.first()
        assertEquals(initialQuantity + 1, cartItem.quantity)
        assertEquals(1, CartRepository.cartItems.value.size)
    }

    @Test
    fun `removeFromCart should remove product from cart`() {
        CartRepository.addToCart(testProduct1)
        CartRepository.addToCart(testProduct2)
        assertEquals(2, CartRepository.cartItems.value.size)
        CartRepository.removeFromCart(testProduct1.id)
        assertEquals(1, CartRepository.cartItems.value.size)
        val remainingItem = CartRepository.cartItems.value.first()
        assertEquals(testProduct2.id, remainingItem.product.id)
    }

    @Test
    fun `removeFromCart should do nothing when product not in cart`() {
        CartRepository.addToCart(testProduct1)
        val initialSize = CartRepository.cartItems.value.size
        CartRepository.removeFromCart(999)
        assertEquals(initialSize, CartRepository.cartItems.value.size)
    }

    @Test
    fun `updateQuantity should update quantity of existing product`() {
        CartRepository.addToCart(testProduct1)
        val newQuantity = 5
        CartRepository.updateQuantity(testProduct1.id, newQuantity)
        val cartItem = CartRepository.cartItems.value.first()
        assertEquals(newQuantity, cartItem.quantity)
    }

    @Test
    fun `updateQuantity should do nothing when product not in cart`() {
        CartRepository.addToCart(testProduct1)
        val initialQuantity = CartRepository.cartItems.value.first().quantity
        CartRepository.updateQuantity(999, 5)
        val cartItem = CartRepository.cartItems.value.first()
        assertEquals(initialQuantity, cartItem.quantity)
    }

    @Test
    fun `clearCart should remove all items from cart`() {
        CartRepository.addToCart(testProduct1)
        CartRepository.addToCart(testProduct2)
        assertEquals(2, CartRepository.cartItems.value.size)
        CartRepository.clearCart()
        assertEquals(0, CartRepository.cartItems.value.size)
    }

    @Test
    fun `getTotal should return correct total for cart`() {
        CartRepository.clearCart()
        CartRepository.addToCart(testProduct1)
        CartRepository.addToCart(testProduct2)
        CartRepository.addToCart(testProduct1)
        val total = CartRepository.getTotal()
        assertEquals(40.0, total, 0.001)
    }

    @Test
    fun `getTotal should return zero for empty cart`() {
        CartRepository.clearCart()
        val total = CartRepository.getTotal()
        assertEquals(0.0, total, 0.001)
    }
}
