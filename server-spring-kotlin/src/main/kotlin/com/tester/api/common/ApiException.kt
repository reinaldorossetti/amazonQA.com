package com.tester.api.common

class ApiException(
    val status: Int,
    override val message: String,
) : RuntimeException(message)
