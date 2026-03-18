import { expect, test } from '@playwright/test';

function uniqueUser() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return {
    first_name: 'Playwright',
    last_name: `User-${suffix}`,
    email: `pw.user.${suffix}@example.com`,
    password: 'Senha@1234',
    person_type: 'PF',
    cpf: '529.982.247-25',
  };
}

test.describe('API Users', () => {
  test('deve registrar e autenticar usuário válido', async ({ request }) => {
    const user = uniqueUser();

    const registerRes = await request.post('/users/register', { data: user });
    expect(registerRes.status()).toBe(201);

    const loginRes = await request.post('/users/login', {
      data: { email: user.email, password: user.password },
    });
    expect(loginRes.status()).toBe(200);

    const payload = await loginRes.json();
    expect(payload.email).toBe(user.email);
    expect(payload.password).toBeUndefined();
  });

  test('deve retornar 409 para e-mail duplicado', async ({ request }) => {
    const user = uniqueUser();

    const first = await request.post('/users/register', { data: user });
    expect(first.status()).toBe(201);

    const second = await request.post('/users/register', { data: user });
    expect(second.status()).toBe(409);
  });

  test('deve retornar 401 para credenciais inválidas', async ({ request }) => {
    const response = await request.post('/users/login', {
      data: { email: 'naoexiste@example.com', password: 'senhaErrada' },
    });

    expect(response.status()).toBe(401);
  });

  test('deve retornar 400 para payload incompleto', async ({ request }) => {
    const response = await request.post('/users/register', {
      data: { first_name: 'SemEmail' },
    });

    expect(response.status()).toBe(400);
  });
});
