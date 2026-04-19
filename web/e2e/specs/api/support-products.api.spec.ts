import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { loginAsAdminWithFallback } from '../../helpers/adminAuth';

/**
 * Helper: login as support user and return access token
 */
async function loginAsSupportUser(request: any): Promise<{ accessToken: string }> {
  const email = process.env.SEED_SUPPORT_EMAIL ?? 'suporte@tester.com';
  const password = process.env.SEED_SUPPORT_PASSWORD ?? 'suporte2026@QA';

  const response = await request.post('users/login', {
    data: { email, password },
  });

  if (response.status() !== 200) {
    throw new Error(`Support login failed with status ${response.status()}`);
  }

  const payload = await response.json();
  expect(payload.accessToken).toBeTruthy();
  return payload;
}

/**
 * Helper: login as admin
 */
async function loginAsAdmin(request: any): Promise<string> {
  const payload = await loginAsAdminWithFallback(request, 'users/login');
  expect(payload.accessToken).toBeTruthy();
  return payload.accessToken as string;
}

/**
 * Helper: create a random product via API
 */
function generateProductData() {
  return {
    name: `${faker.commerce.productName()} ${Date.now()}`,
    price: parseFloat(faker.commerce.price({ min: 10, max: 9999 })),
    description: faker.commerce.productDescription(),
    category: faker.helpers.arrayElement(['Eletrônicos', 'Acessórios', 'Esportes', 'Games', 'Livros']),
    image: faker.image.url(),
    manufacturer: faker.company.name(),
    line: faker.commerce.productAdjective(),
    model: faker.string.alphanumeric(6).toUpperCase(),
    shipping_cost: faker.helpers.arrayElement([0, 0, 5.99, 12.50, 19.90]),
  };
}

test.describe('API Products - Support Role & Shipping Cost', () => {

  // ── CRUD com usuário Support ──────────────────────────────────────

  test('API-SP01 - Support deve criar produto com dados aleatórios via faker', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const product = generateProductData();

    const res = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: product,
    });

    expect(res.status()).toBe(201);
    const created = await res.json();
    expect(created.id).toBeTruthy();
    expect(created.name).toBe(product.name);
    expect(Number(created.price)).toBeCloseTo(product.price, 1);

    // Cleanup
    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('API-SP02 - Support deve atualizar produto existente com dados faker', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const original = generateProductData();

    const createRes = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: original,
    });
    const created = await createRes.json();

    const updatedData = {
      ...created,
      name: `Atualizado ${faker.commerce.productName()}`,
      price: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
      shipping_cost: 25.50,
    };

    const updateRes = await request.put(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: updatedData,
    });

    expect(updateRes.status()).toBe(200);
    const updated = await updateRes.json();
    expect(updated.name).toBe(updatedData.name);
    expect(Number(updated.shipping_cost)).toBeCloseTo(25.50, 1);

    // Cleanup
    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('API-SP03 - Support deve deletar produto criado', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const product = generateProductData();

    const createRes = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: product,
    });
    const created = await createRes.json();

    const deleteRes = await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(deleteRes.status()).toBe(200);

    const getRes = await request.get(`products/${created.id}`);
    expect(getRes.status()).toBe(404);
  });

  // ── Shipping Cost ─────────────────────────────────────────────────

  test('API-SP04 - Produto criado com frete grátis deve retornar shipping_cost=0', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const product = { ...generateProductData(), shipping_cost: 0 };

    const res = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: product,
    });

    expect(res.status()).toBe(201);
    const created = await res.json();
    expect(Number(created.shipping_cost)).toBe(0);

    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('API-SP05 - Produto criado com frete pago deve preservar valor', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const shippingValue = parseFloat(faker.commerce.price({ min: 5, max: 50 }));
    const product = { ...generateProductData(), shipping_cost: shippingValue };

    const res = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: product,
    });

    expect(res.status()).toBe(201);
    const created = await res.json();
    expect(Number(created.shipping_cost)).toBeCloseTo(shippingValue, 1);

    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('API-SP06 - Produto sem shipping_cost deve assumir valor 0 por padrão', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const { shipping_cost, ...productWithoutShipping } = generateProductData();

    const res = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: productWithoutShipping,
    });

    expect(res.status()).toBe(201);
    const created = await res.json();
    expect(Number(created.shipping_cost)).toBe(0);

    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ── Autorização & Segurança ────────────────────────────────────────

  test('API-SP07 - Usuário normal NÃO deve criar produto (403)', async ({ request }) => {
    const suffix = Date.now();
    const regRes = await request.post('users/register', {
      data: {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: `e2e-normal-${suffix}@example.com`,
        password: 'Normal@1234',
        person_type: 'PF',
      },
    });
    expect(regRes.status()).toBe(201);

    const loginRes = await request.post('users/login', {
      data: { email: `e2e-normal-${suffix}@example.com`, password: 'Normal@1234' },
    });
    const { accessToken } = await loginRes.json();

    const createRes = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: generateProductData(),
    });

    expect(createRes.status()).toBe(403);
  });

  test('API-SP08 - Requisição sem token NÃO deve criar produto (401)', async ({ request }) => {
    const res = await request.post('products', {
      data: generateProductData(),
    });

    expect(res.status()).toBe(401);
  });

  test('API-SP09 - Support deve buscar produto por ID após criar', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const product = generateProductData();

    const createRes = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: product,
    });
    const created = await createRes.json();

    const getRes = await request.get(`products/${created.id}`);
    expect(getRes.status()).toBe(200);

    const fetched = await getRes.json();
    expect(fetched.name).toBe(product.name);
    expect(fetched.category).toBe(product.category);
    expect(fetched.manufacturer).toBe(product.manufacturer);

    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  test('API-SP10 - Support deve filtrar produtos por categoria', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const uniqueCategory = `Categoria-${Date.now()}`;
    const product = { ...generateProductData(), category: uniqueCategory };

    const createRes = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: product,
    });
    const created = await createRes.json();

    const filterRes = await request.get(`products?category=${uniqueCategory}`);
    expect(filterRes.status()).toBe(200);
    const filtered = await filterRes.json();
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered.some((p: { id: number }) => p.id === created.id)).toBeTruthy();

    await request.delete(`products/${created.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });

  // ── Validação de Campos ────────────────────────────────────────────

  test('API-SP11 - Criar produto sem nome deve retornar 400', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const { name, ...noName } = generateProductData();

    const res = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: noName,
    });

    expect(res.status()).toBe(400);
  });

  test('API-SP12 - Criar produto sem preço deve retornar 400', async ({ request }) => {
    const { accessToken } = await loginAsSupportUser(request);
    const { price, ...noPrice } = generateProductData();

    const res = await request.post('products', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: noPrice,
    });

    expect(res.status()).toBe(400);
  });
});
