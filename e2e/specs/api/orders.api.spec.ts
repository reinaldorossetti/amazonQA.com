import { expect, test } from '@playwright/test';

async function createUser(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post('users/register', {
    data: {
      first_name: 'Order',
      last_name: `Tester-${suffix}`,
      email: `pw.order.${suffix}@example.com`,
      password: 'Senha@1234',
      person_type: 'PF',
      cpf: null,
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

async function loginAndGetAccessToken(request: any, email: string, password: string) {
  const loginRes = await request.post('users/login', { data: { email, password } });
  expect(loginRes.status()).toBe(200);
  const payload = await loginRes.json();
  expect(payload.accessToken).toBeTruthy();
  return payload.accessToken as string;
}

async function createProduct(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post('products', {
    data: {
      name: `Produto Pedido ${suffix}`,
      price: 79.9,
      category: `Orders-${suffix}`,
      description: 'Produto para teste de pedidos',
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

test.describe('API Orders', () => {
  test('deve criar pedido a partir do carrinho e limpar carrinho', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const headers = { Authorization: `Bearer ${accessToken}` };

    const addRes = await request.post('cart', {
      headers,
      data: { products: [{ productId: product.id, quantity: 2 }] },
    });
    expect(addRes.status()).toBe(201);

    const createRes = await request.post('orders', {
      headers: {
        ...headers,
        'Idempotency-Key': `idem-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      },
      data: { shippingTotal: 10, discountTotal: 5, paymentMethod: 'pix' },
    });

    expect(createRes.status()).toBe(201);
    const order = await createRes.json();

    expect(order.id).toBeTruthy();
    expect(order.order_number).toMatch(/^ORD-/);
    expect(order.status).toBe('created');
    expect(Array.isArray(order.items)).toBeTruthy();
    expect(order.items.length).toBe(1);
    expect(order.items[0].product_id).toBe(product.id);

    const cartAfterRes = await request.get(`cart?userId=${user.id}`, { headers });
    expect(cartAfterRes.status()).toBe(200);
    const cartAfter = await cartAfterRes.json();
    expect(cartAfter).toHaveLength(0);

    await request.delete(`products/${product.id}`);
  });

  test('deve respeitar idempotência no POST /orders', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const headers = { Authorization: `Bearer ${accessToken}` };

    const addRes = await request.post('cart', {
      headers,
      data: { products: [{ productId: product.id, quantity: 1 }] },
    });
    expect(addRes.status()).toBe(201);

    const key = `idem-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const firstCreate = await request.post('orders', {
      headers: { ...headers, 'Idempotency-Key': key },
      data: { shippingTotal: 0, discountTotal: 0 },
    });
    expect(firstCreate.status()).toBe(201);
    const firstPayload = await firstCreate.json();

    const secondCreate = await request.post('orders', {
      headers: { ...headers, 'Idempotency-Key': key },
      data: { shippingTotal: 0, discountTotal: 0 },
    });
    expect(secondCreate.status()).toBe(200);
    const secondPayload = await secondCreate.json();

    expect(secondPayload.id).toBe(firstPayload.id);
    expect(secondPayload.order_number).toBe(firstPayload.order_number);

    await request.delete(`products/${product.id}`);
  });

  test('deve retornar 400 ao criar pedido com carrinho vazio', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {},
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Carrinho vazio');
  });

  test('deve retornar 401 sem token no POST /orders', async ({ request }) => {
    const response = await request.post('orders', {
      data: {},
    });

    expect(response.status()).toBe(401);
  });

  test('deve listar pedidos do usuário autenticado', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const headers = { Authorization: `Bearer ${accessToken}` };

    await request.post('cart', {
      headers,
      data: { products: [{ productId: product.id, quantity: 1 }] },
    });

    const createRes = await request.post('orders', {
      headers,
      data: {},
    });
    expect(createRes.status()).toBe(201);

    const listRes = await request.get('orders?page=1&pageSize=10', { headers });
    expect(listRes.status()).toBe(200);
    const listPayload = await listRes.json();

    expect(Array.isArray(listPayload.items)).toBeTruthy();
    expect(listPayload.total).toBeGreaterThan(0);

    await request.delete(`products/${product.id}`);
  });

  test('deve bloquear acesso a pedido de outro usuário (403)', async ({ request }) => {
    const userA = await createUser(request);
    const userB = await createUser(request);
    const product = await createProduct(request);

    const tokenA = await loginAndGetAccessToken(request, userA.email, 'Senha@1234');
    const tokenB = await loginAndGetAccessToken(request, userB.email, 'Senha@1234');

    const headersA = { Authorization: `Bearer ${tokenA}` };

    await request.post('cart', {
      headers: headersA,
      data: { products: [{ productId: product.id, quantity: 1 }] },
    });

    const created = await request.post('orders', {
      headers: headersA,
      data: {},
    });
    expect(created.status()).toBe(201);
    const createdPayload = await created.json();

    const getOtherOrder = await request.get(`orders/${createdPayload.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });

    expect(getOtherOrder.status()).toBe(403);

    await request.delete(`products/${product.id}`);
  });
});
