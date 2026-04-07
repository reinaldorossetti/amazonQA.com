package com.tester.api.auth

import com.tester.api.common.ApiException
import com.tester.api.user.UserRoleRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class AuthFacade(
    private val userRoleRepository: UserRoleRepository,
) {
    fun currentUserOrNull(): AuthenticatedUser? {
        val principal = SecurityContextHolder.getContext().authentication?.principal
        return principal as? AuthenticatedUser
    }

    fun requireAuthenticatedUser(): AuthenticatedUser {
        return currentUserOrNull() ?: throw ApiException(401, "Missing bearer token")
    }

    fun requireAdmin(userId: Int) {
        if (!userRoleRepository.isUserAdmin(userId)) {
            throw ApiException(403, "Access restricted to administrators")
        }
    }

    fun requireOwnerOrAdmin(targetUserId: Int, authUserId: Int) {
        if (targetUserId == authUserId) {
            return
        }

        if (!userRoleRepository.isUserAdmin(authUserId)) {
            throw ApiException(403, "Access denied for this user")
        }
    }
}
