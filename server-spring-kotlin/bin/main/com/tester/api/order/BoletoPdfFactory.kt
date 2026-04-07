package com.tester.api.order

object BoletoPdfFactory {
    fun build(orderId: Int, reference: String, orderNumber: String?, amount: Double?, metadata: Map<String, Any?>): ByteArray {
        fun escape(value: String): String =
            value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

        val lines = listOf(
            "PAYMENT SLIP - MOCK",
            "Document has no real banking validity (test environment).",
            "Order: ${orderNumber ?: "#$orderId"}",
            "Reference: $reference",
            "Beneficiary: ${metadata["beneficiaryName"] ?: "Mock Billing Company LTD"}",
            "CNPJ: ${metadata["beneficiaryDocument"] ?: "12.345.678/0001-95"}",
            "Amount: R$ ${"%.2f".format(amount ?: 0.0)}",
            "Digitable line: ${metadata["line"] ?: "00191.79001 01043.510047 91020.150008 8 9727002600010000"}",
            "Barcode: ${metadata["barcode"] ?: "00199727000000000000000000000000000000000000"}",
        )

        val content = buildString {
            appendLine("BT")
            appendLine("/F1 12 Tf")
            appendLine("50 800 Td")
            lines.forEachIndexed { index, line ->
                if (index > 0) appendLine("0 -18 Td")
                appendLine("(${escape(line)}) Tj")
            }
            appendLine("ET")
        }

        val objects = listOf(
            "<< /Type /Catalog /Pages 2 0 R >>",
            "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
            "<< /Length ${content.toByteArray().size} >>\nstream\n$content\nendstream",
        )

        val pdf = StringBuilder("%PDF-1.4\n")
        val offsets = mutableListOf(0)

        objects.forEachIndexed { index, obj ->
            offsets.add(pdf.toString().toByteArray().size)
            pdf.append("${index + 1} 0 obj\n$obj\nendobj\n")
        }

        val xrefOffset = pdf.toString().toByteArray().size
        pdf.append("xref\n0 ${objects.size + 1}\n")
        pdf.append("0000000000 65535 f \n")
        offsets.drop(1).forEach { offset ->
            pdf.append(offset.toString().padStart(10, '0')).append(" 00000 n \n")
        }

        pdf.append("trailer\n<< /Size ${objects.size + 1} /Root 1 0 R >>\n")
        pdf.append("startxref\n$xrefOffset\n%%EOF")

        return pdf.toString().toByteArray()
    }
}
