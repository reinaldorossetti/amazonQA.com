package com.tester.api.testsupport

import io.restassured.RestAssured

object ApiTestConfig {
    private const val defaultBaseUrl = "http://127.0.0.1:3001"
    private const val defaultBasePath = "/api"

    private fun env(name: String): String? =
        System.getenv(name)
            ?.trim()
            ?.takeIf { it.isNotEmpty() }

    val baseUrl: String = env("API_BASE_URL") ?: defaultBaseUrl
    val basePath: String = env("API_BASE_PATH") ?: defaultBasePath

    fun configure(): Unit {
        RestAssured.baseURI = baseUrl
        RestAssured.basePath = basePath
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails()
    }
}
