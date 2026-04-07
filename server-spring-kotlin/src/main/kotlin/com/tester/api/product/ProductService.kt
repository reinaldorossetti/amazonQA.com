package com.tester.api.product

import com.tester.api.common.ApiException
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service

@Service
class ProductService(
    private val jdbcTemplate: JdbcTemplate,
) {
    fun list(category: String?): List<Map<String, Any?>> {
        return if (!category.isNullOrBlank()) {
            jdbcTemplate.queryForList(
                "SELECT * FROM products WHERE category = ? ORDER BY name ASC",
                category,
            )
        } else {
            jdbcTemplate.queryForList("SELECT * FROM products ORDER BY name ASC")
        }
    }

    fun getById(id: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList("SELECT * FROM products WHERE id = ?", id)
        return rows.firstOrNull() ?: throw ApiException(404, "Product not found")
    }

    fun create(body: ProductBody): Map<String, Any?> {
        if (body.name.isNullOrBlank() || body.price == null) {
            throw ApiException(400, "name and price are required")
        }

        val rows = jdbcTemplate.queryForList(
            """
            INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            """.trimIndent(),
            body.name,
            body.price,
            body.description,
            body.category,
            body.image,
            body.manufacturer,
            body.line,
            body.model,
        )

        return rows.first()
    }

    fun update(id: Int, body: ProductBody): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            """
            UPDATE products
            SET name = ?, price = ?, description = ?, category = ?, image = ?, manufacturer = ?, line = ?, model = ?
            WHERE id = ?
            RETURNING *
            """.trimIndent(),
            body.name,
            body.price,
            body.description,
            body.category,
            body.image,
            body.manufacturer,
            body.line,
            body.model,
            id,
        )

        return rows.firstOrNull() ?: throw ApiException(404, "Product not found")
    }

    fun delete(id: Int): Map<String, String> {
        return try {
            val affectedRows = jdbcTemplate.update("DELETE FROM products WHERE id = ?", id)
            if (affectedRows == 0) {
                throw ApiException(404, "Product not found")
            }
            mapOf("message" to "Product removed")
        } catch (ex: DataIntegrityViolationException) {
            throw ApiException(409, "Product is linked to orders and cannot be removed")
        }
    }
}
