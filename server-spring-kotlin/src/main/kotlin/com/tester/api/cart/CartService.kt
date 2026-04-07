package com.tester.api.cart

import com.tester.api.common.ApiException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CartService(
    private val jdbcTemplate: JdbcTemplate,
) {

    fun list(authUserId: Int, userIdParam: Int?): List<Map<String, Any?>> {
        val userId = userIdParam ?: authUserId
        if (userId != authUserId) {
            throw ApiException(403, "Access denied for this user")
        }

        return jdbcTemplate.queryForList(
            """
            SELECT ci.id, ci.quantity, ci.added_at,
                   p.id AS product_id, p.name, p.price, p.image, p.category
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = ?
            ORDER BY ci.added_at ASC
            """.trimIndent(),
            userId,
        )
    }

    fun getById(authUserId: Int, cartItemId: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            """
            SELECT ci.id, ci.quantity, ci.added_at,
                   p.id AS product_id, p.name, p.price, p.image, p.category
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.id = ? AND ci.user_id = ?
            LIMIT 1
            """.trimIndent(),
            cartItemId,
            authUserId,
        )

        return rows.firstOrNull() ?: throw ApiException(404, "Cart item not found")
    }

    @Transactional
    fun addItems(authUserId: Int, request: AddCartItemsRequest): Map<String, Any?> {
        val products = request.products ?: throw ApiException(400, "products must be a non-empty array")
        if (products.isEmpty()) {
            throw ApiException(400, "products must be a non-empty array")
        }

        val normalized = mutableListOf<Pair<Int, Int>>()
        val idsSeen = mutableSetOf<Int>()

        products.forEach { item ->
            val productId = item.productId ?: throw ApiException(400, "Invalid productId")
            val quantity = item.quantity ?: 1

            if (productId <= 0) throw ApiException(400, "Invalid productId")
            if (quantity < 1) throw ApiException(400, "quantity must be an integer greater than or equal to 1")
            if (quantity > 99) throw ApiException(400, "Product does not have enough quantity")
            if (!idsSeen.add(productId)) throw ApiException(400, "Duplicate products are not allowed")

            normalized.add(productId to quantity)
        }

        val existingProducts = jdbcTemplate.queryForList(
            "SELECT id FROM products WHERE id = ANY(?::int[])",
            normalized.map { it.first }.toTypedArray(),
        ).map { (it["id"] as Number).toInt() }.toSet()

        if (normalized.any { !existingProducts.contains(it.first) }) {
            throw ApiException(400, "Product not found")
        }

        val affected = mutableListOf<Map<String, Any?>>()

        normalized.forEach { (productId, quantity) ->
            val rows = jdbcTemplate.queryForList(
                """
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES (?, ?, ?)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
                RETURNING *
                """.trimIndent(),
                authUserId,
                productId,
                quantity,
            )
            affected.add(rows.first())
        }

        return mapOf(
            "items" to affected,
            "processed" to affected.size,
        )
    }

    fun deleteItem(authUserId: Int, request: DeleteCartItemRequest): Map<String, String> {
        val cartItemId = request.cartItemId ?: throw ApiException(400, "cartItemId is required")

        val affected = jdbcTemplate.update(
            "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
            cartItemId,
            authUserId,
        )

        if (affected == 0) {
            throw ApiException(404, "Item not found")
        }

        return mapOf("message" to "Item removed from cart")
    }
}
