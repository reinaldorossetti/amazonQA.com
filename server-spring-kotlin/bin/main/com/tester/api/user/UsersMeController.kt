package com.tester.api.user

import com.tester.api.auth.AuthFacade
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users/me")
class UsersMeController(
    private val userService: UserService,
    private val authFacade: AuthFacade,
) {

    @GetMapping
    fun me(): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        return ResponseEntity.ok(userService.me(authUser.userId))
    }

    @PutMapping("/address")
    fun updateAddress(@RequestBody body: AddressUpdateRequest): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        return ResponseEntity.ok(userService.updateMyAddress(authUser.userId, body))
    }
}
