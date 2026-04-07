package com.tester.api.user

import com.tester.api.auth.AuthFacade
import jakarta.validation.constraints.Min
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
@Validated
class UsersController(
    private val userService: UserService,
    private val authFacade: AuthFacade,
) {

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int,
        @RequestParam(defaultValue = "all") status: String,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireAdmin(authUser.userId)
        return ResponseEntity.ok(userService.listUsers(page, pageSize, status))
    }

    @PostMapping
    fun create(@RequestBody body: AdminCreateUserRequest): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireAdmin(authUser.userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.adminCreateUser(body))
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable @Min(1) id: Int): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireOwnerOrAdmin(id, authUser.userId)
        return ResponseEntity.ok(userService.getUserById(id))
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable @Min(1) id: Int,
        @RequestBody body: UserUpdateRequest,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireOwnerOrAdmin(id, authUser.userId)
        return ResponseEntity.ok(userService.updateUser(id, body))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable @Min(1) id: Int): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireAdmin(authUser.userId)
        return ResponseEntity.ok(userService.deleteUser(id))
    }

    @PostMapping("/{id}/terminate")
    fun terminate(@PathVariable @Min(1) id: Int): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireOwnerOrAdmin(id, authUser.userId)
        return ResponseEntity.ok(userService.terminateUser(id))
    }
}
