package com.amazonqa.shared.data.network

import io.ktor.client.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

class ApiClient(private val hostAddress: String = "10.0.2.2", private val hostPort: Int = 3001) {
    var authToken: String? = null

    val client = HttpClient {
        install(ContentNegotiation) {
            json(
                    Json {
                        ignoreUnknownKeys = true
                        useAlternativeNames = false
                    }
            )
        }
        install(Logging) {
            level = LogLevel.ALL
            logger =
                    object : Logger {
                        override fun log(message: String) {
                            println("AmazonQA-HTTP: $message")
                        }
                    }
        }
        defaultRequest {
            url {
                protocol = URLProtocol.HTTP
                host = hostAddress
                port = hostPort
            }
            authToken?.let {
                header("Authorization", "Bearer $it")
            }
        }
    }
}
