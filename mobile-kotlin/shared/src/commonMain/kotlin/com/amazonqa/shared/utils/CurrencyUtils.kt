package com.amazonqa.shared.utils

/**
 * Formata um valor Double para o padrão de moeda brasileiro (R$ 0,00)
 */
fun Double.toCurrency(): String {
    val totalCents = kotlin.math.round(this * 100).toInt()
    val integerPart = totalCents / 100
    val decimalPart = kotlin.math.abs(totalCents % 100)
    
    val decimalStr = if (decimalPart < 10) "0$decimalPart" else "$decimalPart"
    
    return "$integerPart,$decimalStr"
}

/**
 * Formata um valor Double com prefixo R$
 */
fun Double.toBrazilianCurrency(): String {
    return "R$ ${this.toCurrency()}"
}
