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

vi.mock('../../lib/db', () => ({
  query: queryMock,
  getPool: () => ({
    connect: getPoolConnectMock,
  }),
}));

vi.mock('../../lib/auth', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles', () => ({
  isUserAdmin: isUserAdminMock,
}));

import { GET as getOrders, POST as postOrders } from '../../app/api/orders/route';
import { GET as getOrderById, PUT as putOrderById, DELETE as deleteOrderById } from '../../app/api/orders/[id]/route';

function jsonRequest(
  url: string,
  method = 'GET',
  body?: unknown,
  headers: Record<string, string> = {}
): Request {
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

  it('POST /api/orders returns 401 when unauthenticated', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Missing bearer token' });

    const response = await postOrders(jsonRequest('http://localhost/api/orders', 'POST', {}));
    expect(response.status).toBe(401);
  });

  it('POST /api/orders returns 400 for empty cart', async () => {
    poolClientQueryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await postOrders(jsonRequest('http://localhost/api/orders', 'POST', {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe('Empty cart');
  });

  it('POST /api/orders creates order from payload items when persisted cart is empty', async () => {
    poolClientQueryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5, name: 'Notebook', price: 4999.9 }] })
      .mockResolvedValueOnce({ rows: [{ id: 101 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 101, order_number: 'ORD-TEST-0101', user_id: 1, status: 'created' }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, order_id: 101, product_id: 5, quantity: 1 }] });

    const response = await postOrders(
      jsonRequest('http://localhost/api/orders', 'POST', {
        items: [{ productId: 5, quantity: 1 }],
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.id).toBe(101);
    expect(payload.items).toHaveLength(1);
  });

  it('GET /api/orders lists orders for authenticated user', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, status: 'created' }] });

    const response = await getOrders(new Request('http://localhost/api/orders?page=1&pageSize=10'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.total).toBe(1);
    expect(payload.items).toHaveLength(1);
  });

  it('GET /api/orders/:id blocks access to another user order', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 20, user_id: 2, status: 'created' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await getOrderById(new Request('http://localhost/api/orders/20'), {
      params: { id: '20' },
    });

    expect(response.status).toBe(403);
  });

  it('PUT /api/orders/:id returns 400 for invalid status transition', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 20, user_id: 1, status: 'delivered' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await putOrderById(
      jsonRequest('http://localhost/api/orders/20', 'PUT', { status: 'created' }),
      { params: { id: '20' } }
    );

    expect(response.status).toBe(400);
  });

  it('DELETE /api/orders/:id cancels eligible order', async () => {
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
    expect(payload.message).toBe('Order canceled');
  });
});
