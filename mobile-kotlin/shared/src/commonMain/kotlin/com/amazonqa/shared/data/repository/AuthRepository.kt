package com.amazonqa.shared.data.repository

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.domain.models.LoginRequest
import com.amazonqa.shared.domain.models.AuthResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class AuthRepository(private val api: ApiClient) {

    suspend fun login(email: String, password: String): AuthResponse {
        return api.client.post("/api/users/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest(email, password))
        }.body()
    }

    suspend fun register(userData: Map<String, String>): AuthResponse {
        return api.client.post("/api/users/register") {
            contentType(ContentType.Application.Json)
            setBody(userData)
        }.body()
    }
}
