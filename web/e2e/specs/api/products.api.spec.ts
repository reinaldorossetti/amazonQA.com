import { expect, test } from '@playwright/test';
import { loginAsAdminWithFallback } from '../../helpers/adminAuth';

async function loginAsAdminAndGetAccessToken(request: any): Promise<string> {
  const payload = await loginAsAdminWithFallback(request, 'users/login');
  expect(payload.accessToken).toBeTruthy();
  expect(payload.user?.isAdmin).toBeTruthy();
  return payload.accessToken as string;
}

test.describe('API Products', () => {
  test('deve listar produtos sem filtro de categoria', async ({ request }) => {
    const response = await request.get('products');
    expect(response.status()).toBe(200);

    const payload = await response.json();
    expect(Array.isArray(payload)).toBeTruthy();
  });

  test('deve criar, buscar, filtrar, atualizar e remover produto', async ({ request }) => {
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const suffix = Date.now();

    const createRes = await request.post('products', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      data: {
        name: `Produto Playwright ${suffix}`,
        price: 123.45,
        description: 'Produto para teste automatizado',
        category: `Playwright-${suffix}`,
        image: 'https://example.com/pw-product.jpg',
        manufacturer: 'PW',
        line: 'Automation',
        model: 'PW-1',
      },
    });
    expect(createRes.status()).toBe(201);

    const created = await createRes.json();
    const productId = created.id;

    const getById = await request.get(`products/${productId}`);
    expect(getById.status()).toBe(200);

    const byIdPayload = await getById.json();
    expect(byIdPayload.name).toContain('Produto Playwright');

    const listByCategory = await request.get(`products?category=Playwright-${suffix}`);
    expect(listByCategory.status()).toBe(200);
    const filtered = await listByCategory.json();
    expect(filtered.some((p: { id: number }) => p.id === productId)).toBeTruthy();

    const updateRes = await request.put(`products/${productId}`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      data: {
        ...created,
        name: `Produto Atualizado ${suffix}`,
        price: 222.22,
      },
    });
    expect(updateRes.status()).toBe(200);

    const removeRes = await request.delete(`products/${productId}`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });
    expect(removeRes.status()).toBe(200);

    const afterDelete = await request.get(`products/${productId}`);
    expect(afterDelete.status()).toBe(404);
  });

  test('deve retornar 400 ao criar produto sem campos obrigatórios', async ({ request }) => {
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const response = await request.post('products', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      data: { description: 'sem campos obrigatórios' },
    });
    expect(response.status()).toBe(400);
  });

  test('deve retornar array vazio para categoria inexistente', async ({ request }) => {
    const response = await request.get('products?category=__NO_MATCH__PLAYWRIGHT__');
    expect(response.status()).toBe(200);

    const payload = await response.json();
    expect(Array.isArray(payload)).toBeTruthy();
    expect(payload.length).toBe(0);
  });

  test('deve retornar 404 ao atualizar produto inexistente', async ({ request }) => {
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const response = await request.put('products/999999999', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      data: {
        name: 'Inexistente',
        price: 10,
        description: null,
        category: null,
        image: null,
        manufacturer: null,
        line: null,
        model: null,
      },
    });

    expect(response.status()).toBe(404);
  });

  test('deve retornar 404 ao remover produto inexistente', async ({ request }) => {
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const response = await request.delete('products/999999999', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
    });
    expect(response.status()).toBe(404);
  });

  test('deve retornar 401 ao criar produto sem token', async ({ request }) => {
    const response = await request.post('products', {
      data: { name: 'Sem Token', price: 10, category: 'N/A' },
    });
    expect(response.status()).toBe(401);
  });

  test('deve retornar 403 ao criar produto com usuário comum', async ({ request }) => {
    // Needs a user token instead of admin
    const userRes = await request.post('users/register', {
      data: {
        first_name: 'Product', last_name: 'Tester',
        email: `common.user.prod.${Date.now()}@example.com`,
        password: 'Senha@1234', person_type: 'PF'
      }
    });
    const { accessToken } = await (await request.post('users/login', {
      data: { email: (await userRes.json()).email, password: 'Senha@1234' }
    })).json();

    const response = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Hack Product', price: 10, category: 'N/A' },
    });
    expect(response.status()).toBe(403);
  });

  test('deve retornar 403 ao deletar produto com usuário comum', async ({ request }) => {
    const userRes = await request.post('users/register', {
        data: {
          first_name: 'Delete', last_name: 'Tester',
          email: `del.user.prod.${Date.now()}@example.com`,
          password: 'Senha@1234', person_type: 'PF'
        }
      });
      const { accessToken } = await (await request.post('users/login', {
        data: { email: (await userRes.json()).email, password: 'Senha@1234' }
      })).json();

    const response = await request.delete('products/1', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('deve retornar 403 ao atualizar produto com usuário comum', async ({ request }) => {
    const userRes = await request.post('users/register', {
        data: {
          first_name: 'Update', last_name: 'Tester',
          email: `upd.user.prod.${Date.now()}@example.com`,
          password: 'Senha@1234', person_type: 'PF'
        }
      });
      const { accessToken } = await (await request.post('users/login', {
        data: { email: (await userRes.json()).email, password: 'Senha@1234' }
      })).json();

    const response = await request.put('products/1', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Updated' },
    });
    expect(response.status()).toBe(403);
  });

  test('deve retornar 400 ao buscar produto com id em formato inválido', async ({ request }) => {
    const response = await request.get('products/abc-invalido');
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao criar produto com preço negativo', async ({ request }) => {
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const response = await request.post('products', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      data: {
        name: 'Preço Negativo',
        price: -10.50,
        category: 'Test'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao criar produto sem categoria', async ({ request }) => {
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const response = await request.post('products', {
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      data: {
        name: 'Sem Categoria',
        price: 50
      }
    });
    expect(response.status()).toBe(400);
  });
});
