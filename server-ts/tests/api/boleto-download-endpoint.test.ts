import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
}));

vi.mock('../../lib/db', () => ({
  query: queryMock,
}));

import { GET as getBoleto } from '../../app/api/orders/[id]/boleto/[reference]/route';

describe('Boleto download endpoint', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns PDF for valid orderId', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          amount: 199.9,
          order_number: 'ORD-20260327-000010',
          metadata: {
            beneficiaryName: 'Mock Billing Company LTD',
            beneficiaryDocument: '12.345.678/0001-95',
            line: '00191.79001 01043.510047 91020.150008 8 9727002600010000',
          },
        },
      ],
    });

    const response = await getBoleto(new Request('http://localhost/api/orders/10/boleto/1234567890'), {
      params: { id: '10', reference: '1234567890' },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('boleto-10-1234567890.pdf');

    const buffer = Buffer.from(await response.arrayBuffer());
    expect(buffer.toString('utf8', 0, 8)).toBe('%PDF-1.4');
  });

  it('returns 400 for invalid orderId', async () => {
    const response = await getBoleto(new Request('http://localhost/api/orders/abc/boleto/123'), {
      params: { id: 'abc', reference: '123' },
    });

    expect(response.status).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid order ID');
  });
});
