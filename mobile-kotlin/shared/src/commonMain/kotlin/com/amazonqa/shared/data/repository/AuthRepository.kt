package com.amazonqa.shared.data.repository

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.domain.models.LoginRequest
import com.amazonqa.shared.domain.models.RegisterRequest
import com.amazonqa.shared.domain.models.AuthResponse
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*

class AuthRepository(private val api: ApiClient) {

    suspend fun login(email: String, password: String): AuthResponse {
        val response: AuthResponse = api.client.post("/api/users/login") {
            contentType(ContentType.Application.Json)
            setBody(LoginRequest(email, password))
        }.body()
        api.authToken = response.accessToken
        return response
    }

    suspend fun register(request: RegisterRequest): AuthResponse {
        val response: AuthResponse = api.client.post("/api/users/register") {
            contentType(ContentType.Application.Json)
            setBody(request)
        }.body()
        api.authToken = response.accessToken
        return response
    }

    fun logout() {
        api.authToken = null
    }
}
