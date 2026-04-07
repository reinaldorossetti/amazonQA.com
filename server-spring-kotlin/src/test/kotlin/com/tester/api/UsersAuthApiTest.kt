package com.tester.api

import com.tester.api.testsupport.ApiTestConfig
import com.tester.api.testsupport.AuthApiClient
import io.restassured.http.ContentType
import io.restassured.module.kotlin.extensions.Given
import io.restassured.module.kotlin.extensions.Then
import io.restassured.module.kotlin.extensions.When
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.blankOrNullString
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test

@Tag("api")
class UsersAuthApiTest {
    companion object {
        @JvmStatic
        @BeforeAll
        fun setup() {
            ApiTestConfig.configure()
        }
    }

    @Test
    fun `should register and login with a new user`() {
        val user = AuthApiClient.registerRandomUser()
        val token = AuthApiClient.login(user)

        Given {
            accept(ContentType.JSON)
            header("Authorization", "Bearer $token")
        } When {
            get("/users/me")
        } Then {
            statusCode(200)
            body("email", equalTo(user.email))
        }
    }

    @Test
    fun `should return 401 for invalid login password`() {
        val user = AuthApiClient.registerRandomUser()

        Given {
            contentType(ContentType.JSON)
            body(
                mapOf(
                    "email" to user.email,
                    "password" to "WrongPassword!",
                )
            )
        } When {
            post("/users/login")
        } Then {
            statusCode(401)
            body("error", not(blankOrNullString()))
        }
    }
}
