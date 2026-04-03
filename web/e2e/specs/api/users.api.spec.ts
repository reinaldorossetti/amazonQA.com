import { expect, test, type APIRequestContext, type APIResponse } from '@playwright/test';

function uniqueUser() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return {
    first_name: 'Playwright',
    last_name: `User-${suffix}`,
    email: `pw.user.${suffix}@example.com`,
    password: 'Senha@1234',
    person_type: 'PF',
    cpf: null,
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
});
