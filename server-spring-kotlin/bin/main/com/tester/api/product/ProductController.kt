package com.tester.api.product

import com.tester.api.auth.AuthFacade
import com.tester.api.common.ApiException
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
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
@RequestMapping("/api/products")
@Validated
class ProductController(
    private val productService: ProductService,
    private val authFacade: AuthFacade,
) {
    @GetMapping
    fun list(@RequestParam(required = false) category: String?): List<Map<String, Any?>> =
        productService.list(category)

    @GetMapping("/{id}")
    fun getById(@PathVariable @Min(1) id: Int): Map<String, Any?> = productService.getById(id)

    @PostMapping
    fun create(@Valid @RequestBody body: ProductBody): org.springframework.http.ResponseEntity<Map<String, Any?>> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireAdmin(authUser.userId)
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(productService.create(body))
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable @Min(1) id: Int,
        @Valid @RequestBody body: ProductBody,
    ): Map<String, Any?> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireAdmin(authUser.userId)
        return productService.update(id, body)
    }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable @Min(1) id: Int): Map<String, String> {
        val authUser = authFacade.requireAuthenticatedUser()
        authFacade.requireAdmin(authUser.userId)
        return productService.delete(id)
    }
}
