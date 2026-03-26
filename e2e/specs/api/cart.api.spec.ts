import { expect, test } from '@playwright/test';

async function createUser(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post('users/register', {
    data: {
      first_name: 'Cart',
      last_name: `Tester-${suffix}`,
      email: `pw.cart.${suffix}@example.com`,
      password: 'Senha@1234',
      person_type: 'PF',
      cpf: null,
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

async function loginAndGetAccessToken(request: any, email: string, password: string) {
  const loginRes = await request.post('users/login', {
    data: { email, password },
  });

  expect(loginRes.status()).toBe(200);
  const loginPayload = await loginRes.json();
  expect(loginPayload.accessToken).toBeTruthy();
  return loginPayload.accessToken as string;
}

async function createProduct(request: any) {
  const suffix = Date.now();
  const response = await request.post('products', {
    data: {
      name: `Produto Carrinho ${suffix}`,
      price: 49.9,
      category: `Cart-${suffix}`,
      description: 'Produto para teste de carrinho',
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

test.describe('API Cart', () => {
  test('deve adicionar, incrementar, listar e remover item do carrinho', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const addRes1 = await request.post('cart', {
      headers: authHeaders,
      data: { products: [{ productId: product.id, quantity: 2 }] },
    });
    expect(addRes1.status()).toBe(201);

    const addRes2 = await request.post('cart', {
      headers: authHeaders,
      data: { products: [{ productId: product.id, quantity: 1 }] },
    });
    expect(addRes2.status()).toBe(201);

    const listRes = await request.get(`cart?userId=${user.id}`, {
      headers: authHeaders,
    });
    expect(listRes.status()).toBe(200);
    const items = await listRes.json();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].quantity).toBe(3);

    const removeRes = await request.delete('cart', {
      headers: authHeaders,
      data: { cartItemId: items[0].id },
    });
    expect(removeRes.status()).toBe(200);

    const listAfterDelete = await request.get(`cart?userId=${user.id}`, {
      headers: authHeaders,
    });
    expect(listAfterDelete.status()).toBe(200);
    const afterItems = await listAfterDelete.json();
    expect(afterItems.length).toBe(0);

    await request.delete(`products/${product.id}`);
  });

  test('deve validar erros de payload do carrinho', async ({ request }) => {
    const getNoUser = await request.get('cart');
    expect(getNoUser.status()).toBe(401);

    const addWithoutData = await request.post('cart', { data: {} });
    expect(addWithoutData.status()).toBe(401);

    const deleteWithoutId = await request.delete('cart', { data: {} });
    expect(deleteWithoutId.status()).toBe(401);
  });

  test('deve retornar 401 com mensagem padronizada para token ausente no POST', async ({ request }) => {
    const response = await request.post('cart', {
      data: { products: [{ productId: 1, quantity: 1 }] },
    });

    expect(response.status()).toBe(401);
    const payload = await response.json();
    expect(payload.error).toBe('Token de acesso ausente, inválido, expirado ou usuário do token não existe mais');
  });

  test('deve retornar 400 para cartItemId ausente quando autenticado', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.delete('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  test('deve retornar 404 ao remover item inexistente para usuário autenticado', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.delete('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { cartItemId: 999999999 },
    });

    expect(response.status()).toBe(404);
  });

  test('deve buscar item do carrinho por ID quando existir', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const addResponse = await request.post('cart', {
      headers: authHeaders,
      data: { products: [{ productId: product.id, quantity: 2 }] },
    });

    expect(addResponse.status()).toBe(201);

    const listResponse = await request.get(`cart?userId=${user.id}`, {
      headers: authHeaders,
    });
    expect(listResponse.status()).toBe(200);
    const items = await listResponse.json();
    expect(items.length).toBeGreaterThan(0);

    const cartItemId = items[0].id;
    const getByIdResponse = await request.get(`cart/${cartItemId}`, {
      headers: authHeaders,
    });

    expect(getByIdResponse.status()).toBe(200);
    const cartItem = await getByIdResponse.json();
    expect(cartItem.id).toBe(cartItemId);
    expect(cartItem.product_id).toBe(product.id);
    expect(cartItem.quantity).toBe(2);

    await request.delete(`products/${product.id}`);
  });

  test('deve retornar 404 com mensagem "Carrinho não encontrado" para ID inexistente', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.get('cart/999999999', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(404);
    const payload = await response.json();
    expect(payload).toEqual({ message: 'Carrinho não encontrado' });
  });

  test('deve retornar 403 ao tentar acessar carrinho de outro usuário', async ({ request }) => {
    const userA = await createUser(request);
    const userB = await createUser(request);
    const accessTokenA = await loginAndGetAccessToken(request, userA.email, 'Senha@1234');

    const response = await request.get(`cart?userId=${userB.id}`, {
      headers: { Authorization: `Bearer ${accessTokenA}` },
    });

    expect(response.status()).toBe(403);
  });

  test('deve retornar 400 para userId inválido no GET do carrinho', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.get('cart?userId=abc', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 para payload inválido no POST do carrinho autenticado', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { products: [] },
    });

    expect(response.status()).toBe(400);
  });

  test('deve retornar 400 para produto duplicado no mesmo payload', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        products: [
          { productId: product.id, quantity: 1 },
          { productId: product.id, quantity: 2 },
        ],
      },
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Não é permitido possuir produto duplicado');

    await request.delete(`products/${product.id}`);
  });

  test('deve retornar 400 para produto inexistente', async ({ request }) => {
    const user = await createUser(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { products: [{ productId: 987654321, quantity: 1 }] },
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Produto não encontrado');
  });

  test('deve retornar 400 para quantidade acima do limite', async ({ request }) => {
    const user = await createUser(request);
    const product = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { products: [{ productId: product.id, quantity: 100 }] },
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Produto não possui quantidade suficiente');

    await request.delete(`products/${product.id}`);
  });

  test('deve aceitar lote com múltiplos produtos diferentes', async ({ request }) => {
    const user = await createUser(request);
    const productA = await createProduct(request);
    const productB = await createProduct(request);
    const accessToken = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const addResponse = await request.post('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        products: [
          { productId: productA.id, quantity: 2 },
          { productId: productB.id, quantity: 3 },
        ],
      },
    });

    expect(addResponse.status()).toBe(201);
    const addPayload = await addResponse.json();
    expect(addPayload.processed).toBe(2);
    expect(Array.isArray(addPayload.items)).toBeTruthy();

    const listResponse = await request.get(`cart?userId=${user.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(listResponse.status()).toBe(200);
    const listPayload = await listResponse.json();
    expect(listPayload.length).toBeGreaterThanOrEqual(2);

    const productAInCart = listPayload.find((item: any) => item.product_id === productA.id);
    const productBInCart = listPayload.find((item: any) => item.product_id === productB.id);

    expect(productAInCart).toBeTruthy();
    expect(productBInCart).toBeTruthy();
    expect(productAInCart.quantity).toBe(2);
    expect(productBInCart.quantity).toBe(3);

    const removeProductAResponse = await request.delete('cart', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { cartItemId: productAInCart.id },
    });
    expect(removeProductAResponse.status()).toBe(200);

    const listAfterRemovalResponse = await request.get(`cart?userId=${user.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(listAfterRemovalResponse.status()).toBe(200);
    const listAfterRemoval = await listAfterRemovalResponse.json();

    const stillHasProductB = listAfterRemoval.find((item: any) => item.product_id === productB.id);
    expect(stillHasProductB).toBeTruthy();
    expect(stillHasProductB.quantity).toBe(3);

    await request.delete(`products/${productA.id}`);
    await request.delete(`products/${productB.id}`);
  });
});
