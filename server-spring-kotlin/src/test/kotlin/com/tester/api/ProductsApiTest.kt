package com.tester.api

import com.tester.api.testsupport.ApiTestConfig
import io.restassured.http.ContentType
import io.restassured.module.kotlin.extensions.Given
import io.restassured.module.kotlin.extensions.Then
import io.restassured.module.kotlin.extensions.When
import org.hamcrest.Matchers.notNullValue
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test

@Tag("api")
class ProductsApiTest {
    companion object {
        @JvmStatic
        @BeforeAll
        fun setup() {
            ApiTestConfig.configure()
        }
    }

    @Test
    fun `should list products on public endpoint`() {
        Given {
            accept(ContentType.JSON)
        } When {
            get("/products")
        } Then {
            statusCode(200)
            body("$", notNullValue())
        }
    }

    @Test
    fun `should list products filtered by category`() {
        Given {
            accept(ContentType.JSON)
            queryParam("category", "Smartphones")
        } When {
            get("/products")
        } Then {
            statusCode(200)
            body("$", notNullValue())
        }
    }
}
