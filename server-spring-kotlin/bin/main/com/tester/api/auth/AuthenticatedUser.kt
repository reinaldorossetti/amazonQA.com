package com.tester.api.auth

data class AuthenticatedUser(
    val userId: Int,
    val email: String?,
    val personType: String?,
    val token: String,
)
