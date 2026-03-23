import crypto from 'crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';

const DEFAULT_EXPIRES_IN = '1h';

function base64UrlEncode(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(input) {
    const normalized = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const pad = normalized.length % 4;
    const padded = normalized + (pad ? '='.repeat(4 - pad) : '');
    return Buffer.from(padded, 'base64').toString('utf8');
}

function parseExpiresIn(value) {
    if (!value) return 3600;

    if (/^\d+$/.test(String(value))) {
        return Number(value);
    }

    const match = String(value).match(/^(\d+)([smhd])$/i);
    if (!match) return 3600;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
    };

    return amount * multipliers[unit];
}

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('JWT_SECRET ausente ou fraco (mínimo recomendado: 16 caracteres)');
    }
    return secret;
}

function createSignature(unsignedToken, secret) {
    return crypto
        .createHmac('sha256', secret)
        .update(unsignedToken)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

export function signAccessToken(user) {
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = parseExpiresIn(process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN);

    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };

    const payload = {
        sub: String(user.id),
        email: user.email,
        personType: user.person_type,
        iss: process.env.JWT_ISSUER ?? 'tester.com',
        aud: process.env.JWT_AUDIENCE ?? 'tester.com-web',
        iat: now,
        exp: now + expiresInSeconds,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = createSignature(unsignedToken, getJwtSecret());

    return {
        accessToken: `${unsignedToken}.${signature}`,
        expiresIn: expiresInSeconds,
    };
}

export function verifyAccessToken(token) {
    if (!token || typeof token !== 'string') {
        throw new Error('Token ausente');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Formato de token inválido');
    }

    const [encodedHeader, encodedPayload, incomingSignature] = parts;
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = createSignature(unsignedToken, getJwtSecret());

    const incomingBuffer = Buffer.from(incomingSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
        incomingBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(incomingBuffer, expectedBuffer)
    ) {
        throw new Error('Assinatura inválida');
    }

    const header = JSON.parse(base64UrlDecode(encodedHeader));
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        throw new Error('Cabeçalho JWT inválido');
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub) {
        throw new Error('Token sem subject');
    }

    if (!payload.exp || now >= payload.exp) {
        throw new Error('Token expirado');
    }

    const expectedIssuer = process.env.JWT_ISSUER ?? 'tester.com';
    const expectedAudience = process.env.JWT_AUDIENCE ?? 'tester.com-web';

    if (payload.iss !== expectedIssuer) {
        throw new Error('Issuer inválido');
    }

    if (payload.aud !== expectedAudience) {
        throw new Error('Audience inválida');
    }

    return payload;
}

export function getBearerTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(' ');
    if (!scheme || !token || scheme.toLowerCase() !== 'bearer') return null;

    return token;
}

export function authenticateRequest(request) {
    const token = getBearerTokenFromRequest(request);
    if (!token) {
        return { ok: false, error: 'Bearer token ausente' };
    }

    try {
        const payload = verifyAccessToken(token);
        return {
            ok: true,
            auth: {
                userId: Number(payload.sub),
                email: payload.email,
                personType: payload.personType,
                payload,
            },
        };
    } catch (err) {
        return { ok: false, error: err.message || 'Token inválido' };
    }
}
