package com.tester.api.order

import com.tester.api.auth.AuthFacade
import com.tester.api.user.UserRoleRepository
import jakarta.validation.constraints.Min
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/orders")
@Validated
class OrdersController(
    private val orderService: OrderService,
    private val authFacade: AuthFacade,
    private val userRoleRepository: UserRoleRepository,
) {

    @GetMapping
    fun list(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") pageSize: Int,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) userId: Int?,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val isAdmin = userRoleRepository.isUserAdmin(authUser.userId)
        return ResponseEntity.ok(orderService.listOrders(authUser.userId, isAdmin, page, pageSize, status, userId))
    }

    @PostMapping
    fun create(
        @RequestHeader(value = "Idempotency-Key", required = false) idempotencyKey: String?,
        @RequestBody(required = false) request: CreateOrderRequest?,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val (status, body) = orderService.createOrder(authUser.userId, idempotencyKey, request ?: CreateOrderRequest())
        return ResponseEntity.status(status).body(body)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable("id") @Min(1) id: Int): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val ownerId = orderService.getOrderOwnerId(id)
        authFacade.requireOwnerOrAdmin(ownerId, authUser.userId)
        return ResponseEntity.ok(orderService.getOrderById(id))
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable("id") @Min(1) id: Int,
        @RequestBody request: UpdateOrderRequest,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val ownerId = orderService.getOrderOwnerId(id)
        authFacade.requireOwnerOrAdmin(ownerId, authUser.userId)
        val isAdmin = userRoleRepository.isUserAdmin(authUser.userId)
        return ResponseEntity.ok(orderService.updateOrder(id, request, isAdmin))
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable("id") @Min(1) id: Int): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val ownerId = orderService.getOrderOwnerId(id)
        authFacade.requireOwnerOrAdmin(ownerId, authUser.userId)
        return ResponseEntity.ok(orderService.cancelOrder(id))
    }
}
