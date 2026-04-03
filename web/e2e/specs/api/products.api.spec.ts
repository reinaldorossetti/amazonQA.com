import { expect, test } from '@playwright/test';

test.describe('API Products', () => {
  test('deve listar produtos sem filtro de categoria', async ({ request }) => {
    const response = await request.get('products');
    expect(response.status()).toBe(200);

    const payload = await response.json();
    expect(Array.isArray(payload)).toBeTruthy();
  });

  test('deve criar, buscar, filtrar, atualizar e remover produto', async ({ request }) => {
    const suffix = Date.now();

    const createRes = await request.post('products', {
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
      data: {
        ...created,
        name: `Produto Atualizado ${suffix}`,
        price: 222.22,
      },
    });
    expect(updateRes.status()).toBe(200);

    const removeRes = await request.delete(`products/${productId}`);
    expect(removeRes.status()).toBe(200);

    const afterDelete = await request.get(`products/${productId}`);
    expect(afterDelete.status()).toBe(404);
  });

  test('deve retornar 400 ao criar produto sem campos obrigatórios', async ({ request }) => {
    const response = await request.post('products', { data: { description: 'sem campos obrigatórios' } });
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
    const response = await request.put('products/999999999', {
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
    const response = await request.delete('products/999999999');
    expect(response.status()).toBe(404);
  });
});
