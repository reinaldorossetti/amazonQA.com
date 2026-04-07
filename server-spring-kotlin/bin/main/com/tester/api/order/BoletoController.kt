package com.tester.api.order

import jakarta.validation.constraints.Min
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/orders/{id}/boleto")
@Validated
class BoletoController(
    private val orderService: OrderService,
) {

    @GetMapping("/{reference}")
    fun download(
        @PathVariable("id") @Min(1) orderId: Int,
        @PathVariable reference: String,
    ): ResponseEntity<ByteArray> {
        val boleto = orderService.getBoletoData(orderId)
        val metadata = (boleto["metadata"] as? Map<*, *>)
            ?.mapKeys { it.key.toString() }
            ?.mapValues { it.value } ?: emptyMap()

        val bytes = BoletoPdfFactory.build(
            orderId = orderId,
            reference = reference,
            orderNumber = boleto["order_number"]?.toString(),
            amount = (boleto["amount"] as? Number)?.toDouble(),
            metadata = metadata,
        )

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"boleto-$orderId-$reference.pdf\"")
            .header(HttpHeaders.CACHE_CONTROL, "no-store")
            .contentType(MediaType.APPLICATION_PDF)
            .body(bytes)
    }
}
