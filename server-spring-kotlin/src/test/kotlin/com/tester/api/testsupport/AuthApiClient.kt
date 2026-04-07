package com.tester.api.testsupport

import io.restassured.http.ContentType
import io.restassured.module.kotlin.extensions.Extract
import io.restassured.module.kotlin.extensions.Given
import io.restassured.module.kotlin.extensions.Then
import io.restassured.module.kotlin.extensions.When
import org.hamcrest.Matchers.equalTo
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.blankOrNullString
import java.util.UUID

data class TestUserCredentials(
    val email: String,
    val password: String,
)

object AuthApiClient {
    fun registerRandomUser(): TestUserCredentials {
        val credentials = TestUserCredentials(
            email = "qa.${UUID.randomUUID()}@tester.local",
            password = "Qa#123456",
        )

        Given {
            contentType(ContentType.JSON)
            body(
                mapOf(
                    "first_name" to "API",
                    "last_name" to "Test",
                    "email" to credentials.email,
                    "password" to credentials.password,
                )
            )
        } When {
            post("/users/register")
        } Then {
            statusCode(201)
            body("email", equalTo(credentials.email))
        }

        return credentials
    }

    fun login(credentials: TestUserCredentials): String =
        Given {
            contentType(ContentType.JSON)
            body(
                mapOf(
                    "email" to credentials.email,
                    "password" to credentials.password,
                )
            )
        } When {
            post("/users/login")
        } Then {
            statusCode(200)
            body("tokenType", equalTo("Bearer"))
            body("accessToken", not(blankOrNullString()))
        } Extract {
            path("accessToken")
        }
}
