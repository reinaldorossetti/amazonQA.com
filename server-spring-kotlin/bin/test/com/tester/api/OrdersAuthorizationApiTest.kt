package com.tester.api

import com.tester.api.testsupport.ApiTestConfig
import com.tester.api.testsupport.AuthApiClient
import io.restassured.http.ContentType
import io.restassured.module.kotlin.extensions.Given
import io.restassured.module.kotlin.extensions.Then
import io.restassured.module.kotlin.extensions.When
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.blankOrNullString
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test

@Tag("api")
class OrdersAuthorizationApiTest {
    companion object {
        @JvmStatic
        @BeforeAll
        fun setup() {
            ApiTestConfig.configure()
        }
    }

    @Test
    fun `should return 401 when listing orders without token`() {
        Given {
            accept(ContentType.JSON)
        } When {
            get("/orders")
        } Then {
            statusCode(401)
            body("error", not(blankOrNullString()))
        }
    }

    @Test
    fun `should list orders with a valid token`() {
        val credentials = AuthApiClient.registerRandomUser()
        val token = AuthApiClient.login(credentials)

        Given {
            accept(ContentType.JSON)
            header("Authorization", "Bearer $token")
        } When {
            get("/orders")
        } Then {
            statusCode(200)
            body("items", not(blankOrNullString()))
        }
    }
}
