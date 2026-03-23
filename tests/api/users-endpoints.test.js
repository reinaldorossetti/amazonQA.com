import { beforeEach, describe, expect, it, vi } from 'vitest';

const queryMock = vi.fn();
const authenticateRequestMock = vi.fn();
const signAccessTokenMock = vi.fn();
const isUserAdminMock = vi.fn();
const getRolesForUserMock = vi.fn();
const ensureUserRoleMock = vi.fn();
const hashMock = vi.fn();
const compareMock = vi.fn();
const randomUUIDMock = vi.fn();

vi.mock('../../server/lib/db.js', () => ({
  query: queryMock,
}));

vi.mock('../../server/lib/auth.js', () => ({
  authenticateRequest: authenticateRequestMock,
  signAccessToken: signAccessTokenMock,
}));

vi.mock('../../server/lib/user-roles.js', () => ({
  isUserAdmin: isUserAdminMock,
  getRolesForUser: getRolesForUserMock,
  ensureUserRole: ensureUserRoleMock,
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: hashMock,
    compare: compareMock,
  },
}));

vi.mock('node:crypto', () => ({
  default: {
    randomUUID: randomUUIDMock,
  },
}));

import { GET as getUsers, POST as postUsers } from '../../server/app/api/users/route.js';
import {
  GET as getUserById,
  PUT as putUserById,
  DELETE as deleteUserById,
} from '../../server/app/api/users/[id]/route.js';
import { POST as terminateUser } from '../../server/app/api/users/[id]/terminate/route.js';
import { POST as loginUser } from '../../server/app/api/users/login/route.js';
import { POST as registerUser } from '../../server/app/api/users/register/route.js';

function jsonRequest(url, method, body, headers = {}) {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

describe('Users API endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authenticateRequestMock.mockReturnValue({
      ok: true,
      auth: { userId: 1, email: 'admin@test.com' },
    });

    isUserAdminMock.mockResolvedValue(true);
    getRolesForUserMock.mockResolvedValue(['user']);
    ensureUserRoleMock.mockResolvedValue(undefined);
    signAccessTokenMock.mockReturnValue({ accessToken: 'token-123', expiresIn: 3600 });
    hashMock.mockResolvedValue('hashed-value');
    compareMock.mockResolvedValue(true);
    randomUUIDMock.mockReturnValue('uuid-123');
  });

  it('GET /api/users retorna 401 quando não autenticado', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Bearer token ausente' });

    const response = await getUsers(new Request('http://localhost/api/users'));
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toContain('Bearer token ausente');
  });

  it('GET /api/users retorna lista para admin', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ total: 1 }] })
      .mockResolvedValueOnce({
        rows: [{ id: 1, first_name: 'Admin', is_active: true, account_closed_at: null }],
      });

    const response = await getUsers(new Request('http://localhost/api/users?page=1&pageSize=10&status=active'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.total).toBe(1);
    expect(payload.items).toHaveLength(1);
    expect(queryMock).toHaveBeenCalledTimes(2);
  });

  it('POST /api/users cria usuário e define roles', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 10, first_name: 'Novo', email: 'novo@test.com', is_active: true }],
      });

    const response = await postUsers(
      jsonRequest('http://localhost/api/users', 'POST', {
        first_name: 'Novo',
        last_name: 'Usuário',
        email: 'novo@test.com',
        password: '123456',
        role: 'admin',
      })
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.roles).toEqual(['admin', 'user']);
    expect(hashMock).toHaveBeenCalled();
    expect(ensureUserRoleMock).toHaveBeenCalledWith(10, 'user');
    expect(ensureUserRoleMock).toHaveBeenCalledWith(10, 'admin');
  });

  it('GET /api/users/:id bloqueia acesso de outro usuário não-admin', async () => {
    isUserAdminMock.mockResolvedValueOnce(false);
    authenticateRequestMock.mockReturnValueOnce({ ok: true, auth: { userId: 1, email: 'u@test.com' } });

    const response = await getUserById(new Request('http://localhost/api/users/2'), { params: { id: '2' } });
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('Acesso negado');
  });

  it('GET /api/users/:id retorna usuário com roles', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 2, first_name: 'User', email: 'user@test.com', account_closed_at: null }],
    });
    getRolesForUserMock.mockResolvedValueOnce(['user']);

    const response = await getUserById(new Request('http://localhost/api/users/2'), { params: { id: '2' } });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.id).toBe(2);
    expect(payload.roles).toEqual(['user']);
  });

  it('PUT /api/users/:id atualiza usuário', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 2, first_name: 'Atualizado', email: 'novo@email.com' }],
      });
    getRolesForUserMock.mockResolvedValueOnce(['user']);

    const response = await putUserById(
      jsonRequest('http://localhost/api/users/2', 'PUT', {
        first_name: 'Atualizado',
        email: 'novo@email.com',
      }),
      { params: { id: '2' } }
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.first_name).toBe('Atualizado');
  });

  it('DELETE /api/users/:id permite hard delete para admin', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const response = await deleteUserById(new Request('http://localhost/api/users/2', { method: 'DELETE' }), {
      params: { id: '2' },
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain('removido permanentemente');
  });

  it('POST /api/users/:id/terminate encerra e ofusca conta', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: 2, first_name: 'Ana', created_at: '2025-01-01', account_closed_at: null }] })
      .mockResolvedValueOnce({ rows: [{ id: 2, first_name: 'Ana', is_active: false, account_closed_at: '2026-01-01' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await terminateUser(new Request('http://localhost/api/users/2/terminate', { method: 'POST' }), {
      params: { id: '2' },
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.message).toContain('Conta encerrada');
    expect(hashMock).toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledWith('DELETE FROM user_roles WHERE user_id = $1', [2]);
  });

  it('POST /api/users/login bloqueia usuário inativo', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [{ id: 1, email: 'x@test.com', password: 'hash', is_active: false, account_closed_at: '2026-01-01' }],
    });

    const response = await loginUser(
      jsonRequest('http://localhost/api/users/login', 'POST', {
        email: 'x@test.com',
        password: '123',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toContain('inativa');
  });

  it('POST /api/users/register cria role padrão user', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 123, email: 'novo@teste.com', first_name: 'Novo' }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await registerUser(
      jsonRequest('http://localhost/api/users/register', 'POST', {
        first_name: 'Novo',
        last_name: 'User',
        email: 'novo@teste.com',
        password: '123456',
      })
    );

    expect(response.status).toBe(201);
    expect(queryMock).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO user_roles'),
      [123]
    );
  });
});
