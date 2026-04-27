import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';
import { loginAsAdminWithFallback } from '../../helpers/adminAuth';

function uniqueUser() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return {
    first_name: 'Playwright',
    last_name: `User-${suffix}`,
    email: `pw.user.${suffix}@example.com`,
    password: 'Senha@1234',
    person_type: 'PF',
    cpf: generateValidCPF(),
  };
}

function generateValidCPF(): string {
  const randomNumbers = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));

  let sum = randomNumbers.reduce((acc, digit, i) => acc + digit * (10 - i), 0);
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  const numbersWithFirst = [...randomNumbers, firstDigit];
  sum = numbersWithFirst.reduce((acc, digit, i) => acc + digit * (11 - i), 0);
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  const cpfArray = [...randomNumbers, firstDigit, secondDigit];
  return `${cpfArray.slice(0, 3).join('')}.${cpfArray.slice(3, 6).join('')}.${cpfArray.slice(6, 9).join('')}-${cpfArray.slice(9).join('')}`;
}

function generateValidCNPJ(): string {
  const baseNumbers = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  const weightsFirst = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weightsSecond = [6, ...weightsFirst];

  const firstSum = baseNumbers.reduce((acc, digit, i) => acc + digit * weightsFirst[i], 0);
  const firstDigit = firstSum % 11 < 2 ? 0 : 11 - (firstSum % 11);

  const numbersWithFirst = [...baseNumbers, firstDigit];
  const secondSum = numbersWithFirst.reduce((acc, digit, i) => acc + digit * weightsSecond[i], 0);
  const secondDigit = secondSum % 11 < 2 ? 0 : 11 - (secondSum % 11);

  const cnpjArray = [...baseNumbers, firstDigit, secondDigit];
  return `${cnpjArray.slice(0, 2).join('')}.${cnpjArray.slice(2, 5).join('')}.${cnpjArray.slice(5, 8).join('')}/${cnpjArray.slice(8, 12).join('')}-${cnpjArray.slice(12).join('')}`;
}

async function registerUntilCreated(
  request: APIRequestContext,
  dataFactory: () => Record<string, unknown>,
): Promise<APIResponse> {
  let response: APIResponse | undefined;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await request.post('users/register', { data: dataFactory() });
    if (response.status() === 201) {
      return response;
    }
  }

  if (!response) {
    throw new Error('Não foi possível criar um usuário válido após múltiplas tentativas.');
  }

  return response;
}

async function loginAndGetPayload(request: APIRequestContext, email: string, password: string) {
  const response = await request.post('users/login', {
    data: { email, password },
  });
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.accessToken).toBeTruthy();
  expect(payload.tokenType).toBe('Bearer');
  return payload as {
    accessToken: string;
    user: { id: number; email: string; isAdmin?: boolean; roles?: string[] };
  };
}

async function createUserAndLogin(request: APIRequestContext) {
  const user = uniqueUser();
  const registerRes = await request.post('users/register', { data: user });
  expect(registerRes.status()).toBe(201);
  const loginPayload = await loginAndGetPayload(request, user.email, user.password);
  return {
    user,
    token: loginPayload.accessToken,
    id: loginPayload.user.id,
    loginPayload,
  };
}

async function loginAsAdminAndGetToken(request: APIRequestContext): Promise<string> {
  const payload = await loginAsAdminWithFallback(request, 'users/login');
  expect(payload.accessToken).toBeTruthy();
  expect(payload.user?.isAdmin).toBeTruthy();
  return payload.accessToken as string;
}

test.describe('API Users', () => {
  test('deve registrar e autenticar usuário válido', async ({ request }) => {
    const user = uniqueUser();

    const registerRes = await request.post('users/register', { data: user });
    expect(registerRes.status()).toBe(201);

    const loginRes = await request.post('users/login', {
      data: { email: user.email, password: user.password },
    });
    expect(loginRes.status()).toBe(200);

    const payload = await loginRes.json();
    expect(payload.accessToken).toBeTruthy();
    expect(payload.tokenType).toBe('Bearer');
    expect(payload.user.email).toBe(user.email);
    expect(payload.user.password).toBeUndefined();
  });

  test('deve retornar 409 para e-mail duplicado', async ({ request }) => {
    let user = uniqueUser();
    let first = await request.post('users/register', { data: user });

    if (first.status() !== 201) {
      user = uniqueUser();
      first = await request.post('users/register', { data: user });
    }

    expect(first.status()).toBe(201);

    const second = await request.post('users/register', { data: user });
    expect(second.status()).toBe(409);
  });

  test('deve retornar 401 para credenciais inválidas', async ({ request }) => {
    const response = await request.post('users/login', {
      data: { email: 'naoexiste@example.com', password: 'senhaErrada' },
    });

    expect(response.status()).toBe(401);
  });

  test('deve retornar 401 para senha incorreta de usuário existente', async ({ request }) => {
    const user = uniqueUser();
    const registerRes = await request.post('users/register', { data: user });
    expect(registerRes.status()).toBe(201);

    const response = await request.post('users/login', {
      data: { email: user.email, password: 'SenhaErrada@999' },
    });

    expect(response.status()).toBe(401);
  });

  test('deve retornar 400 para login sem email/senha', async ({ request }) => {
    const response = await request.post('users/login', {
      data: { email: '', password: '' },
    });

    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 para payload incompleto', async ({ request }) => {
    const response = await request.post('users/register', {
      data: { first_name: 'SemEmail' },
    });

    expect(response.status()).toBe(400);
  });

  test('deve retornar 409 para CPF duplicado', async ({ request }) => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const cpf = generateValidCPF();

    const first = await registerUntilCreated(request, () => ({
      first_name: 'CPF',
      last_name: `Primeiro-${suffix}`,
      email: `cpf.first.${suffix}.${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'Senha@1234',
      person_type: 'PF',
      cpf,
    }));
    expect(first.status()).toBe(201);

    const second = await request.post('users/register', {
      data: {
        first_name: 'CPF',
        last_name: `Segundo-${suffix}`,
        email: `cpf.second.${suffix}@example.com`,
        password: 'Senha@1234',
        person_type: 'PF',
        cpf,
      },
    });

    expect(second.status()).toBe(409);
  });

  test('deve retornar 409 para CNPJ duplicado', async ({ request }) => {
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const cnpj = generateValidCNPJ();

    const first = await registerUntilCreated(request, () => ({
      first_name: 'PJ',
      last_name: `Primeiro-${suffix}`,
      email: `cnpj.first.${suffix}.${Math.floor(Math.random() * 10000)}@example.com`,
      password: 'Senha@1234',
      person_type: 'PJ',
      company_name: `Empresa ${suffix}`,
      cnpj,
    }));
    expect(first.status()).toBe(201);

    const second = await request.post('users/register', {
      data: {
        first_name: 'PJ',
        last_name: `Segundo-${suffix}`,
        email: `cnpj.second.${suffix}@example.com`,
        password: 'Senha@1234',
        person_type: 'PJ',
        company_name: `Empresa 2 ${suffix}`,
        cnpj,
      },
    });

    expect(second.status()).toBe(409);
  });

  test('deve retornar 401 ao listar usuários sem autenticação', async ({ request }) => {
    const response = await request.get('users');
    expect(response.status()).toBe(401);
    const payload = await response.json();
    expect(typeof payload.error).toBe('string');
  });

  test('deve retornar 403 ao listar usuários com token de usuário comum', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.get('users', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe('Access restricted to administrators');
  });

  test('deve listar usuários com admin e validar formato da resposta', async ({ request }) => {
    const adminToken = await loginAsAdminAndGetToken(request);
    const response = await request.get('users?page=1&pageSize=5&status=all', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);

    const payload = await response.json();
    expect(payload.page).toBe(1);
    expect(payload.pageSize).toBe(5);
    expect(typeof payload.total).toBe('number');
    expect(Array.isArray(payload.items)).toBeTruthy();
  });

  test('deve retornar 403 ao criar usuário via /users com usuário não-admin', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.post('users', {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        first_name: 'Nao',
        last_name: 'Admin',
        email: `not.admin.${Date.now()}@example.com`,
        password: 'Senha@1234',
      },
    });

    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe('Access restricted to administrators');
  });

  test('deve criar usuário via /users quando autenticado como admin', async ({ request }) => {
    const adminToken = await loginAsAdminAndGetToken(request);
    const email = `admin.created.${Date.now()}@example.com`;
    const response = await request.post('users', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        first_name: 'Admin',
        last_name: 'Created',
        email,
        password: 'Senha@1234',
        role: 'user',
      },
    });

    expect(response.status()).toBe(201);
    const payload = await response.json();
    expect(payload.email).toBe(email);
    expect(Array.isArray(payload.roles)).toBeTruthy();
    expect(payload.roles).toContain('user');
  });

  test('deve retornar dados do próprio usuário em /users/{id}', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.get(`users/${auth.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.id).toBe(auth.id);
    expect(payload.email).toBe(auth.user.email);
  });

  test('deve bloquear acesso de usuário comum ao /users/{id} de outro usuário', async ({ request }) => {
    const userA = await createUserAndLogin(request);
    const userB = await createUserAndLogin(request);

    const response = await request.get(`users/${userB.id}`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });

    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe('Access denied for this user');
  });

  test('deve atualizar o próprio usuário em /users/{id}', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const newFirstName = `Updated-${Date.now()}`;
    const response = await request.put(`users/${auth.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { first_name: newFirstName },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.id).toBe(auth.id);
    expect(payload.first_name).toBe(newFirstName);
  });

  test('deve retornar 400 ao atualizar usuário sem campos permitidos', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.put(`users/${auth.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {},
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('No fields to update');
  });

  test('deve retornar o usuário autenticado em /users/me', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.get('users/me', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.id).toBe(auth.id);
    expect(payload.email).toBe(auth.user.email);
  });

  test('deve atualizar endereço em /users/me/address', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.put('users/me/address', {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {
        address_zip: '01001-000',
        address_city: 'São Paulo',
      },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.id).toBe(auth.id);
    expect(payload.address_city).toBe('São Paulo');
  });

  test('deve retornar 400 ao atualizar endereço sem campos em /users/me/address', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.put('users/me/address', {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: {},
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('No address fields to update');
  });

  test('deve retornar 200 ao consultar GET /users/me/address com usuário autenticado', async ({ request }) => {
    const auth = await createUserAndLogin(request);

    // Popula o endereço para garantir a validação do GET
    await request.put('users/me/address', {
      headers: { Authorization: `Bearer ${auth.token}` },
      data: { address_city: 'Rio de Janeiro', address_zip: '20000-000' },
    });

    const response = await request.get('users/me/address', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.address_city).toBe('Rio de Janeiro');
    expect(payload.address_zip).toBe('20000-000');
    expect(payload).toHaveProperty('address_street');
    expect(payload).toHaveProperty('address_number');
    expect(payload).toHaveProperty('address_complement');
    expect(payload).toHaveProperty('address_neighborhood');
    expect(payload).toHaveProperty('address_state');
  });

  test('deve retornar 401 ao consultar GET /users/me/address sem autenticação', async ({ request }) => {
    const response = await request.get('users/me/address');
    expect(response.status()).toBe(401);
  });

  test('deve retornar 404 ao consultar GET /users/me/address com token de usuário inexistente', async ({ request }) => {
    const auth = await createUserAndLogin(request);

    // Força a remoção do usuário via admin para o ID não ser mais encontrado
    const adminToken = await loginAsAdminAndGetToken(request);
    const deleteRes = await request.delete(`users/${auth.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(deleteRes.status()).toBe(200);

    // Usa o token válido de um usuário que acabou de ser deletado
    const response = await request.get('users/me/address', {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    expect(response.status()).toBe(404);
  });

  // Nota: O erro 500 (Erro Interno) está documentado no Swagger, mas não foi 
  // implementado em teste E2E pois exigiria indisponibilidade forçada do Banco de Dados
  // o que corromperia a execução dos outros testes da suíte em paralelo.


  test('deve retornar 403 ao deletar usuário sem ser admin', async ({ request }) => {
    const auth = await createUserAndLogin(request);
    const response = await request.delete(`users/${auth.id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    expect(response.status()).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe('Only admin can delete users');
  });

  test('deve encerrar a própria conta e retornar 409 na segunda tentativa', async ({ request }) => {
    const auth = await createUserAndLogin(request);

    const firstResponse = await request.post(`users/${auth.id}/terminate`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    expect(firstResponse.status()).toBe(200);
    const firstPayload = await firstResponse.json();
    expect(firstPayload.message).toBe('Account closed with data obfuscation applied');
    expect(firstPayload.user?.is_active).toBe(false);
    expect(firstPayload.user?.account_closed_at).toBeTruthy();

    const secondResponse = await request.post(`users/${auth.id}/terminate`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    expect(secondResponse.status()).toBe(409);
    const secondPayload = await secondResponse.json();
    expect(secondPayload.error).toBe('Account is already closed');
  });

  test('deve retornar 400 para e-mail com formato inválido no registro', async ({ request }) => {
    const user = uniqueUser();
    user.email = 'email-invalido';
    const response = await request.post('users/register', { data: user });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 para senha muito curta no registro', async ({ request }) => {
    const user = uniqueUser();
    user.password = '123';
    const response = await request.post('users/register', { data: user });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao registrar sem person_type', async ({ request }) => {
    const user = uniqueUser();
    delete (user as any).person_type;
    const response = await request.post('users/register', { data: user });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao registrar PF sem informar CPF', async ({ request }) => {
    const user = uniqueUser();
    user.person_type = 'PF';
    (user as any).cpf = null; // CPF is already null in uniqueUser, but making it explicit
    const response = await request.post('users/register', { data: user });
    // Note: Some systems might allow this if CPF is not strictly required at registration, 
    // but usually 400 is expected if the logic requires it for PF.
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao registrar PJ sem informar CNPJ', async ({ request }) => {
    const user = uniqueUser();
    user.person_type = 'PJ';
    const response = await request.post('users/register', { data: user });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 401 ao tentar logar com email inexistente', async ({ request }) => {
    const response = await request.post('users/login', {
      data: { email: 'inexistente.user.999@example.com', password: 'Senha@123' },
    });
    expect(response.status()).toBe(401);
  });

  test('deve retornar 403 ao tentar atualizar perfil de outro usuário', async ({ request }) => {
    const userA = await createUserAndLogin(request);
    const userB = await createUserAndLogin(request);

    const response = await request.put(`users/${userB.id}`, {
      headers: { Authorization: `Bearer ${userA.token}` },
      data: { first_name: 'Hack Attempt' },
    });

    expect(response.status()).toBe(403);
  });
});
