import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, authenticateRequestMock, getRolesForUserMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  authenticateRequestMock: vi.fn(),
  getRolesForUserMock: vi.fn(),
}));

vi.mock('../../lib/db', () => ({
  query: queryMock,
}));

vi.mock('../../lib/auth', () => ({
  authenticateRequest: authenticateRequestMock,
}));

vi.mock('../../lib/user-roles', () => ({
  getRolesForUser: getRolesForUserMock,
}));

import { GET as getMe } from '../../app/api/users/me/route';
import { PUT as putMyAddress } from '../../app/api/users/me/address/route';

function jsonRequest(url: string, method = 'GET', body?: unknown): Request {
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

  it('GET /api/users/me returns 401 without authentication', async () => {
    authenticateRequestMock.mockReturnValueOnce({ ok: false, error: 'Missing bearer token' });

    const response = await getMe(new Request('http://localhost/api/users/me'));
    expect(response.status).toBe(401);
  });

  it('GET /api/users/me returns authenticated user data', async () => {
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

  it('PUT /api/users/me/address returns 400 when no address fields are provided', async () => {
    const response = await putMyAddress(jsonRequest('http://localhost/api/users/me/address', 'PUT', {}));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain('No address fields');
  });

  it('PUT /api/users/me/address updates authenticated address', async () => {
    queryMock.mockResolvedValueOnce({
      rows: [
        {
          id: 7,
          first_name: 'Reinaldo',
          address_zip: '01001000',
          address_city: 'New York',
        },
      ],
    });

    const response = await putMyAddress(
      jsonRequest('http://localhost/api/users/me/address', 'PUT', {
        address_zip: '01001000',
        address_city: 'New York',
      })
    );

    expect(response.status).toBe(200);
    expect(queryMock).toHaveBeenCalled();
  });
});
