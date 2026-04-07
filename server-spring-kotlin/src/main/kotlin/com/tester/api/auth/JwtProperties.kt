package com.tester.api.auth

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.jwt")
data class JwtProperties(
    val secret: String,
    val expiresIn: String,
    val issuer: String,
    val audience: String,
)
