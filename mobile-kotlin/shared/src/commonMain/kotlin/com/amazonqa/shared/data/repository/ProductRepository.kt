package com.amazonqa.shared.data.repository

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.domain.models.Product
import io.ktor.client.call.*
import io.ktor.client.request.*

class ProductRepository(private val api: ApiClient) {

    suspend fun getProducts(): List<Product> {
        return api.client.get("/api/products").body()
    }

    suspend fun getProductById(id: Int): Product {
        return api.client.get("/api/products/$id").body()
    }

    suspend fun createProduct(product: Product): Product {
        return api.client.post("/api/products") {
            setBody(product)
        }.body()
    }

    suspend fun updateProduct(id: Int, product: Product): Product {
        return api.client.put("/api/products/$id") {
            setBody(product)
        }.body()
    }

    suspend fun deleteProduct(id: Int) {
        api.client.delete("/api/products/$id")
    }
}
