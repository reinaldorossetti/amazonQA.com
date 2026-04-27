package com.amazonqa.shared.data.network

import com.amazonqa.shared.domain.models.CepAddress
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

class CepService {
    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
            })
        }
    }

    suspend fun fetchAddress(cep: String): CepAddress? {
        return try {
            val cleanCep = cep.replace("-", "").replace(".", "")
            if (cleanCep.length != 8) return null
            
            client.get("https://viacep.com.br/ws/$cleanCep/json/").body()
        } catch (e: Exception) {
            println("AmazonQA-CEP-Error: ${e.message}")
            null
        }
    }
}
