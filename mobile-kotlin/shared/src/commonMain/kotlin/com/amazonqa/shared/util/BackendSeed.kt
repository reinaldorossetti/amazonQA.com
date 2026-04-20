package com.amazonqa.shared.util

import com.amazonqa.shared.data.network.ApiClient
import com.amazonqa.shared.data.repository.AuthRepository
import com.amazonqa.shared.domain.models.LoginRequest
import com.amazonqa.shared.domain.models.AuthResponse

/**
 * Seed data for development and testing.
 * Contains predefined users for validating backend connectivity.
 */
object BackendSeed {
    const val ADMIN_EMAIL = "reiload@gmail.com"
    const val ADMIN_PASSWORD = "rei2026@QA"

    const val NORMAL_EMAIL = "reinaldo.rossetti@outlook.com"
    const val NORMAL_PASSWORD = "qualidade2026@QA"

    /**
     * Utility to validate connectivity using the seed users.
     */
    suspend fun validateAll(authRepository: AuthRepository): ValidationResult {
        val adminResult = try {
            authRepository.login(ADMIN_EMAIL, ADMIN_PASSWORD)
            true
        } catch (e: Exception) {
            println("Admin Login Failed: ${e.message}")
            false
        }

        val normalResult = try {
            authRepository.login(NORMAL_EMAIL, NORMAL_PASSWORD)
            true
        } catch (e: Exception) {
            println("Normal Login Failed: ${e.message}")
            false
        }

        return ValidationResult(adminResult, normalResult)
    }
}

data class ValidationResult(
    val adminSuccess: Boolean,
    val normalSuccess: Boolean
)
