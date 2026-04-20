package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.repository.AuthRepository
import com.amazonqa.shared.domain.models.User
import com.amazonqa.shared.utils.AppErrors
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: User) : AuthState()
    data class Error(val message: String) : AuthState()
}

class LoginViewModel(private val repository: AuthRepository) {
    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state = _state.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    fun login(email: String, password: String) {
        scope.launch {
            _state.value = AuthState.Loading
            try {
                val response = repository.login(email, password)
                _state.value = AuthState.Success(response.user)
            } catch (e: Exception) {
                val userFriendlyMessage = when {
                    e.message?.contains("Connect") == true -> AppErrors.authBackendOffline
                    e.message?.contains("401") == true -> AppErrors.authInvalidCredentials
                    else -> AppErrors.authGenericError
                }
                _state.value = AuthState.Error(userFriendlyMessage)
            }
        }
    }

    fun register(firstName: String, lastName: String, email: String, password: String) {
        scope.launch {
            _state.value = AuthState.Loading
            try {
                val userData = mapOf(
                    "first_name" to firstName,
                    "last_name" to lastName,
                    "email" to email,
                    "password" to password
                )
                val response = repository.register(userData)
                _state.value = AuthState.Success(response.user)
            } catch (e: Exception) {
                val userFriendlyMessage = when {
                    e.message?.contains("Connect") == true -> AppErrors.authBackendOffline
                    e.message?.contains("409") == true -> AppErrors.registerEmailConflict
                    else -> AppErrors.registerGenericError
                }
                _state.value = AuthState.Error(userFriendlyMessage)
            }
        }
    }

    fun logout() {
        repository.logout()
        _state.value = AuthState.Idle
    }
}
