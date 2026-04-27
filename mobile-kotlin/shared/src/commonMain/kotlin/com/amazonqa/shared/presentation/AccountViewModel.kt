package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.repository.UserRepository
import com.amazonqa.shared.domain.models.UserProfile
import com.amazonqa.shared.utils.AppErrors
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AccountState {
    object Idle : AccountState()
    object Loading : AccountState()
    data class Success(val profile: UserProfile) : AccountState()
    data class AddressSuccess(val address: com.amazonqa.shared.domain.models.UserAddress) : AccountState()
    data class Error(val message: String) : AccountState()
}

class AccountViewModel(private val repository: UserRepository) {
    private val _state = MutableStateFlow<AccountState>(AccountState.Idle)
    val state = _state.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    fun loadAddress() {
        scope.launch {
            _state.value = AccountState.Loading
            try {
                val address = repository.getAddress()
                _state.value = AccountState.AddressSuccess(address)
            } catch (e: Exception) {
                _state.value = AccountState.Error(AppErrors.orderLoadError)
            }
        }
    }

    fun loadProfile() {
        scope.launch {
            _state.value = AccountState.Loading
            try {
                val profile = repository.getProfile()
                // debug log to help verify data during development
                println("AccountViewModel: loaded profile => $profile")
                _state.value = AccountState.Success(profile)
            } catch (e: Exception) {
                println("AccountViewModel: failed to load profile: ${e.message}")
                _state.value = AccountState.Error(AppErrors.orderLoadError)
            }
        }
    }

    fun updateAddress(address: Map<String, String?>) {
        scope.launch {
            _state.value = AccountState.Loading
            try {
                val updated = repository.updateAddress(address)
                _state.value = AccountState.Success(updated)
            } catch (e: Exception) {
                _state.value = AccountState.Error(AppErrors.orderLoadError)
            }
        }
    }

    fun updateProfile(id: Int, body: Map<String, Any?>) {
        scope.launch {
            _state.value = AccountState.Loading
            try {
                val updated = repository.updateProfile(id, body)
                _state.value = AccountState.Success(updated)
            } catch (e: Exception) {
                _state.value = AccountState.Error(AppErrors.orderLoadError)
            }
        }
    }
}
