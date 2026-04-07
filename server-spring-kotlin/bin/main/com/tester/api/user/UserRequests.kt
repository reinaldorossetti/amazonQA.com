package com.tester.api.user

import com.fasterxml.jackson.annotation.JsonProperty

data class RegisterUserRequest(
    val person_type: String? = "PF",
    val first_name: String? = null,
    val last_name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val password: String? = null,
    val cpf: String? = null,
    val cnpj: String? = null,
    val company_name: String? = null,
    val address_zip: String? = null,
    val address_street: String? = null,
    val address_number: String? = null,
    val address_complement: String? = null,
    val address_neighborhood: String? = null,
    val address_city: String? = null,
    val address_state: String? = null,
    val residence_proof_filename: String? = null,
)

data class LoginRequest(
    val email: String? = null,
    val password: String? = null,
)

data class AdminCreateUserRequest(
    val person_type: String? = "PF",
    val first_name: String? = null,
    val last_name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val password: String? = null,
    val cpf: String? = null,
    val cnpj: String? = null,
    val company_name: String? = null,
    val address_zip: String? = null,
    val address_street: String? = null,
    val address_number: String? = null,
    val address_complement: String? = null,
    val address_neighborhood: String? = null,
    val address_city: String? = null,
    val address_state: String? = null,
    val residence_proof_filename: String? = null,
    val role: String? = "user",
)

data class UserUpdateRequest(
    val person_type: String? = null,
    val first_name: String? = null,
    val last_name: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val cpf: String? = null,
    val cnpj: String? = null,
    val company_name: String? = null,
    val address_zip: String? = null,
    val address_street: String? = null,
    val address_number: String? = null,
    val address_complement: String? = null,
    val address_neighborhood: String? = null,
    val address_city: String? = null,
    val address_state: String? = null,
    val residence_proof_filename: String? = null,
)

data class AddressUpdateRequest(
    val address_zip: String? = null,
    val address_street: String? = null,
    val address_number: String? = null,
    val address_complement: String? = null,
    val address_neighborhood: String? = null,
    val address_city: String? = null,
    val address_state: String? = null,
)
