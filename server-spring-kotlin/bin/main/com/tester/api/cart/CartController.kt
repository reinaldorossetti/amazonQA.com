package com.tester.api.cart

import com.tester.api.auth.AuthFacade
import jakarta.validation.constraints.Min
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/cart")
@Validated
class CartController(
    private val cartService: CartService,
    private val authFacade: AuthFacade,
) {

    @GetMapping
    fun list(@RequestParam(required = false) userId: Int?): ResponseEntity<List<Map<String, Any?>>> {
        val authUser = authFacade.requireAuthenticatedUser()
        return ResponseEntity.ok(cartService.list(authUser.userId, userId))
    }

    @PostMapping
    fun addItems(@RequestBody request: AddCartItemsRequest): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addItems(authUser.userId, request))
    }

    @DeleteMapping
    fun deleteItem(@RequestBody request: DeleteCartItemRequest): ResponseEntity<Map<String, String>> {
        val authUser = authFacade.requireAuthenticatedUser()
        return ResponseEntity.ok(cartService.deleteItem(authUser.userId, request))
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable("id") @Min(1) id: Int): ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        return ResponseEntity.ok(cartService.getById(authUser.userId, id))
    }
}
