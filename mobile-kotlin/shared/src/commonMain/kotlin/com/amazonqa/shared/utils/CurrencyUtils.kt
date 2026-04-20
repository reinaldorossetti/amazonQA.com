package com.amazonqa.shared.utils

/**
 * Formata um valor Double para o padrão de moeda brasileiro (R$ 0,00)
 */
fun Double.toCurrency(): String {
    val integerPart = this.toInt()
    val decimalPart = ((this - integerPart) * 100).toInt()
    
    val decimalStr = if (decimalPart < 0) {
        val absDecimal = kotlin.math.abs(decimalPart)
        if (absDecimal < 10) "0$absDecimal" else "$absDecimal"
    } else {
        if (decimalPart < 10) "0$decimalPart" else "$decimalPart"
    }
    
    return "$integerPart,$decimalStr"
}

/**
 * Formata um valor Double com prefixo R$
 */
fun Double.toBrazilianCurrency(): String {
    return "R$ ${this.toCurrency()}"
}
