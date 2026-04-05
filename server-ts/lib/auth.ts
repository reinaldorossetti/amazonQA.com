import crypto from 'crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';

const DEFAULT_EXPIRES_IN = '1h';

type TokenUser = {
  id: number | string;
  email?: string | null;
  person_type?: string | null;
  personType?: string | null;
};

type JwtPayload = {
  sub: string;
  email: string | null;
  personType: string | null;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
};

type AuthContext = {
  userId: number;
  email: string | null;
  personType: string | null;
  payload: JwtPayload;
};

export type AuthenticateResult =
  | { ok: true; auth: AuthContext }
  | { ok: false; error: string };

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = normalized + (pad ? '='.repeat(4 - pad) : '');

  return Buffer.from(padded, 'base64').toString('utf8');
}

function parseExpiresIn(value: string | number | undefined): number {
  if (!value) {
    return 3600;
  }

  const asString = String(value);
  if (/^\d+$/.test(asString)) {
    return Number(asString);
  }

  const match = asString.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 3600;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * multipliers[unit];
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET missing or weak (recommended minimum: 16 characters)');
  }

  return secret;
}

function createSignature(unsignedToken: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(unsignedToken)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Invalid token';
}

export function signAccessToken(user: TokenUser): { accessToken: string; expiresIn: number } {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = parseExpiresIn(process.env.JWT_EXPIRES_IN ?? DEFAULT_EXPIRES_IN);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload: JwtPayload = {
    sub: String(user.id),
    email: user.email ?? null,
    personType: user.person_type ?? user.personType ?? null,
    iss: process.env.JWT_ISSUER ?? 'tester.com',
    aud: process.env.JWT_AUDIENCE ?? 'tester.com-web',
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createSignature(unsignedToken, getJwtSecret());

  return {
    accessToken: `${unsignedToken}.${signature}`,
    expiresIn,
  };
}

export function verifyAccessToken(token: string): JwtPayload {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing token');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
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
    throw new Error('Invalid signature');
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader)) as { alg?: string; typ?: string };
  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new Error('Invalid JWT header');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);

  if (!payload.sub) {
    throw new Error('Token missing subject');
  }

  if (!payload.exp || now >= payload.exp) {
    throw new Error('Token expired');
  }

  const expectedIssuer = process.env.JWT_ISSUER ?? 'tester.com';
  const expectedAudience = process.env.JWT_AUDIENCE ?? 'tester.com-web';

  if (payload.iss !== expectedIssuer) {
    throw new Error('Invalid issuer');
  }

  if (payload.aud !== expectedAudience) {
    throw new Error('Invalid audience');
  }

  return payload;
}

export function getBearerTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token;
}

export function authenticateRequest(request: Request): AuthenticateResult {
  const token = getBearerTokenFromRequest(request);
  if (!token) {
    return { ok: false, error: 'Missing bearer token' };
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
  } catch (error: unknown) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
