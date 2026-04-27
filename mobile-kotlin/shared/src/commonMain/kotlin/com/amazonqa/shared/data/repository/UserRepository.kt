package com.amazonqa.shared.data.repository

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.domain.models.UserProfile
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class UserRepository(private val api: ApiClient) {

    suspend fun getProfile(): UserProfile {
        return api.client.get("/api/users/me") {
            contentType(ContentType.Application.Json)
        }.body()
    }

    suspend fun getAddress(): com.amazonqa.shared.domain.models.UserAddress {
        return api.client.get("/api/users/me/address") {
            contentType(ContentType.Application.Json)
        }.body()
    }

    suspend fun updateProfile(id: Int, body: Map<String, Any?>): UserProfile {
        return api.client.put("/api/users/$id") {
            contentType(ContentType.Application.Json)
            setBody(body)
        }.body()
    }

    suspend fun updateAddress(body: Map<String, String?>): UserProfile {
        return api.client.put("/api/users/me/address") {
            contentType(ContentType.Application.Json)
            setBody(body)
        }.body()
    }
}
