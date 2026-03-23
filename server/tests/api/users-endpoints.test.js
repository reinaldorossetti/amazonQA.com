import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  queryMock,
  authenticateRequestMock,
  signAccessTokenMock,
  isUserAdminMock,
  getRolesForUserMock,
  ensureUserRoleMock,
  hashMock,
  compareMock,
  randomUUIDMock,
} = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  signAccessTokenMock: vi.fn(),
  isUserAdminMock: vi.fn(),
  getRolesForUserMock: vi.fn(),
  ensureUserRoleMock: vi.fn(),
  hashMock: vi.fn(),
  compareMock: vi.fn(),
  randomUUIDMock: vi.fn(),
}));

vi.mock('../../lib/db.js', () => ({
  query: queryMock,
}));

vi.mock('../../lib/auth.js', () => ({
  authenticateRequest: authenticateRequestMock,
  signAccessToken: signAccessTokenMock,
}));

vi.mock('../../lib/user-roles.js', () => ({
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

import { GET as getUsers, POST as postUsers } from '../../app/api/users/route.js';
import {
  GET as getUserById,
  PUT as putUserById,
  DELETE as deleteUserById,
} from '../../app/api/users/[id]/route.js';
import { POST as terminateUser } from '../../app/api/users/[id]/terminate/route.js';
import { POST as loginUser } from '../../app/api/users/login/route.js';
import { POST as registerUser } from '../../app/api/users/register/route.js';

function jsonRequest(url, method, body) {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

describe('Users API endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();

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
      .mockResolvedValueOnce({ rows: [{ id: 1, first_name: 'Admin', is_active: true }] });

    const response = await getUsers(new Request('http://localhost/api/users?page=1&pageSize=10&status=active'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.total).toBe(1);
    expect(payload.items).toHaveLength(1);
  });

  it('POST /api/users cria usuário e define roles', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 10, first_name: 'Novo', email: 'novo@test.com' }] });

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

  it('PUT /api/users/:id atualiza usuário', async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 2, first_name: 'Atualizado', email: 'novo@email.com' }] });
    getRolesForUserMock.mockResolvedValueOnce(['user']);

    const response = await putUserById(
      jsonRequest('http://localhost/api/users/2', 'PUT', {
        first_name: 'Atualizado',
        email: 'novo@email.com',
      }),
      { params: { id: '2' } }
    );

    expect(response.status).toBe(200);
  });

  it('DELETE /api/users/:id permite hard delete para admin', async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const response = await deleteUserById(new Request('http://localhost/api/users/2', { method: 'DELETE' }), {
      params: { id: '2' },
    });

    expect(response.status).toBe(200);
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

    expect(response.status).toBe(200);
    expect(hashMock).toHaveBeenCalled();
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

    expect(response.status).toBe(403);
  });

  it('POST /api/users/register cria role padrão user', async () => {
    queryMock
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
