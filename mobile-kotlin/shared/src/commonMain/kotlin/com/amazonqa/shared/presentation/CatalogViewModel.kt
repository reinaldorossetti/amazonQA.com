package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.repository.ProductRepository
import com.amazonqa.shared.domain.models.Product
import com.amazonqa.shared.utils.AppErrors
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class CatalogState {
    object Loading : CatalogState()
    data class Success(val products: List<Product>) : CatalogState()
    data class Error(val message: String) : CatalogState()
}

class CatalogViewModel(private val repository: ProductRepository) {
    private val _state = MutableStateFlow<CatalogState>(CatalogState.Loading)
    val state = _state.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    fun loadProducts() {
        scope.launch {
            _state.value = CatalogState.Loading
            try {
                val products = repository.getProducts()
                _state.value = CatalogState.Success(products)
            } catch (e: Exception) {
                val userFriendlyMessage =
                        when {
                            e.message?.contains("Connect") == true -> AppErrors.connectionError
                            e.message?.contains("Host") == true -> AppErrors.hostError
                            else -> AppErrors.catalogLoadError
                        }
                _state.value = CatalogState.Error(userFriendlyMessage)
            }
        }
    }
}
