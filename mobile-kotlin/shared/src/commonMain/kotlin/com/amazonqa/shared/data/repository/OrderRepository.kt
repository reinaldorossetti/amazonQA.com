package com.amazonqa.shared.data.repository

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.domain.models.Order
import com.amazonqa.shared.domain.models.PaginatedResponse
import com.amazonqa.shared.domain.models.PaymentRequest
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class OrderRepository(private val api: ApiClient) {

    suspend fun createOrder(order: Order, idempotencyKey: String): Order {
        return api.client.post("/api/orders") {
            header("Idempotency-Key", idempotencyKey)
            contentType(ContentType.Application.Json)
            setBody(order)
        }.body()
    }

    suspend fun getOrders(): List<Order> {
        val response: PaginatedResponse<Order> = api.client.get("/api/orders").body()
        return response.items
    }

    suspend fun processPayment(payment: PaymentRequest): Map<String, String> {
        return api.client.post("/api/orders/${payment.orderId}/payments") {
            contentType(ContentType.Application.Json)
            setBody(payment)
        }.body()
    }
}
