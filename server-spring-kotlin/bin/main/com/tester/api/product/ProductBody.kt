package com.tester.api.product

import java.math.BigDecimal

data class ProductBody(
    val name: String? = null,
    val price: BigDecimal? = null,
    val description: String? = null,
    val category: String? = null,
    val image: String? = null,
    val manufacturer: String? = null,
    val line: String? = null,
    val model: String? = null,
)
