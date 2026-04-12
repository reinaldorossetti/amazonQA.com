import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProducts,
  getProductById,
  deleteProductByIdAdmin,
  registerUser,
  getUserByEmail,
  loginUser,
  getMe,
  updateMyAddress,
  getUsersAdmin,
  deleteUserByIdAdmin,
  getCartItems,
  upsertCartItem,
  removeCartItem,
  createOrder,
  getOrders,
  getOrderById,
  createOrderPayment,
  getOrderPaymentStatus,
  getMyOrders,
  getMyOrderById,
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

  it('deleteProductByIdAdmin chama DELETE /api/products/:id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Produto removido' }),
    });

    const response = await deleteProductByIdAdmin(123);

    expect(response).toEqual({ message: 'Produto removido' });
    expect(global.fetch).toHaveBeenCalledWith('/api/products/123', expect.objectContaining({ method: 'DELETE' }));
  });

  it('getUsersAdmin serializa query params válidos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: [] }),
    });

    await getUsersAdmin({ page: 2, pageSize: 25, status: 'active', search: 'ana', empty: '' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/users?page=2&pageSize=25&status=active&search=ana',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('deleteUserByIdAdmin chama DELETE /api/users/:id', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: 'Usuário removido' }),
    });

    const response = await deleteUserByIdAdmin(77);

    expect(response).toEqual({ message: 'Usuário removido' });
    expect(global.fetch).toHaveBeenCalledWith('/api/users/77', expect.objectContaining({ method: 'DELETE' }));
  });

  it('getUsersAdmin sem parâmetros não adiciona querystring', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: [] }),
    });

    await getUsersAdmin();

    expect(global.fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({ method: 'GET' }));
  });

  it('getMe e updateMyAddress chamam endpoints de conta autenticados', async () => {
    localStorage.setItem('auth_token', 'token-account');
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1, email: 'qa@test.com' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });

    const me = await getMe();
    const updated = await updateMyAddress({ address_city: 'Campinas' });

    expect(me).toEqual({ id: 1, email: 'qa@test.com' });
    expect(updated).toEqual({ ok: true });

    expect(global.fetch.mock.calls[0][0]).toBe('/api/users/me');
    expect(global.fetch.mock.calls[1][0]).toBe('/api/users/me/address');
    expect(global.fetch.mock.calls[1][1].method).toBe('PUT');
  });

  it('createOrder envia payload completo e idempotency key no header', async () => {
    localStorage.setItem('auth_token', 'token-order');
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 321, status: 'created' }),
    });

    await createOrder({
      shippingTotal: 10,
      discountTotal: 3,
      paymentMethod: 'credit',
      shippingAddress: { city: 'SP' },
      billingInfo: { cpf: '000' },
      items: [{ productId: 7, quantity: 2 }],
      idempotencyKey: 'idem-123',
    });

    const [, options] = global.fetch.mock.calls[0];
    expect(global.fetch.mock.calls[0][0]).toBe('/api/orders');
    expect(options.headers['Idempotency-Key']).toBe('idem-123');
    expect(JSON.parse(options.body)).toEqual(
      expect.objectContaining({
        shippingTotal: 10,
        discountTotal: 3,
        paymentMethod: 'credit',
      })
    );
  });

  it('getOrders e getOrderById serializam consulta e id corretamente', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [] }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 45 }) });

    await getOrders({ page: 1, pageSize: 10, status: 'created', search: '', ignored: null });
    await getOrderById(45);

    expect(global.fetch.mock.calls[0][0]).toBe('/api/orders?page=1&pageSize=10&status=created');
    expect(global.fetch.mock.calls[1][0]).toBe('/api/orders/45');
  });

  it('createOrderPayment e getOrderPaymentStatus usam rotas de pagamento', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 99, status: 'authorized' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 99, status: 'pending' }) });

    const created = await createOrderPayment(10, { method: 'pix', amount: 50 });
    const status = await getOrderPaymentStatus(10, 99);

    expect(created).toEqual({ id: 99, status: 'authorized' });
    expect(status).toEqual({ id: 99, status: 'pending' });
    expect(global.fetch.mock.calls[0][0]).toBe('/api/orders/10/payments');
    expect(global.fetch.mock.calls[1][0]).toBe('/api/orders/10/payments/99');
  });

  it('helpers getMyOrders/getMyOrderById delegam para endpoints de orders', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ items: [{ id: 1 }] }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) });

    const list = await getMyOrders({ page: 2, pageSize: 5 });
    const one = await getMyOrderById(1);

    expect(list).toEqual({ items: [{ id: 1 }] });
    expect(one).toEqual({ id: 1 });
    expect(global.fetch.mock.calls[0][0]).toBe('/api/orders?page=2&pageSize=5');
    expect(global.fetch.mock.calls[1][0]).toBe('/api/orders/1');
  });

  it('lança erro com mensagem de API quando res.ok = false', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad request' }),
    });

    await expect(getProducts()).rejects.toThrow('Bad request');
  });

  it('quando JSON falha em erro de resposta, usa fallback HTTP status', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      },
    });

    await expect(getProducts()).rejects.toThrow('HTTP 500');
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
