package com.tester.api.user

import com.tester.api.auth.JwtService
import com.tester.api.common.ApiException
import org.springframework.beans.factory.annotation.Value
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.security.crypto.bcrypt.BCrypt

@Service
class UserService(
    private val jdbcTemplate: JdbcTemplate,
    private val userRoleRepository: UserRoleRepository,
    private val jwtService: JwtService,
    @Value("\${BCRYPT_PEPPER:}") private val bcryptPepper: String,
    @Value("\${BCRYPT_SALT_ROUNDS:12}") private val bcryptSaltRounds: Int,
) {

    @Transactional
    fun register(body: RegisterUserRequest): Map<String, Any?> {
        validateRequiredForCreate(body.first_name, body.last_name, body.email, body.password)

        val email = body.email!!.trim().lowercase()
        ensureUniqueEmail(email)
        ensureUniqueCpf(body.cpf, null)
        ensureUniqueCnpj(body.cnpj, null)

        val hashedPassword = BCrypt.hashpw(body.password + bcryptPepper, BCrypt.gensalt(saltRounds()))

        val rows = jdbcTemplate.queryForList(
            """
            INSERT INTO users (
              person_type, first_name, last_name, email, phone, password,
              cpf, cnpj, company_name,
              address_zip, address_street, address_number, address_complement,
              address_neighborhood, address_city, address_state,
              residence_proof_filename, updated_at, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)
            RETURNING id, person_type, first_name, last_name, email, created_at
            """.trimIndent(),
            body.person_type ?: "PF",
            body.first_name,
            body.last_name,
            email,
            body.phone,
            hashedPassword,
            normalizeDigits(body.cpf),
            normalizeDigits(body.cnpj),
            body.company_name,
            body.address_zip,
            body.address_street,
            body.address_number,
            body.address_complement,
            body.address_neighborhood,
            body.address_city,
            body.address_state,
            body.residence_proof_filename,
        )

        val created = rows.firstOrNull() ?: throw ApiException(500, "Failed to register user")
        val createdId = (created["id"] as Number).toInt()
        userRoleRepository.ensureRole(createdId, "user")
        return created
    }

    fun login(body: LoginRequest): Map<String, Any?> {
        if (body.email.isNullOrBlank() || body.password.isNullOrBlank()) {
            throw ApiException(400, "email and password are required")
        }

        val rows = jdbcTemplate.queryForList("SELECT * FROM users WHERE email = ?", body.email.trim().lowercase())
        val user = rows.firstOrNull() ?: throw ApiException(401, "Invalid credentials.")

        val isActive = (user["is_active"] as? Boolean) ?: true
        val accountClosedAt = user["account_closed_at"]
        if (!isActive || accountClosedAt != null) {
            throw ApiException(403, "Account closed or inactive.")
        }

        val passwordHash = user["password"]?.toString() ?: throw ApiException(401, "Invalid credentials.")
        val passwordOk = BCrypt.checkpw(body.password + bcryptPepper, passwordHash)
        if (!passwordOk) {
            throw ApiException(401, "Invalid credentials.")
        }

        val userId = (user["id"] as Number).toInt()
        val roles = userRoleRepository.getRoles(userId)
        val isAdmin = roles.contains("admin")
        val token = jwtService.signAccessToken(
            userId = userId,
            email = user["email"]?.toString(),
            personType = user["person_type"]?.toString(),
        )

        val safeUser = user.toMutableMap()
        safeUser.remove("password")
        safeUser["roles"] = roles
        safeUser["isAdmin"] = isAdmin

        return mapOf(
            "accessToken" to token.accessToken,
            "tokenType" to "Bearer",
            "expiresIn" to token.expiresIn,
            "user" to safeUser,
        )
    }

    fun listUsers(page: Int, pageSize: Int, status: String): Map<String, Any?> {
        val normalizedPage = page.coerceAtLeast(1)
        val normalizedPageSize = pageSize.coerceIn(1, 100)
        val offset = (normalizedPage - 1) * normalizedPageSize

        val whereClause = when (status.lowercase()) {
            "active" -> "WHERE COALESCE(is_active, true) = true"
            "closed" -> "WHERE COALESCE(is_active, true) = false"
            else -> ""
        }

        val total = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM users $whereClause",
            Int::class.java,
        ) ?: 0

        val items = jdbcTemplate.queryForList(
            """
            SELECT id, person_type, first_name, last_name, email, phone,
                   created_at, updated_at, is_active, account_closed_at
            FROM users
            $whereClause
            ORDER BY id ASC
            LIMIT ? OFFSET ?
            """.trimIndent(),
            normalizedPageSize,
            offset,
        )

        return mapOf(
            "page" to normalizedPage,
            "pageSize" to normalizedPageSize,
            "total" to total,
            "items" to items,
        )
    }

    @Transactional
    fun adminCreateUser(body: AdminCreateUserRequest): Map<String, Any?> {
        validateRequiredForCreate(body.first_name, body.last_name, body.email, body.password)

        val email = body.email!!.trim().lowercase()
        ensureUniqueEmail(email)
        ensureUniqueCpf(body.cpf, null)
        ensureUniqueCnpj(body.cnpj, null)

        val hashedPassword = BCrypt.hashpw(body.password + bcryptPepper, BCrypt.gensalt(saltRounds()))

        val rows = jdbcTemplate.queryForList(
            """
            INSERT INTO users (
              person_type, first_name, last_name, email, phone, password,
              cpf, cnpj, company_name,
              address_zip, address_street, address_number, address_complement,
              address_neighborhood, address_city, address_state,
              residence_proof_filename, updated_at, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)
            RETURNING id, person_type, first_name, last_name, email, created_at, updated_at, is_active
            """.trimIndent(),
            body.person_type ?: "PF",
            body.first_name,
            body.last_name,
            email,
            body.phone,
            hashedPassword,
            normalizeDigits(body.cpf),
            normalizeDigits(body.cnpj),
            body.company_name,
            body.address_zip,
            body.address_street,
            body.address_number,
            body.address_complement,
            body.address_neighborhood,
            body.address_city,
            body.address_state,
            body.residence_proof_filename,
        )

        val created = rows.firstOrNull() ?: throw ApiException(500, "Failed to register user")
        val userId = (created["id"] as Number).toInt()

        userRoleRepository.ensureRole(userId, "user")
        val normalizedRole = if (body.role == "admin") "admin" else "user"
        if (normalizedRole == "admin") {
            userRoleRepository.ensureRole(userId, "admin")
        }

        return created + mapOf("roles" to userRoleRepository.getRoles(userId))
    }

    fun getUserById(userId: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            """
            SELECT id, person_type, first_name, last_name, email, phone,
                   cpf, cnpj, company_name,
                   address_zip, address_street, address_number, address_complement,
                   address_neighborhood, address_city, address_state,
                   residence_proof_filename,
                   created_at, updated_at, is_active, account_closed_at
            FROM users
            WHERE id = ?
            """.trimIndent(),
            userId,
        )

        val user = rows.firstOrNull() ?: throw ApiException(404, "User not found")
        val roles = userRoleRepository.getRoles(userId)
        return user + mapOf("roles" to roles, "isAdmin" to roles.contains("admin"))
    }

    @Transactional
    fun updateUser(userId: Int, body: UserUpdateRequest): Map<String, Any?> {
        val updates = mutableListOf<String>()
        val values = mutableListOf<Any?>()

        fun addIfPresent(column: String, value: Any?) {
            if (value != null) {
                updates.add("$column = ?")
                values.add(value)
            }
        }

        addIfPresent("person_type", body.person_type)
        addIfPresent("first_name", body.first_name)
        addIfPresent("last_name", body.last_name)
        addIfPresent("phone", body.phone)
        addIfPresent("company_name", body.company_name)
        addIfPresent("address_zip", body.address_zip)
        addIfPresent("address_street", body.address_street)
        addIfPresent("address_number", body.address_number)
        addIfPresent("address_complement", body.address_complement)
        addIfPresent("address_neighborhood", body.address_neighborhood)
        addIfPresent("address_city", body.address_city)
        addIfPresent("address_state", body.address_state)
        addIfPresent("residence_proof_filename", body.residence_proof_filename)

        if (body.email != null) {
            val email = body.email.trim().lowercase()
            ensureUniqueEmail(email, userId)
            updates.add("email = ?")
            values.add(email)
        }

        if (body.cpf != null) {
            val cpf = normalizeDigits(body.cpf)
            ensureUniqueCpf(cpf, userId)
            updates.add("cpf = ?")
            values.add(cpf)
        }

        if (body.cnpj != null) {
            val cnpj = normalizeDigits(body.cnpj)
            ensureUniqueCnpj(cnpj, userId)
            updates.add("cnpj = ?")
            values.add(cnpj)
        }

        if (updates.isEmpty()) {
            throw ApiException(400, "No fields to update")
        }

        val sql = """
            UPDATE users
            SET ${updates.joinToString(", ")}, updated_at = NOW()
            WHERE id = ?
        """.trimIndent()

        val args = (values + userId).toTypedArray()
        val affected = jdbcTemplate.update(sql, *args)
        if (affected == 0) {
            throw ApiException(404, "User not found")
        }

        return getUserById(userId)
    }

    @Transactional
    fun deleteUser(userId: Int): Map<String, Any?> {
        val affected = jdbcTemplate.update("DELETE FROM users WHERE id = ?", userId)
        if (affected == 0) {
            throw ApiException(404, "User not found")
        }

        return mapOf(
            "message" to "User permanently removed",
            "id" to userId,
        )
    }

    @Transactional
    fun terminateUser(userId: Int): Map<String, Any?> {
        val rows = jdbcTemplate.queryForList(
            "SELECT id, account_closed_at FROM users WHERE id = ?",
            userId,
        )

        val user = rows.firstOrNull() ?: throw ApiException(404, "User not found")
        if (user["account_closed_at"] != null) {
            throw ApiException(409, "Account is already closed")
        }

        val randomPassword = java.util.UUID.randomUUID().toString()
        val hashedPassword = BCrypt.hashpw(randomPassword + bcryptPepper, BCrypt.gensalt(saltRounds()))
        val obscuredEmail = "closed-$userId-${System.currentTimeMillis()}@anon.local"

        jdbcTemplate.update(
            """
            UPDATE users
            SET last_name = '[REDACTED]',
                email = ?,
                phone = NULL,
                password = ?,
                cpf = NULL,
                cnpj = NULL,
                company_name = NULL,
                address_zip = NULL,
                address_street = NULL,
                address_number = NULL,
                address_complement = NULL,
                address_neighborhood = NULL,
                address_city = NULL,
                address_state = NULL,
                residence_proof_filename = NULL,
                is_active = FALSE,
                account_closed_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
            """.trimIndent(),
            obscuredEmail,
            hashedPassword,
            userId,
        )

        jdbcTemplate.update("DELETE FROM user_roles WHERE user_id = ?", userId)
        userRoleRepository.ensureRole(userId, "user")

        val updatedRows = jdbcTemplate.queryForList(
            "SELECT id, first_name, created_at, account_closed_at, is_active FROM users WHERE id = ?",
            userId,
        )

        return mapOf(
            "message" to "Account closed with data obfuscation applied",
            "user" to updatedRows.first(),
        )
    }

    fun me(authUserId: Int): Map<String, Any?> = getUserById(authUserId)

    @Transactional
    fun updateMyAddress(authUserId: Int, body: AddressUpdateRequest): Map<String, Any?> {
        val updates = mutableListOf<String>()
        val values = mutableListOf<Any?>()

        fun addIfPresent(column: String, value: String?) {
            if (value != null) {
                updates.add("$column = ?")
                values.add(value)
            }
        }

        addIfPresent("address_zip", body.address_zip)
        addIfPresent("address_street", body.address_street)
        addIfPresent("address_number", body.address_number)
        addIfPresent("address_complement", body.address_complement)
        addIfPresent("address_neighborhood", body.address_neighborhood)
        addIfPresent("address_city", body.address_city)
        addIfPresent("address_state", body.address_state)

        if (updates.isEmpty()) {
            throw ApiException(400, "No address fields to update")
        }

        val sql = """
            UPDATE users
            SET ${updates.joinToString(", ")}, updated_at = NOW()
            WHERE id = ?
            RETURNING id, person_type, first_name, last_name, email, phone,
                      address_zip, address_street, address_number, address_complement,
                      address_neighborhood, address_city, address_state,
                      updated_at
        """.trimIndent()

        val rows = jdbcTemplate.queryForList(sql, *(values + authUserId).toTypedArray())
        return rows.firstOrNull() ?: throw ApiException(404, "User not found")
    }

    private fun validateRequiredForCreate(
        firstName: String?,
        lastName: String?,
        email: String?,
        password: String?,
    ) {
        if (firstName.isNullOrBlank() || lastName.isNullOrBlank() || email.isNullOrBlank() || password.isNullOrBlank()) {
            throw ApiException(400, "Required fields: first_name, last_name, email, password")
        }
    }

    private fun normalizeDigits(value: String?): String? =
        value?.replace(Regex("\\D"), "")?.takeIf { it.isNotBlank() }

    private fun ensureUniqueEmail(email: String, excludeUserId: Int? = null) {
        val rows = if (excludeUserId != null) {
            jdbcTemplate.queryForList("SELECT id FROM users WHERE email = ? AND id <> ?", email, excludeUserId)
        } else {
            jdbcTemplate.queryForList("SELECT id FROM users WHERE email = ?", email)
        }

        if (rows.isNotEmpty()) {
            throw ApiException(409, "This email is already registered.")
        }
    }

    private fun ensureUniqueCpf(cpf: String?, excludeUserId: Int?) {
        if (cpf.isNullOrBlank()) return
        val rows = if (excludeUserId != null) {
            jdbcTemplate.queryForList("SELECT id FROM users WHERE cpf = ? AND id <> ?", cpf, excludeUserId)
        } else {
            jdbcTemplate.queryForList("SELECT id FROM users WHERE cpf = ?", cpf)
        }

        if (rows.isNotEmpty()) {
            throw ApiException(409, "This CPF is already registered.")
        }
    }

    private fun ensureUniqueCnpj(cnpj: String?, excludeUserId: Int?) {
        if (cnpj.isNullOrBlank()) return
        val rows = if (excludeUserId != null) {
            jdbcTemplate.queryForList("SELECT id FROM users WHERE cnpj = ? AND id <> ?", cnpj, excludeUserId)
        } else {
            jdbcTemplate.queryForList("SELECT id FROM users WHERE cnpj = ?", cnpj)
        }

        if (rows.isNotEmpty()) {
            throw ApiException(409, "This CNPJ is already registered.")
        }
    }

    private fun saltRounds(): Int {
        if (bcryptSaltRounds !in 4..31) {
            throw ApiException(500, "Invalid BCRYPT_SALT_ROUNDS. Expected value between 4 and 31")
        }
        return bcryptSaltRounds
    }
}
