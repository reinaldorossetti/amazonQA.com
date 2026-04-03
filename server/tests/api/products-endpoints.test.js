import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, authenticateRequestMock, isUserAdminMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  isUserAdminMock: vi.fn(),
}));

vi.mock('../../lib/db.js', () => ({
  query: queryMock,
}));

vi.mock('../../lib/auth.js', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles.js', () => ({
  isUserAdmin: isUserAdminMock,
}));

import { GET as getProducts, POST as postProducts } from '../../app/api/products/route.js';
import {
  GET as getProductById,
  PUT as putProductById,
  DELETE as deleteProductById,
} from '../../app/api/products/[id]/route.js';

function jsonRequest(url, method, body) {
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
  });

  it('GET /api/products continua público', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, name: 'Produto A' }] });

    const response = await getProducts(new Request('http://localhost/api/products'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveLength(1);
    expect(authenticateRequestMock).not.toHaveBeenCalled();
  });

  it('POST /api/products retorna 401 sem autenticação', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Bearer token ausente' });

    const response = await postProducts(
      jsonRequest('http://localhost/api/products', 'POST', { name: 'Novo', price: 10 })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain('Bearer token ausente');
  });

  it('POST /api/products retorna 403 para não-admin', async () => {
    isUserAdminMock.mockResolvedValueOnce(false);

    const response = await postProducts(
      jsonRequest('http://localhost/api/products', 'POST', { name: 'Novo', price: 10 })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('admin');
  });

  it('POST /api/products cria produto para admin', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 99, name: 'Novo', price: 10 }] });

    const response = await postProducts(
      jsonRequest('http://localhost/api/products', 'POST', { name: 'Novo', price: 10 })
    );

    expect(response.status).toBe(201);
  });

  it('PUT /api/products/:id retorna 401 sem autenticação', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Bearer token ausente' });

    const response = await putProductById(
      jsonRequest('http://localhost/api/products/1', 'PUT', { name: 'Atualizado', price: 20 }),
      { params: { id: '1' } }
    );

    expect(response.status).toBe(401);
  });

  it('PUT /api/products/:id retorna 403 para não-admin', async () => {
    isUserAdminMock.mockResolvedValueOnce(false);

    const response = await putProductById(
      jsonRequest('http://localhost/api/products/1', 'PUT', { name: 'Atualizado', price: 20 }),
      { params: { id: '1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('admin');
  });

  it('PUT /api/products/:id retorna 404 para produto inexistente', async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const response = await putProductById(
      jsonRequest('http://localhost/api/products/999', 'PUT', { name: 'Atualizado', price: 20 }),
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
  });

  it('DELETE /api/products/:id retorna 401 sem autenticação', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Bearer token ausente' });

    const response = await deleteProductById(
      new Request('http://localhost/api/products/1', { method: 'DELETE' }),
      { params: { id: '1' } }
    );

    expect(response.status).toBe(401);
  });

  it('DELETE /api/products/:id retorna 403 para não-admin', async () => {
    isUserAdminMock.mockResolvedValueOnce(false);

    const response = await deleteProductById(
      new Request('http://localhost/api/products/1', { method: 'DELETE' }),
      { params: { id: '1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('admin');
  });

  it('DELETE /api/products/:id retorna 400 para ID inválido', async () => {
    const response = await deleteProductById(
      new Request('http://localhost/api/products/abc', { method: 'DELETE' }),
      { params: { id: 'abc' } }
    );

    expect(response.status).toBe(400);
  });

  it('DELETE /api/products/:id retorna 404 para produto inexistente', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0 });

    const response = await deleteProductById(
      new Request('http://localhost/api/products/999', { method: 'DELETE' }),
      { params: { id: '999' } }
    );

    expect(response.status).toBe(404);
  });

  it('DELETE /api/products/:id remove produto para admin', async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1 });

    const response = await deleteProductById(
      new Request('http://localhost/api/products/1', { method: 'DELETE' }),
      { params: { id: '1' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain('Produto removido');
  });

  it('DELETE /api/products/:id retorna 409 quando produto está vinculado a pedidos', async () => {
    const fkError = new Error('violates foreign key constraint');
    fkError.code = '23503';
    queryMock.mockRejectedValueOnce(fkError);

    const response = await deleteProductById(
      new Request('http://localhost/api/products/124', { method: 'DELETE' }),
      { params: { id: '124' } }
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.error).toContain('não pode ser removido');
  });

  it('GET /api/products/:id retorna 400 para ID inválido', async () => {
    const response = await getProductById(new Request('http://localhost/api/products/abc'), {
      params: { id: 'abc' },
    });

    expect(response.status).toBe(400);
  });
});
