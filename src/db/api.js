/**
 * src/db/api.js — REST API client for the Next.js backend
 *
 * Todas as funções fazem fetch para /api/* (proxiado pelo Vite para o Next.js
 * em localhost:3001 em dev, e configurado no servidor em produção).
 */

const BASE = '/api';

async function http(method, path, body, extraHeaders = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const isAuthEndpoint = path.startsWith('/users/login') || path.startsWith('/users/register');

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {}),
            ...extraHeaders,
        },
    };
    if (body !== undefined) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${path}`, options);
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
    }

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

export const getMe = () =>
    http('GET', '/users/me');

export const updateMyAddress = (payload) =>
    http('PUT', '/users/me/address', payload);

// ── Cart ─────────────────────────────────────────────────────────────────────

export const getCartItems = (userId) =>
    http('GET', `/cart?userId=${userId}`);

export const upsertCartItem = (products) =>
    http('POST', '/cart', { products });

export const removeCartItem = (cartItemId) =>
    http('DELETE', '/cart', { cartItemId });

// ── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = ({
    shippingTotal = 0,
    discountTotal = 0,
    paymentMethod = null,
    shippingAddress = null,
    billingInfo = null,
    items = null,
    idempotencyKey = null,
} = {}) => {
    const headers = {};
    if (idempotencyKey) {
        headers['Idempotency-Key'] = idempotencyKey;
    }

    return http(
        'POST',
        '/orders',
        {
            shippingTotal,
            discountTotal,
            paymentMethod,
            shippingAddress,
            billingInfo,
            items,
        },
        headers
    );
};

export const getOrders = (params = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.set(key, String(value));
        }
    });

    const query = search.toString();
    return http('GET', `/orders${query ? `?${query}` : ''}`);
};

export const getOrderById = (id) =>
    http('GET', `/orders/${id}`);

export const createOrderPayment = (orderId, payload = {}) =>
    http('POST', `/orders/${orderId}/payments`, payload);

export const getOrderPaymentStatus = (orderId, paymentId) =>
    http('GET', `/orders/${orderId}/payments/${paymentId}`);

// ── Account helpers ──────────────────────────────────────────────────────────

export const getMyOrders = (params = {}) =>
    getOrders(params);

export const getMyOrderById = (id) =>
    getOrderById(id);
