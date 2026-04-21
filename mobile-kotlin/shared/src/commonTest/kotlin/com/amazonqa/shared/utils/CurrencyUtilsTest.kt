package com.amazonqa.shared.utils

import kotlin.test.assertEquals
import kotlin.test.Test

class CurrencyUtilsTest {

    @Test
    fun `toCurrency should format integer values correctly`() {
        // Arrange
        val amount = 10.0

        // Act
        val result = amount.toCurrency()

        // Assert
        assertEquals("10,00", result)
    }

    @Test
    fun `toCurrency should format decimal values with one decimal place`() {
        // Arrange
        val amount = 10.5

        // Act
        val result = amount.toCurrency()

        // Assert
        assertEquals("10,50", result)
    }

    @Test
    fun `toCurrency should format decimal values with two decimal places`() {
        // Arrange
        val amount = 10.55

        // Act
        val result = amount.toCurrency()

        // Assert
        assertEquals("10,55", result)
    }

    @Test
    fun `toCurrency should round half up`() {
        // Arrange
        val amount = 10.555

        // Act
        val result = amount.toCurrency()

        // Assert
        assertEquals("10,56", result)
    }

    @Test
    fun `toCurrency should handle negative values`() {
        // Arrange
        val amount = -10.5

        // Act
        val result = amount.toCurrency()

        // Assert
        assertEquals("-10,50", result)
    }

    @Test
    fun `toCurrency should handle zero`() {
        // Arrange
        val amount = 0.0

        // Act
        val result = amount.toCurrency()

        // Assert
        assertEquals("0,00", result)
    }

    @Test
    fun `toBrazilianCurrency should prefix with R$ `() {
        // Arrange
        val amount = 10.5

        // Act
        val result = amount.toBrazilianCurrency()

        // Assert
        assertEquals("R$ 10,50", result)
    }
}