package com.tester.api.user

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UsersAuthController(
    private val userService: UserService,
) {

    @PostMapping("/register")
    fun register(@RequestBody body: RegisterUserRequest): ResponseEntity<Map<String, Any?>> {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(body))
    }

    @PostMapping("/login")
    fun login(@RequestBody body: LoginRequest): ResponseEntity<Map<String, Any?>> {
        return ResponseEntity.ok(userService.login(body))
    }
}
