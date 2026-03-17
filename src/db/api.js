/**
 * src/db/api.js — REST API client for the Next.js backend
 *
 * Todas as funções fazem fetch para /api/* (proxiado pelo Vite para o Next.js
 * em localhost:3001 em dev, e configurado no servidor em produção).
 */

const BASE = '/api';

async function http(method, path, body) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body !== undefined) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
}

// ── Products ──────────────────────────────────────────────────────────────────

export const getProducts = (category) =>
    http('GET', `/products${category ? `?category=${encodeURIComponent(category)}` : ''}`);

export const getProductById = (id) =>
    http('GET', `/products/${id}`);

// ── Users ────────────────────────────────────────────────────────────────────

export const registerUser = (userData) =>
    http('POST', '/users/register', userData);

export const getUserByEmail = (email) =>
    http('POST', '/users/login-lookup', { email });

export const loginUser = ({ email, password }) =>
    http('POST', '/users/login', { email, password });

// ── Cart ─────────────────────────────────────────────────────────────────────

export const getCartItems = (userId) =>
    http('GET', `/cart?userId=${userId}`);

export const upsertCartItem = (userId, productId, quantity = 1) =>
    http('POST', '/cart', { userId, productId, quantity });

export const removeCartItem = (cartItemId) =>
    http('DELETE', '/cart', { cartItemId });
