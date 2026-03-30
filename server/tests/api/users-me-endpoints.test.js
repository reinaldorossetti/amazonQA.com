import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, authenticateRequestMock, getRolesForUserMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  getRolesForUserMock: vi.fn(),
}));

vi.mock('../../lib/db.js', () => ({
  query: queryMock,
}));

vi.mock('../../lib/auth.js', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles.js', () => ({
  getRolesForUser: getRolesForUserMock,
}));

import { GET as getMe } from '../../app/api/users/me/route.js';
import { PUT as putMyAddress } from '../../app/api/users/me/address/route.js';

function jsonRequest(url, method = 'GET', body) {
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
}

describe('Users Me API endpoints', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    authenticateRequestMock.mockReturnValue({
      ok: true,
      auth: { userId: 7, email: 'me@test.com' },
    });

    getRolesForUserMock.mockResolvedValue(['user']);
  });

  it('GET /api/users/me retorna 401 sem autenticação', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Bearer token ausente' });

    const response = await getMe(new Request('http://localhost/api/users/me'));
    expect(response.status).toBe(401);
  });

  it('GET /api/users/me retorna dados do usuário autenticado', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          first_name: 'Reinaldo',
          last_name: 'Rossetti',
          email: 'me@test.com',
          person_type: 'PF',
        },
      ],
    });

    const response = await getMe(new Request('http://localhost/api/users/me'));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.id).toBe(7);
    expect(payload.roles).toEqual(['user']);
  });

  it('PUT /api/users/me/address retorna 400 sem campos de endereço', async () => {
    const response = await putMyAddress(jsonRequest('http://localhost/api/users/me/address', 'PUT', {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain('Nenhum campo de endereço');
  });

  it('PUT /api/users/me/address atualiza endereço autenticado', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          first_name: 'Reinaldo',
          address_zip: '01001000',
          address_city: 'São Paulo',
        },
      ],
    });

    const response = await putMyAddress(
      jsonRequest('http://localhost/api/users/me/address', 'PUT', {
        address_zip: '01001000',
        address_city: 'São Paulo',
      })
    );

    expect(response.status).toBe(200);
    expect(queryMock).toHaveBeenCalled();
  });
});
