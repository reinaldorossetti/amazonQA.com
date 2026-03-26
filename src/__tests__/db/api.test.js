import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProducts,
  getProductById,
  registerUser,
  getUserByEmail,
  loginUser,
  getCartItems,
  upsertCartItem,
  removeCartItem,
} from '../../db/api';

describe('db/api.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it('getProducts chama endpoint padrão', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ id: 1 }],
    });

    const data = await getProducts();

    expect(data).toEqual([{ id: 1 }]);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('getProducts com categoria aplica querystring codificada', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await getProducts('home office');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/products?category=home%20office',
      expect.any(Object)
    );
  });

  it('getProductById chama endpoint por id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 99 }),
    });

    const data = await getProductById(99);

    expect(data).toEqual({ id: 99 });
    expect(global.fetch).toHaveBeenCalledWith('/api/products/99', expect.any(Object));
  });

  it('registerUser envia POST sem Authorization mesmo com token', async () => {
    localStorage.setItem('auth_token', 'abc-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 10 }),
    });

    await registerUser({ email: 'x@y.com' });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBeUndefined();
    expect(options.body).toContain('x@y.com');
  });

  it('loginUser e getUserByEmail fazem POST correto', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ found: true }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ accessToken: 'token' }) });

    const lookup = await getUserByEmail('john@doe.com');
    const login = await loginUser({ email: 'john@doe.com', password: '123' });

    expect(lookup).toEqual({ found: true });
    expect(login).toEqual({ accessToken: 'token' });

    expect(global.fetch.mock.calls[0][0]).toBe('/api/users/login-lookup');
    expect(global.fetch.mock.calls[1][0]).toBe('/api/users/login');
  });

  it('getCartItems inclui Authorization quando token existe', async () => {
    localStorage.setItem('auth_token', 'my-token');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ([]),
    });

    await getCartItems(7);

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer my-token');
    expect(global.fetch.mock.calls[0][0]).toBe('/api/cart?userId=7');
  });

  it('upsertCartItem e removeCartItem chamam endpoints de carrinho', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });

    await upsertCartItem([{ productId: 2, quantity: 3 }]);
    await removeCartItem(55);

    expect(global.fetch.mock.calls[0][0]).toBe('/api/cart');
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
    expect(global.fetch.mock.calls[0][1].body).toBe(
      JSON.stringify({ products: [{ productId: 2, quantity: 3 }] })
    );
    expect(global.fetch.mock.calls[1][0]).toBe('/api/cart');
    expect(global.fetch.mock.calls[1][1].method).toBe('DELETE');
  });

  it('lança erro com mensagem de API quando res.ok = false', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    });

    await expect(getProducts()).rejects.toThrow('Bad request');
  });

  it('em 401 remove auth_user/auth_token do localStorage', async () => {
    localStorage.setItem('auth_user', 'u');
    localStorage.setItem('auth_token', 't');

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(getCartItems(1)).rejects.toThrow('Unauthorized');
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
