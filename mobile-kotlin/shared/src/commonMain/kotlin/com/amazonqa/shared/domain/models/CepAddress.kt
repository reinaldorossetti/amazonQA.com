package com.amazonqa.shared.domain.models

import kotlinx.serialization.Serializable

@Serializable
data class CepAddress(
    val cep: String,
    val logradouro: String,
    val complemento: String,
    val bairro: String,
    val localidade: String, // City
    val uf: String,
    val ibge: String? = null,
    val gia: String? = null,
    val ddd: String? = null,
    val siafi: String? = null
)
