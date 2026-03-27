import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  queryMock,
  authenticateRequestMock,
  isUserAdminMock,
  poolClientQueryMock,
  poolClientReleaseMock,
  getPoolConnectMock,
} = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  isUserAdminMock: vi.fn(),
  poolClientQueryMock: vi.fn(),
  poolClientReleaseMock: vi.fn(),
  getPoolConnectMock: vi.fn(),
}));

vi.mock('../../lib/db.js', () => ({
  query: queryMock,
  getPool: () => ({
    connect: getPoolConnectMock,
  }),
}));

vi.mock('../../lib/auth.js', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles.js', () => ({
  isUserAdmin: isUserAdminMock,
}));

import { GET as getOrders, POST as postOrders } from '../../app/api/orders/route.js';
import { GET as getOrderById, PUT as putOrderById, DELETE as deleteOrderById } from '../../app/api/orders/[id]/route.js';

function jsonRequest(url, method = 'GET', body, headers = {}) {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

describe('Orders API endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    authenticateRequestMock.mockReturnValue({
      ok: true,
      auth: { userId: 1, email: 'user@test.com' },
    });

    isUserAdminMock.mockResolvedValue(false);

    poolClientQueryMock.mockResolvedValue({ rows: [] });
    poolClientReleaseMock.mockReturnValue(undefined);
    getPoolConnectMock.mockResolvedValue({
      query: poolClientQueryMock,
      release: poolClientReleaseMock,
    });
  });

  it('POST /api/orders retorna 401 quando não autenticado', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Bearer token ausente' });

    const response = await postOrders(jsonRequest('http://localhost/api/orders', 'POST', {}));
    expect(response.status).toBe(401);
  });

  it('POST /api/orders retorna 400 para carrinho vazio', async () => {
    poolClientQueryMock
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // cart query (empty)
      .mockResolvedValueOnce({ rows: [] }); // ROLLBACK

    const response = await postOrders(jsonRequest('http://localhost/api/orders', 'POST', {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('Carrinho vazio');
  });

  it('GET /api/orders lista pedidos do usuário autenticado', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, status: 'created' }] });

    const response = await getOrders(new Request('http://localhost/api/orders?page=1&pageSize=10'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.total).toBe(1);
    expect(payload.items).toHaveLength(1);
  });

  it('GET /api/orders/:id bloqueia acesso a pedido de outro usuário', async () => {
    queryMock
      .mockResolvedValueOnce({
        rows: [{ id: 20, user_id: 2, status: 'created' }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await getOrderById(new Request('http://localhost/api/orders/20'), {
      params: { id: '20' },
    });

    expect(response.status).toBe(403);
  });

  it('PUT /api/orders/:id retorna 400 para transição inválida de status', async () => {
    queryMock
      .mockResolvedValueOnce({
        rows: [{ id: 20, user_id: 1, status: 'delivered' }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await putOrderById(
      jsonRequest('http://localhost/api/orders/20', 'PUT', { status: 'created' }),
      { params: { id: '20' } }
    );

    expect(response.status).toBe(400);
  });

  it('DELETE /api/orders/:id cancela pedido elegível', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 99, user_id: 1, status: 'created' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 99, user_id: 1, status: 'cancelled' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await deleteOrderById(
      new Request('http://localhost/api/orders/99', { method: 'DELETE' }),
      { params: { id: '99' } }
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.message).toBe('Pedido cancelado');
  });
});
