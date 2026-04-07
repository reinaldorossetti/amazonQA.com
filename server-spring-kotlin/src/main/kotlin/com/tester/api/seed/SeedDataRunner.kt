package com.tester.api.seed

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.tester.api.user.UserRoleRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.stereotype.Component
import java.io.File

@Component
class SeedDataRunner(
    private val jdbcTemplate: JdbcTemplate,
    private val userRoleRepository: UserRoleRepository,
    private val objectMapper: ObjectMapper,
    @Value("\${SEED_ADMIN_EMAIL:admin@tester.com}") private val adminEmail: String,
    @Value("\${SEED_ADMIN_PASSWORD:Admin@123}") private val adminPassword: String,
    @Value("\${SEED_NORMAL_EMAIL:user@tester.com}") private val normalEmail: String,
    @Value("\${SEED_NORMAL_PASSWORD:User@123}") private val normalPassword: String,
    @Value("\${BCRYPT_PEPPER:}") private val pepper: String,
    @Value("\${BCRYPT_SALT_ROUNDS:12}") private val saltRounds: Int,
    @Value("\${SEED_RESET_DB:true}") private val resetDb: Boolean,
) : ApplicationRunner {

    data class ProductSeed(
        val name: String,
        val price: Double,
        val description: String? = null,
        val category: String? = null,
        val image: String? = null,
        val manufacturer: String? = null,
        val line: String? = null,
        val model: String? = null
    )

    override fun run(args: ApplicationArguments) {
        if (resetDb) {
            println("🗑️ Limpando banco de dados (TRUNCATE CASCADE)...")
            jdbcTemplate.execute("TRUNCATE TABLE payments, order_items, orders, cart_items, user_roles, users, products CASCADE")
            println("✓ Todas as tabelas limpas.")
        }

        ensureUser(adminEmail.trim().lowercase(), adminPassword, isAdmin = true)
        ensureUser(normalEmail.trim().lowercase(), normalPassword, isAdmin = false)

        val productsFile = File("../web/src/data/products_mock.json")
        if (productsFile.exists()) {
            val products: List<ProductSeed> = objectMapper.readValue(productsFile)
            println("🌱 Inserindo \${products.size} produtos...")
            for (p in products) {
                jdbcTemplate.update(
                    """
                    INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT DO NOTHING
                    """.trimIndent(),
                    p.name, p.price, p.description, p.category, p.image, p.manufacturer, p.line, p.model
                )
            }
            println("✓ Produtos inseridos.")
        }
    }

    private fun ensureUser(email: String, plainPassword: String, isAdmin: Boolean) {
        val hashed = BCrypt.hashpw(plainPassword + pepper, BCrypt.gensalt(validSaltRounds()))
        val rows = jdbcTemplate.queryForList("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1", email)
        val userId = if (rows.isEmpty()) {
            val created = jdbcTemplate.queryForList(
                """
                INSERT INTO users (
                    person_type, first_name, last_name, email, password,
                    is_active, updated_at
                ) VALUES ('PF', 'Reinaldo', 'Rossetti', ?, ?, TRUE, NOW())
                RETURNING id
                """.trimIndent(),
                email,
                hashed,
            )
            (created.first()["id"] as Number).toInt()
        } else {
            val existingId = (rows.first()["id"] as Number).toInt()
            jdbcTemplate.update(
                """
                UPDATE users
                SET first_name = 'Reinaldo',
                    last_name = 'Rossetti',
                    password = ?,
                    is_active = TRUE,
                    account_closed_at = NULL,
                    updated_at = NOW()
                WHERE id = ?
                """.trimIndent(),
                hashed,
                existingId,
            )
            existingId
        }

        userRoleRepository.ensureRole(userId, "user")
        if (isAdmin) {
            userRoleRepository.ensureRole(userId, "admin")
        } else {
            jdbcTemplate.update("DELETE FROM user_roles WHERE user_id = ? AND role = 'admin'", userId)
        }
    }

    private fun validSaltRounds(): Int {
        return if (saltRounds in 4..31) saltRounds else 12
    }
}
