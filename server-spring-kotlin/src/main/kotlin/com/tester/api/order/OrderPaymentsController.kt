package com.tester.api.order

import com.tester.api.auth.AuthFacade
import com.tester.api.user.UserRoleRepository
import jakarta.validation.constraints.Min
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/orders/{id}/payments")
@Validated
class OrderPaymentsController(
    private val orderService: OrderService,
    private val authFacade: AuthFacade,
    private val userRoleRepository: UserRoleRepository,
) {

    @PostMapping
    fun createPayment(
        @PathVariable("id") @Min(1) orderId: Int,
        @RequestBody request: CreateOrderPaymentRequest,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val ownerId = orderService.getOrderOwnerId(orderId)
        authFacade.requireOwnerOrAdmin(ownerId, authUser.userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createPayment(orderId, authUser.userId, request))
    }

    @GetMapping("/{paymentId}")
    fun getPayment(
        @PathVariable("id") @Min(1) orderId: Int,
        @PathVariable("paymentId") @Min(1) paymentId: Int,
    ): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        val payment = orderService.getPayment(orderId, paymentId)

        val ownerId = (payment["order_owner_id"] as Number).toInt()
        val isAdmin = userRoleRepository.isUserAdmin(authUser.userId)
        if (!isAdmin && ownerId != authUser.userId) {
            throw com.tester.api.common.ApiException(403, "Access denied for this payment")
        }

        return ResponseEntity.ok(payment)
    }
}
