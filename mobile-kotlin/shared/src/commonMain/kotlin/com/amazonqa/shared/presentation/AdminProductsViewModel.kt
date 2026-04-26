package com.amazonqa.shared.presentation

import com.amazonqa.shared.data.repository.ProductRepository
import com.amazonqa.shared.domain.models.Product
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AdminProductsState {
    object Loading : AdminProductsState()
    data class Success(val products: List<Product>) : AdminProductsState()
    data class Error(val message: String) : AdminProductsState()
}

class AdminProductsViewModel(private val repository: ProductRepository) {
    private val _state = MutableStateFlow<AdminProductsState>(AdminProductsState.Loading)
    val state = _state.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main)

    fun loadProducts() {
        scope.launch {
            _state.value = AdminProductsState.Loading
            try {
                val products = repository.getProducts()
                _state.value = AdminProductsState.Success(products)
            } catch (e: Exception) {
                _state.value = AdminProductsState.Error(e.message ?: "Erro ao carregar produtos.")
            }
        }
    }

    fun deleteProduct(id: Int) {
        scope.launch {
            try {
                repository.deleteProduct(id)
                loadProducts()
            } catch (e: Exception) {
                // For simplicity, just reload or show error. In a real app we'd send a UI event.
                loadProducts()
            }
        }
    }

    fun saveProduct(product: Product, isEditing: Boolean) {
        scope.launch {
            try {
                if (isEditing) {
                    repository.updateProduct(product.id, product)
                } else {
                    repository.createProduct(product)
                }
                loadProducts()
            } catch (e: Exception) {
                loadProducts()
            }
        }
    }
}
