package com.tester.api.user

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository

@Repository
class UserRoleRepository(
    private val jdbcTemplate: JdbcTemplate,
) {
    fun isUserAdmin(userId: Int): Boolean {
        val count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role = 'admin'",
            Long::class.java,
            userId,
        ) ?: 0L

        return count > 0
    }

    fun getRoles(userId: Int): List<String> {
        return jdbcTemplate.query(
            "SELECT role FROM user_roles WHERE user_id = ? ORDER BY role ASC",
            { rs, _ -> rs.getString("role") },
            userId,
        )
    }

    fun ensureRole(userId: Int, role: String) {
        jdbcTemplate.update(
            """
            INSERT INTO user_roles (user_id, role)
            VALUES (?, ?)
            ON CONFLICT (user_id, role) DO NOTHING
            """.trimIndent(),
            userId,
            role,
        )
    }
}
