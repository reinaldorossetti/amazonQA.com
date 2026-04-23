import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, authenticateRequestMock, isUserAdminMock, isUserSupportMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  isUserAdminMock: vi.fn(),
  isUserSupportMock: vi.fn(),
}));

vi.mock('../../lib/db', () => ({
  query: queryMock,
}));

vi.mock('../../lib/auth', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles', () => ({
  isUserAdmin: isUserAdminMock,
  isUserSupport: isUserSupportMock,
}));

import { GET as getProducts, POST as postProducts } from '../../app/api/products/route';
import {
  GET as getProductById,
  PUT as putProductById,
  DELETE as deleteProductById,
} from '../../app/api/products/[id]/route';

function jsonRequest(url: string, method: string, body?: unknown): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

describe('Products API endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    authenticateRequestMock.mockReturnValue({
      ok: true,
      auth: { userId: 1, email: 'admin@test.com' },
    });

    isUserAdminMock.mockResolvedValue(true);
    isUserSupportMock.mockResolvedValue(true);
  });

  it('GET /api/products remains public', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Product A' }] });

    const response = await getProducts(new Request('http://localhost/api/products'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveLength(1);
    expect(authenticateRequestMock).not.toHaveBeenCalled();
  });

  it('POST /api/products returns 401 without authentication', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Missing bearer token' });

    const response = await postProducts(
      jsonRequest('http://localhost/api/products', 'POST', { name: 'Novo', price: 10 })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain('Missing bearer token');
  });

  it('POST /api/products returns 403 for non-admin users', async () => {
    isUserSupportMock.mockResolvedValueOnce(false);

    const response = await postProducts(
      jsonRequest('http://localhost/api/products', 'POST', { name: 'Novo', price: 10 })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('admin');
  });

  it('POST /api/products creates product for admin', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 99, name: 'Novo', price: 10 }] });

    const response = await postProducts(
      jsonRequest('http://localhost/api/products', 'POST', { name: 'Novo', price: 10 })
    );

    expect(response.status).toBe(201);
  });

  it('PUT /api/products/:id returns 401 without authentication', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Missing bearer token' });

    const response = await putProductById(
      jsonRequest('http://localhost/api/products/1', 'PUT', { name: 'Atualizado', price: 20 }),
      { params: { id: '1' } }
    );

    expect(response.status).toBe(401);
  });

  it('PUT /api/products/:id returns 403 for non-admin users', async () => {
    isUserSupportMock.mockResolvedValueOnce(false);

    const response = await putProductById(
      jsonRequest('http://localhost/api/products/1', 'PUT', { name: 'Atualizado', price: 20 }),
      { params: { id: '1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('admin');
  });

  it('PUT /api/products/:id returns 404 for non-existing product', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const response = await putProductById(
      jsonRequest('http://localhost/api/products/999', 'PUT', { name: 'Atualizado', price: 20 }),
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
  });

  it('DELETE /api/products/:id returns 401 without authentication', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Missing bearer token' });

    const response = await deleteProductById(
      new Request('http://localhost/api/products/1', { method: 'DELETE' }),
      { params: { id: '1' } }
    );

    expect(response.status).toBe(401);
  });

  it('DELETE /api/products/:id returns 403 for non-admin users', async () => {
    isUserSupportMock.mockResolvedValueOnce(false);

    const response = await deleteProductById(
      new Request('http://localhost/api/products/1', { method: 'DELETE' }),
      { params: { id: '1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('admin');
  });

  it('DELETE /api/products/:id returns 400 for invalid ID', async () => {
    const response = await deleteProductById(
      new Request('http://localhost/api/products/abc', { method: 'DELETE' }),
      { params: { id: 'abc' } }
    );

    expect(response.status).toBe(400);
  });

  it('DELETE /api/products/:id returns 404 for non-existing product', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0 });

    const response = await deleteProductById(
      new Request('http://localhost/api/products/999', { method: 'DELETE' }),
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
  });

  it('DELETE /api/products/:id removes product for admin', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1 });

    const response = await deleteProductById(
      new Request('http://localhost/api/products/1', { method: 'DELETE' }),
      { params: { id: '1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain('Product removed');
  });

  it('DELETE /api/products/:id returns 409 when product is linked to orders', async () => {
    const fkError = new Error('violates foreign key constraint') as Error & { code?: string };
    fkError.code = '23503';
    queryMock.mockRejectedValueOnce(fkError);

    const response = await deleteProductById(
      new Request('http://localhost/api/products/124', { method: 'DELETE' }),
      { params: { id: '124' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('cannot be removed');
  });

  it('GET /api/products/:id returns 400 for invalid ID', async () => {
    const response = await getProductById(new Request('http://localhost/api/products/abc'), {
      params: { id: 'abc' },
    });

    expect(response.status).toBe(400);
  });
});
