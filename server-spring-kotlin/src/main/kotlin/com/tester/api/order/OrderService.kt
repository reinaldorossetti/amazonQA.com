package com.tester.api.order

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.tester.api.common.ApiException
import org.postgresql.util.PGobject
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import kotlin.math.max

@Service
class OrderService(
    private val jdbcTemplate: JdbcTemplate,
) {
    private val objectMapper = jacksonObjectMapper()
    private val allowedPaymentMethods = setOf("credit", "debit", "pix", "boleto")

    fun listOrders(authUserId: Int, isAdmin: Boolean, page: Int, pageSize: Int, status: String?, userId: Int?): Map<String, Any?> {
        val p = page.coerceAtLeast(1)
        val ps = pageSize.coerceIn(1, 100)
        val offset = (p - 1) * ps

        val filters = mutableListOf<String>()
        val values = mutableListOf<Any>()

        if (isAdmin) {
            if (userId != null && userId > 0) {
                filters.add("user_id = ?")
                values.add(userId)
            }
        } else {
            filters.add("user_id = ?")
            values.add(authUserId)
        }

        if (!status.isNullOrBlank()) {
            filters.add("LOWER(status) = ?")
            values.add(status.lowercase())
        }

        val where = if (filters.isEmpty()) "" else "WHERE ${filters.joinToString(" AND ")}"

        val total = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM orders $where",
            Int::class.java,
            *values.toTypedArray(),
        ) ?: 0

        val rows = jdbcTemplate.queryForList(
            """
            SELECT id, order_number, user_id, status,
                   subtotal, shipping_total, discount_total, grand_total,
                   currency, payment_method, created_at, updated_at, cancelled_at
            FROM orders
            $where
            ORDER BY created_at DESC, id DESC
            LIMIT ? OFFSET ?
            """.trimIndent(),
            *(values + listOf(ps, offset)).toTypedArray(),
        )

        return mapOf(
            "page" to p,
            "pageSize" to ps,
            "total" to total,
            "items" to rows,
        )
    }

    @Transactional
    fun createOrder(authUserId: Int, idempotencyKey: String?, request: CreateOrderRequest): Pair<Int, Map<String, Any?>> {
        val shippingTotal = request.shippingTotal ?: 0.0
        val discountTotal = request.discountTotal ?: 0.0

        if (shippingTotal < 0) throw ApiException(400, "Invalid shippingTotal")
        if (discountTotal < 0) throw ApiException(400, "Invalid discountTotal")

        val key = idempotencyKey?.trim()?.takeIf { it.isNotBlank() }
        if (key != null) {
            val existing = jdbcTemplate.queryForList(
                "SELECT id FROM orders WHERE user_id = ? AND idempotency_key = ? LIMIT 1",
                authUserId,
                key,
            )
            if (existing.isNotEmpty()) {
                val existingId = (existing.first()["id"] as Number).toInt()
                return 200 to getOrderById(existingId)
            }
        }

        val cartRows = jdbcTemplate.queryForList(
            """
            SELECT ci.product_id, ci.quantity, p.name AS product_name, p.price AS unit_price
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = ?
            ORDER BY ci.id ASC
            """.trimIndent(),
            authUserId,
        )

        val sourceRows = if (cartRows.isNotEmpty()) {
            cartRows
        } else {
            val requestItems = request.items ?: emptyList()
            if (requestItems.isEmpty()) {
                throw ApiException(400, "Empty cart")
            }

            requestItems.map { item ->
                val productId = item.productId ?: throw ApiException(400, "items contains invalid productId")
                val quantity = item.quantity ?: 1
                if (productId <= 0 || quantity < 1) {
                    throw ApiException(400, "items contains invalid product payload")
                }

                val productRows = jdbcTemplate.queryForList(
                    "SELECT id, name, price FROM products WHERE id = ?",
                    productId,
                )

                val product = productRows.firstOrNull() ?: throw ApiException(400, "Product not found at checkout")
                mapOf(
                    "product_id" to productId,
                    "quantity" to quantity,
                    "product_name" to product["name"],
                    "unit_price" to product["price"],
                )
            }
        }

        val subtotal = sourceRows.sumOf {
            ((it["unit_price"] as Number).toDouble() * (it["quantity"] as Number).toInt())
        }

        val grandTotal = subtotal + shippingTotal - discountTotal
        if (grandTotal < 0) {
            throw ApiException(400, "Invalid order total")
        }

        val shippingAddress = toJsonb(request.shippingAddress)
        val billingInfo = toJsonb(request.billingInfo)

        val inserted = jdbcTemplate.queryForList(
            """
            INSERT INTO orders (
              user_id, status, subtotal, shipping_total, discount_total,
              grand_total, currency, payment_method, idempotency_key,
              shipping_address, billing_info, updated_at
            ) VALUES (?, 'created', ?, ?, ?, ?, 'BRL', ?, ?, ?, ?, NOW())
            RETURNING id
            """.trimIndent(),
            authUserId,
            subtotal,
            shippingTotal,
            discountTotal,
            grandTotal,
            request.paymentMethod,
            key,
            shippingAddress,
            billingInfo,
        )

        val orderId = (inserted.first()["id"] as Number).toInt()
        val orderNumber = "ORD-${LocalDate.now().toString().replace("-", "")}-${orderId.toString().padStart(6, '0')}"

        jdbcTemplate.update(
            "UPDATE orders SET order_number = ?, updated_at = NOW() WHERE id = ?",
            orderNumber,
            orderId,
        )

        sourceRows.forEach { row ->
            val lineTotal = (row["unit_price"] as Number).toDouble() * (row["quantity"] as Number).toInt()
            jdbcTemplate.update(
                """
                INSERT INTO order_items (
                  order_id, product_id, product_name_snapshot,
                  unit_price_snapshot, quantity, line_total
                ) VALUES (?, ?, ?, ?, ?, ?)
                """.trimIndent(),
                orderId,
                (row["product_id"] as Number).toInt(),
                row["product_name"]?.toString(),
                (row["unit_price"] as Number).toDouble(),
                (row["quantity"] as Number).toInt(),
                lineTotal,
            )
        }

        if (cartRows.isNotEmpty()) {
            jdbcTemplate.update("DELETE FROM cart_items WHERE user_id = ?", authUserId)
        }

        return 201 to getOrderById(orderId)
    }

    fun getOrderById(orderId: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            """
            SELECT id, order_number, user_id, status,
                   subtotal, shipping_total, discount_total, grand_total,
                   currency, payment_method, idempotency_key,
                   shipping_address, billing_info,
                   created_at, updated_at, cancelled_at
            FROM orders
            WHERE id = ?
            """.trimIndent(),
            orderId,
        )

        val order = rows.firstOrNull() ?: throw ApiException(404, "Order not found")

        val items = jdbcTemplate.queryForList(
            """
            SELECT id, order_id, product_id,
                   product_name_snapshot, unit_price_snapshot,
                   quantity, line_total, created_at
            FROM order_items
            WHERE order_id = ?
            ORDER BY id ASC
            """.trimIndent(),
            orderId,
        )

        return order + mapOf("items" to items)
    }

    fun getOrderOwnerId(orderId: Int): Int {
        val owner = jdbcTemplate.queryForObject(
            "SELECT user_id FROM orders WHERE id = ?",
            Int::class.java,
            orderId,
        )
        return owner ?: throw ApiException(404, "Order not found")
    }

    @Transactional
    fun updateOrder(orderId: Int, request: UpdateOrderRequest, isAdmin: Boolean): Map<String, Any?> {
        val current = getOrderById(orderId)
        val currentStatus = current["status"]?.toString()?.lowercase() ?: "created"

        val updates = mutableListOf<String>()
        val values = mutableListOf<Any?>()

        if (request.status != null) {
            val nextStatus = request.status.lowercase()
            if (!canTransitionStatus(currentStatus, nextStatus)) {
                throw ApiException(400, "Invalid status transition")
            }
            updates.add("status = ?")
            values.add(nextStatus)
            if (nextStatus == "cancelled") {
                updates.add("cancelled_at = NOW()")
            }
        }

        if (isAdmin && request.paymentMethod != null) {
            updates.add("payment_method = ?")
            values.add(request.paymentMethod)
        }

        if (updates.isEmpty()) {
            throw ApiException(400, "No allowed fields to update")
        }

        val sql = "UPDATE orders SET ${updates.joinToString(", ")}, updated_at = NOW() WHERE id = ?"
        jdbcTemplate.update(sql, *(values + orderId).toTypedArray())
        return getOrderById(orderId)
    }

    @Transactional
    fun cancelOrder(orderId: Int): Map<String, Any?> {
        val existing = getOrderById(orderId)
        val status = existing["status"]?.toString()?.lowercase() ?: "created"
        if (status == "delivered") {
            throw ApiException(400, "Delivered order cannot be canceled")
        }

        jdbcTemplate.update(
            "UPDATE orders SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() WHERE id = ?",
            orderId,
        )

        return mapOf(
            "message" to "Order canceled",
            "order" to getOrderById(orderId),
        )
    }

    @Transactional
    fun createPayment(orderId: Int, authUserId: Int, request: CreateOrderPaymentRequest): Map<String, Any?> {
        val orderRows = jdbcTemplate.queryForList(
            "SELECT id, user_id, grand_total, status FROM orders WHERE id = ?",
            orderId,
        )
        val order = orderRows.firstOrNull() ?: throw ApiException(404, "Order not found")

        val method = request.method?.lowercase() ?: throw ApiException(400, "Invalid payment method")
        if (!allowedPaymentMethods.contains(method)) {
            throw ApiException(400, "Invalid payment method")
        }

        val paid = (jdbcTemplate.queryForObject(
            "SELECT COALESCE(SUM(amount), 0)::numeric FROM payments WHERE order_id = ? AND status = 'authorized'",
            Double::class.java,
            orderId,
        ) ?: 0.0)

        val orderTotal = (order["grand_total"] as Number).toDouble()
        val remaining = max(0.0, orderTotal - paid)
        val amount = request.amount ?: remaining

        if (amount <= 0) throw ApiException(400, "Invalid payment amount")
        if (amount > remaining) throw ApiException(400, "Amount exceeds order balance")

        var status = if (method == "pix" || method == "boleto") "pending" else "authorized"

        val digits = request.cardNumber?.replace(Regex("\\D"), "") ?: ""
        if ((method == "credit" || method == "debit") && digits.endsWith("0000")) {
            status = "failed"
        }

        val cardBrand = if (method == "credit" || method == "debit") {
            request.cardBrand ?: detectCardBrand(request.cardNumber)
        } else {
            null
        }

        val metadata = buildPaymentMetadata(orderId, method, amount, request)
        val metadataJson = toJsonb(metadata)

        val inserted = jdbcTemplate.queryForList(
            """
            INSERT INTO payments (
              order_id, user_id, method, amount, status,
              card_brand, provider_reference, metadata, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            RETURNING id, order_id, user_id, method, amount, status, card_brand,
                      provider_reference, metadata, created_at, updated_at
            """.trimIndent(),
            orderId,
            authUserId,
            method,
            amount,
            status,
            cardBrand,
            "sim-$method-${System.currentTimeMillis()}",
            metadataJson,
        ).first()

        if (status == "authorized") {
            val newPaid = paid + amount
            if (newPaid >= orderTotal) {
                jdbcTemplate.update(
                    "UPDATE orders SET status = 'paid', payment_method = ?, updated_at = NOW() WHERE id = ?",
                    method,
                    orderId,
                )
            }
        } else if (status == "pending") {
            jdbcTemplate.update(
                "UPDATE orders SET status = 'pending_payment', payment_method = ?, updated_at = NOW() WHERE id = ?",
                method,
                orderId,
            )
        }

        return inserted
    }

    fun getPayment(orderId: Int, paymentId: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            """
            SELECT p.id, p.order_id, p.user_id, p.method, p.amount, p.status,
                   p.card_brand, p.provider_reference, p.metadata, p.created_at, p.updated_at,
                   o.user_id AS order_owner_id
            FROM payments p
            JOIN orders o ON o.id = p.order_id
            WHERE p.order_id = ? AND p.id = ?
            """.trimIndent(),
            orderId,
            paymentId,
        )

        return rows.firstOrNull() ?: throw ApiException(404, "Payment not found")
    }

    fun getBoletoData(orderId: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            """
            SELECT p.amount, p.metadata, o.order_number
            FROM payments p
            JOIN orders o ON o.id = p.order_id
            WHERE p.order_id = ? AND p.method = 'boleto'
            ORDER BY p.created_at DESC, p.id DESC
            LIMIT 1
            """.trimIndent(),
            orderId,
        )

        return rows.firstOrNull() ?: mapOf("amount" to 0.0, "metadata" to emptyMap<String, Any>(), "order_number" to null)
    }

    private fun canTransitionStatus(current: String, next: String): Boolean {
        if (current == next) return true
        val transitions = mapOf(
            "created" to setOf("pending_payment", "paid", "cancelled"),
            "pending_payment" to setOf("paid", "cancelled"),
            "paid" to setOf("processing", "cancelled"),
            "processing" to setOf("shipped", "cancelled"),
            "shipped" to setOf("delivered"),
            "delivered" to emptySet(),
            "cancelled" to emptySet(),
        )
        return transitions[current]?.contains(next) == true
    }

    private fun toJsonb(value: Any?): PGobject? {
        if (value == null) return null
        val pg = PGobject()
        pg.type = "jsonb"
        pg.value = objectMapper.writeValueAsString(value)
        return pg
    }

    private fun detectCardBrand(cardNumber: String?): String? {
        val digits = cardNumber?.replace(Regex("\\D"), "") ?: return null
        return when {
            digits.startsWith("4") -> "visa"
            Regex("^(5[1-5]|2[2-7]).*").matches(digits) -> "mastercard"
            digits.startsWith("34") || digits.startsWith("37") -> "amex"
            else -> null
        }
    }

    private fun buildPaymentMetadata(
        orderId: Int,
        method: String,
        amount: Double,
        request: CreateOrderPaymentRequest,
    ): Map<String, Any?> {
        return when (method) {
            "pix" -> mapOf(
                "expiresAt" to java.time.Instant.now().plusSeconds(1800).toString(),
                "pixCode" to "00020126PIX${System.currentTimeMillis()}5802BR5920TESTER COM6009SAO PAULO62070503***6304ABCD",
                "qrCode" to "PIX-QR-${System.currentTimeMillis()}",
                "readableText" to "Value when reading QR Code: R$ ${"%.2f".format(amount)}",
            )
            "boleto" -> mapOf(
                "type" to "boleto",
                "issuedAt" to java.time.Instant.now().toString(),
                "dueDate" to java.time.Instant.now().plusSeconds(259200).toString(),
                "beneficiaryName" to "AmazonQA Billing Company LTD",
                "beneficiaryDocument" to "12.345.678/0001-95",
                "beneficiaryBank" to "Bank of Brazil S.A.",
                "line" to "00191.79001 01043.510047 91020.150008 8 9727002600010000",
                "barcode" to "00199727000000000000000000000000000000000000",
                "downloadUrl" to "/api/orders/$orderId/boleto/${System.currentTimeMillis()}",
            )
            else -> mapOf(
                "installments" to (request.installments ?: 1),
                "cardLast4" to (request.cardNumber?.replace(Regex("\\D"), "")?.takeLast(4) ?: ""),
            )
        }
    }
}
