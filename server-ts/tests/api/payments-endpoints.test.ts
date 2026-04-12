import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  queryMock,
  authenticateRequestMock,
  isUserAdminMock,
} = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  isUserAdminMock: vi.fn(),
}));

vi.mock('../../lib/db', () => ({
  query: queryMock,
}));

vi.mock('../../lib/auth', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles', () => ({
  isUserAdmin: isUserAdminMock,
}));

import { POST as postPayment } from '../../app/api/orders/[id]/payments/route';
import { GET as getPaymentById } from '../../app/api/orders/[id]/payments/[paymentId]/route';

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

describe('Payments API endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authenticateRequestMock.mockReturnValue({
      ok: true,
      auth: { userId: 1, email: 'pay@test.com' },
    });
    isUserAdminMock.mockResolvedValue(false);
  });

  it('POST /api/orders/:id/payments returns 401 when unauthenticated', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Missing bearer token' });

    const response = await postPayment(
      jsonRequest('http://localhost/api/orders/10/payments', 'POST', { method: 'credit' }),
      { params: { id: '10' } }
    );

    expect(response.status).toBe(401);
  });

  it('POST /api/orders/:id/payments validates payment method', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, grand_total: 100 }] });

    const response = await postPayment(
      jsonRequest('http://localhost/api/orders/10/payments', 'POST', { method: 'cash' }),
      { params: { id: '10' } }
    );

    expect(response.status).toBe(400);
  });

  it('POST /api/orders/:id/payments creates authorized credit payment', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, grand_total: 100 }] })
      .mockResolvedValueOnce({ rows: [{ paid: 0 }] })
      .mockResolvedValueOnce({
        rows: [{
          id: 1,
          order_id: 10,
          user_id: 1,
          method: 'credit',
          amount: 100,
          status: 'authorized',
          metadata: {},
        }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await postPayment(
      jsonRequest('http://localhost/api/orders/10/payments', 'POST', {
        method: 'credit',
        amount: 100,
        cardNumber: '4111111111111111',
      }),
      { params: { id: '10' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.status).toBe('authorized');
    expect(payload.method).toBe('credit');
  });

  it('POST /api/orders/:id/payments generates mocked boleto with fake CNPJ', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, grand_total: 100 }] })
      .mockResolvedValueOnce({ rows: [{ paid: 0 }] })
      .mockResolvedValueOnce({
        rows: [{
          id: 2,
          order_id: 10,
          user_id: 1,
          method: 'boleto',
          amount: 100,
          status: 'pending',
          metadata: {
            beneficiaryDocument: '12.345.678/0001-95',
            line: '34191.79001 01043.510047 91020.150008 8 9727002600010000',
          },
        }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await postPayment(
      jsonRequest('http://localhost/api/orders/10/payments', 'POST', {
        method: 'boleto',
        amount: 100,
      }),
      { params: { id: '10' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.status).toBe('pending');
    expect(payload.method).toBe('boleto');
    expect(payload.metadata.beneficiaryDocument).toBe('12.345.678/0001-95');
    expect(payload.metadata.line).toContain('34191.79001');
  });

  it('POST /api/orders/:id/payments generates mocked PIX QR code with readable text', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 10, user_id: 1, grand_total: 100 }] })
      .mockResolvedValueOnce({ rows: [{ paid: 0 }] })
      .mockResolvedValueOnce({
        rows: [{
          id: 3,
          order_id: 10,
          user_id: 1,
          method: 'pix',
          amount: 100,
          status: 'pending',
          metadata: {
            pixCode: '00020126PIX123',
            qrCodeImage: 'data:image/svg+xml;utf8,%3Csvg%3E%3C%2Fsvg%3E',
            readableText: 'Valor ao ler QR Code: R$ 100.00',
          },
        }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await postPayment(
      jsonRequest('http://localhost/api/orders/10/payments', 'POST', {
        method: 'pix',
        amount: 100,
      }),
      { params: { id: '10' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.status).toBe('pending');
    expect(payload.method).toBe('pix');
    expect(payload.metadata.qrCodeImage).toContain('data:image/svg+xml');
    expect(payload.metadata.readableText).toContain('Valor ao ler QR Code');
  });

  it('GET /api/orders/:id/payments/:paymentId blocks access from another user', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 7, order_id: 10, order_owner_id: 9, method: 'pix', status: 'pending' }],
    });

    const response = await getPaymentById(new Request('http://localhost/api/orders/10/payments/7'), {
      params: { id: '10', paymentId: '7' },
    });

    expect(response.status).toBe(403);
  });
});
