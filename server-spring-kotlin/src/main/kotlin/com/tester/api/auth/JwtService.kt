package com.tester.api.auth

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.tester.api.common.ApiException
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Service
class JwtService(
    private val properties: JwtProperties,
) {
    private val objectMapper = jacksonObjectMapper()

    data class JwtPayload(
        val sub: String,
        val email: String?,
        val personType: String?,
        val iss: String,
        val aud: String,
        val iat: Long,
        val exp: Long,
    )

    data class SignedToken(
        val accessToken: String,
        val expiresIn: Long,
    )

    fun signAccessToken(userId: Int, email: String?, personType: String?): SignedToken {
        val now = Instant.now().epochSecond
        val expiresIn = parseExpiresIn(properties.expiresIn)

        val header = mapOf("alg" to "HS256", "typ" to "JWT")
        val payload = JwtPayload(
            sub = userId.toString(),
            email = email,
            personType = personType,
            iss = properties.issuer,
            aud = properties.audience,
            iat = now,
            exp = now + expiresIn,
        )

        val encodedHeader = base64UrlEncode(objectMapper.writeValueAsString(header))
        val encodedPayload = base64UrlEncode(objectMapper.writeValueAsString(payload))
        val unsignedToken = "$encodedHeader.$encodedPayload"
        val signature = createSignature(unsignedToken)

        return SignedToken(
            accessToken = "$unsignedToken.$signature",
            expiresIn = expiresIn,
        )
    }

    fun verify(token: String): JwtPayload {
        val parts = token.split(".")
        if (parts.size != 3) {
            throw ApiException(401, "Invalid token format")
        }

        val (encodedHeader, encodedPayload, incomingSignature) = parts
        val unsignedToken = "$encodedHeader.$encodedPayload"
        val expectedSignature = createSignature(unsignedToken)

        if (incomingSignature != expectedSignature) {
            throw ApiException(401, "Invalid token signature")
        }

        val header = objectMapper.readValue(base64UrlDecode(encodedHeader), Map::class.java)
        if (header["alg"] != "HS256" || header["typ"] != "JWT") {
            throw ApiException(401, "Invalid JWT header")
        }

        val payload = objectMapper.readValue(base64UrlDecode(encodedPayload), JwtPayload::class.java)
        val now = Instant.now().epochSecond

        if (payload.exp <= now) {
            throw ApiException(401, "Token expired")
        }

        if (payload.iss != properties.issuer) {
            throw ApiException(401, "Invalid token issuer")
        }

        if (payload.aud != properties.audience) {
            throw ApiException(401, "Invalid token audience")
        }

        return payload
    }

    private fun createSignature(unsignedToken: String): String {
        val algorithm = "HmacSHA256"
        val mac = Mac.getInstance(algorithm)
        val keySpec = SecretKeySpec(properties.secret.toByteArray(StandardCharsets.UTF_8), algorithm)
        mac.init(keySpec)
        val hash = mac.doFinal(unsignedToken.toByteArray(StandardCharsets.UTF_8))
        return Base64.getUrlEncoder().withoutPadding().encodeToString(hash)
    }

    private fun parseExpiresIn(value: String): Long {
        val raw = value.trim().lowercase()
        if (raw.matches(Regex("^\\d+$"))) {
            return raw.toLong()
        }

        val match = Regex("^(\\d+)([smhd])$").matchEntire(raw)
            ?: throw ApiException(500, "Invalid JWT expires-in format")

        val amount = match.groupValues[1].toLong()
        return when (match.groupValues[2]) {
            "s" -> amount
            "m" -> amount * 60
            "h" -> amount * 3600
            "d" -> amount * 86400
            else -> throw ApiException(500, "Invalid JWT expires-in unit")
        }
    }

    private fun base64UrlEncode(value: String): String =
        Base64.getUrlEncoder().withoutPadding().encodeToString(value.toByteArray(StandardCharsets.UTF_8))

    private fun base64UrlDecode(value: String): String =
        String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8)
}
