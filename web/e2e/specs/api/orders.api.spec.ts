import { expect, test } from '@playwright/test';
import { loginAsAdminWithFallback } from '../../helpers/adminAuth';

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

async function createUser(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post('users/register', {
    data: {
      first_name: 'Order',
      last_name: `Tester-${suffix}`,
      email: `pw.order.${suffix}@example.com`,
      password: 'Senha@1234',
      person_type: 'PF',
      cpf: generateValidCPF(),
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

async function loginAsAdminAndGetAccessToken(request: any): Promise<string> {
  const payload = await loginAsAdminWithFallback(request, 'users/login');
  expect(payload.accessToken).toBeTruthy();
  expect(payload.user?.isAdmin).toBeTruthy();
  return payload.accessToken as string;
}

async function createProduct(request: any, adminAccessToken: string) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post('products', {
    headers: { Authorization: `Bearer ${adminAccessToken}` },
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

async function deleteProductAsAdmin(request: any, adminAccessToken: string, productId: number) {
  await request.delete(`products/${productId}`, {
    headers: { Authorization: `Bearer ${adminAccessToken}` },
  });
}

test.describe('API Orders', () => {
  test('deve criar pedido a partir do carrinho e limpar carrinho', async ({ request }) => {
    const user = await createUser(request);
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const product = await createProduct(request, adminAccessToken);
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

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve respeitar idempotência no POST /orders', async ({ request }) => {
    const user = await createUser(request);
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const product = await createProduct(request, adminAccessToken);
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

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
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
    expect(payload.error).toBe('Empty cart');
  });

  test('deve retornar 401 sem token no POST /orders', async ({ request }) => {
    const response = await request.post('orders', {
      data: {},
    });

    expect(response.status()).toBe(401);
  });

  test('deve listar pedidos do usuário autenticado', async ({ request }) => {
    const user = await createUser(request);
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const product = await createProduct(request, adminAccessToken);
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

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve bloquear acesso a pedido de outro usuário (403)', async ({ request }) => {
    const userA = await createUser(request);
    const userB = await createUser(request);
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const product = await createProduct(request, adminAccessToken);

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

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve retornar 401 ao tentar alterar pedido sem autenticação', async ({ request }) => {
    const response = await request.put('orders/9999', { data: { status: 'paid' } });
    expect(response.status()).toBe(401);
    const payload = await response.json();
    expect(typeof payload.error).toBe('string');
  });

  test('deve retornar 404 ao cancelar pedido inexistente com usuário autenticado', async ({ request }) => {
    const auth = await createUser(request);
    const token = await loginAndGetAccessToken(request, auth.email, 'Senha@1234');
    const response = await request.delete('orders/999999999', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(404);
    const payload = await response.json();
    expect(payload.error).toBe('Order not found');
  });

  test('deve retornar 400 para id inválido no GET /orders/{id}', async ({ request }) => {
    const auth = await createUser(request);
    const token = await loginAndGetAccessToken(request, auth.email, 'Senha@1234');
    const response = await request.get('orders/INVALID_ID', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid order ID');
  });

  test('deve retornar 400 ao criar pedido com items vazio no payload', async ({ request }) => {
    const auth = await createUser(request);
    const token = await loginAndGetAccessToken(request, auth.email, 'Senha@1234');
    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { items: [] },
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('items must be a non-empty array when provided');
  });

  test('deve criar pedido com items no payload quando carrinho estiver vazio', async ({ request }) => {
    const user = await createUser(request);
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const product = await createProduct(request, adminAccessToken);
    const token = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        items: [{ productId: product.id, quantity: 1 }],
        shippingTotal: 5,
        discountTotal: 0,
      },
    });

    expect(response.status()).toBe(201);
    const payload = await response.json();
    expect(payload.status).toBe('created');
    expect(Array.isArray(payload.items)).toBeTruthy();
    expect(payload.items[0].product_id).toBe(product.id);

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve listar pedidos paginados e validar campos de paginação', async ({ request }) => {
    const user = await createUser(request);
    const token = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.get('orders?page=2&pageSize=10', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);
    const payload = await response.json();
    expect(payload.page).toBe(2);
    expect(payload.pageSize).toBe(10);
    expect(Array.isArray(payload.items)).toBeTruthy();
    expect(typeof payload.total).toBe('number');
  });

  test('deve retornar 400 para transição de status inválida', async ({ request }) => {
    const user = await createUser(request);
    const adminAccessToken = await loginAsAdminAndGetAccessToken(request);
    const product = await createProduct(request, adminAccessToken);
    const token = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const headers = { Authorization: `Bearer ${token}` };

    const addRes = await request.post('cart', {
      headers,
      data: { products: [{ productId: product.id, quantity: 1 }] },
    });
    expect(addRes.status()).toBe(201);

    const createOrderRes = await request.post('orders', { headers, data: {} });
    expect(createOrderRes.status()).toBe(201);
    const order = await createOrderRes.json();

    const invalidTransition = await request.put(`orders/${order.id}`, {
      headers,
      data: { status: 'delivered' },
    });

    expect(invalidTransition.status()).toBe(400);
    const payload = await invalidTransition.json();
    expect(payload.error).toBe('Invalid status transition');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve retornar 400 ao criar pedido com método de pagamento inválido', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { 
          paymentMethod: 'metodo-invalido',
          items: [{ productId: 1, quantity: 1 }] 
        },
    });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao criar pedido com valor de frete negativo', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { 
          shippingTotal: -10,
          items: [{ productId: 1, quantity: 1 }]
        },
    });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 ao criar pedido com desconto negativo', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { 
          discountTotal: -5,
          items: [{ productId: 1, quantity: 1 }]
        },
    });
    expect(response.status()).toBe(400);
  });

  test('deve retornar 404 ao tentar atualizar status de pedido inexistente', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const response = await request.put('orders/999999999', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { status: 'paid' },
    });
    expect(response.status()).toBe(404);
  });

  test('deve retornar 401 ao tentar atualizar pedido sem autenticação', async ({ request }) => {
    const response = await request.put('orders/1', {
      data: { status: 'paid' },
    });
    expect(response.status()).toBe(401);
  });

  test('deve retornar 400 ao criar pedido com quantidade zero em items', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');
    const response = await request.post('orders', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { 
          items: [{ productId: 1, quantity: 0 }] 
        },
    });
    expect(response.status()).toBe(400);
  });
});
