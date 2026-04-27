package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.network.CepService
import com.amazonqa.shared.domain.models.CepAddress
import com.amazonqa.shared.data.repository.AuthRepository
import com.amazonqa.shared.domain.models.User
import com.amazonqa.shared.domain.models.RegisterRequest
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

class LoginViewModel(
    private val repository: AuthRepository,
    private val cepService: CepService = CepService()
) {
    private val _state = MutableStateFlow<AuthState>(AuthState.Idle)
    val state = _state.asStateFlow()

    private val _registrationStep = MutableStateFlow(1)
    val registrationStep = _registrationStep.asStateFlow()

    private val _addressData = MutableStateFlow<CepAddress?>(null)
    val addressData = _addressData.asStateFlow()

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

    fun setStep(step: Int) {
        _registrationStep.value = step
    }

    fun fetchAddressByCep(cep: String) {
        if (cep.length < 8) return
        scope.launch {
            val address = cepService.fetchAddress(cep)
            _addressData.value = address
        }
    }

    fun register(
        firstName: String, 
        lastName: String, 
        email: String, 
        password: String,
        personType: String,
        document: String,
        phone: String,
        address: Map<String, String>? = null
    ) {
        scope.launch {
            _state.value = AuthState.Loading
            try {
                val request = RegisterRequest(
                    person_type = personType,
                    first_name = firstName,
                    last_name = lastName,
                    email = email,
                    password = password,
                    phone = phone,
                    cpf = if (personType == "PF") document else null,
                    cnpj = if (personType == "PJ") document else null,
                    address_zip = address?.get("cep"),
                    address_street = address?.get("street"),
                    address_number = address?.get("number"),
                    address_complement = address?.get("complement"),
                    address_neighborhood = address?.get("neighborhood"),
                    address_city = address?.get("city"),
                    address_state = address?.get("state")
                )

                val response = repository.register(request)
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
