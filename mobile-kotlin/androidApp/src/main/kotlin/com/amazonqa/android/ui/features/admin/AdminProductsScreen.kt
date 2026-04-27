package com.amazonqa.android.ui.features.admin

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.amazonqa.shared.domain.models.Product
import com.amazonqa.shared.presentation.AdminProductsState
import com.amazonqa.shared.presentation.AdminProductsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminProductsScreen(
    viewModel: AdminProductsViewModel,
    onNavigateBack: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    var editingProduct by remember { mutableStateOf<Product?>(null) }

    LaunchedEffect(Unit) {
        viewModel.loadProducts()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Admin Produtos") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Text("←")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                editingProduct = null
                showDialog = true
            }, modifier = Modifier.testTag("admin_add_product_fab")) {
                Icon(Icons.Default.Add, contentDescription = "Novo Produto")
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            when (val s = state) {
                is AdminProductsState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is AdminProductsState.Error -> {
                    Text(text = s.message, color = MaterialTheme.colorScheme.error, modifier = Modifier.align(Alignment.Center))
                }
                is AdminProductsState.Success -> {
                    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(s.products) { product ->
                            ProductAdminItem(
                                product = product,
                                onEdit = {
                                    editingProduct = product
                                    showDialog = true
                                },
                                onDelete = {
                                    viewModel.deleteProduct(product.id)
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    if (showDialog) {
        ProductDialog(
            initialProduct = editingProduct,
            onDismiss = { showDialog = false },
            onSave = { product, isEditing ->
                viewModel.saveProduct(product, isEditing)
                showDialog = false
            }
        )
    }
}

@Composable
fun ProductAdminItem(product: Product, onEdit: () -> Unit, onDelete: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(16.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = product.name, style = MaterialTheme.typography.titleMedium)
                Text(text = "R$ ${product.price}", style = MaterialTheme.typography.bodyMedium)
                Text(text = "Cat: ${product.category ?: "N/A"}", style = MaterialTheme.typography.bodySmall)
            }
            Row {
                IconButton(onClick = onEdit, modifier = Modifier.testTag("admin_edit_button_${product.id}")) {
                    Icon(Icons.Default.Edit, contentDescription = "Editar")
                }
                IconButton(onClick = onDelete, modifier = Modifier.testTag("admin_delete_button_${product.id}")) {
                    Icon(Icons.Default.Delete, contentDescription = "Deletar", tint = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun ProductDialog(
    initialProduct: Product?,
    onDismiss: () -> Unit,
    onSave: (Product, Boolean) -> Unit
) {
    var name by remember { mutableStateOf(initialProduct?.name ?: "") }
    var priceStr by remember { mutableStateOf(initialProduct?.price?.toString() ?: "") }
    var category by remember { mutableStateOf(initialProduct?.category ?: "") }
    var manufacturer by remember { mutableStateOf(initialProduct?.manufacturer ?: "") }
    var description by remember { mutableStateOf(initialProduct?.description ?: "") }
    var image by remember { mutableStateOf(initialProduct?.image ?: "") }
    var shippingStr by remember { mutableStateOf(initialProduct?.shipping_cost?.toString() ?: "0.0") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (initialProduct == null) "Novo Produto" else "Editar Produto") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nome") }, singleLine = true, modifier = Modifier.testTag("admin_product_name_field"))
                OutlinedTextField(value = priceStr, onValueChange = { priceStr = it }, label = { Text("Preço") }, singleLine = true, modifier = Modifier.testTag("admin_product_price_field"))
                OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Categoria") }, singleLine = true, modifier = Modifier.testTag("admin_product_category_field"))
                OutlinedTextField(value = manufacturer, onValueChange = { manufacturer = it }, label = { Text("Fabricante") }, singleLine = true, modifier = Modifier.testTag("admin_product_manufacturer_field"))
                OutlinedTextField(value = shippingStr, onValueChange = { shippingStr = it }, label = { Text("Frete") }, singleLine = true, modifier = Modifier.testTag("admin_product_shipping_field"))
                OutlinedTextField(value = image, onValueChange = { image = it }, label = { Text("URL Imagem") }, singleLine = true, modifier = Modifier.testTag("admin_product_image_field"))
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Descrição") }, modifier = Modifier.testTag("admin_product_description_field"))
            }
        },
        confirmButton = {
            Button(onClick = {
                val p = Product(
                    id = initialProduct?.id ?: 0,
                    name = name,
                    price = priceStr.toDoubleOrNull() ?: 0.0,
                    category = category.ifEmpty { null },
                    manufacturer = manufacturer.ifEmpty { null },
                    shipping_cost = shippingStr.toDoubleOrNull() ?: 0.0,
                    image = image.ifEmpty { null },
                    description = description.ifEmpty { null }
                )
                onSave(p, initialProduct != null)
            }, modifier = Modifier.testTag("admin_product_save_button")) {
                Text("Salvar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
