import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
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
      first_name: 'Payment',
      last_name: `Tester-${suffix}`,
      email: `pw.pay.${suffix}@example.com`,
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
  const projectName = faker.commerce.productName();
  const categoryName = faker.commerce.department();
  const productDescription = faker.commerce.productDescription();
  const productImage = faker.helpers.arrayElement([
    `https://picsum.photos/seed/payments-${suffix}/640/480`,
    `https://loremflickr.com/640/480/product?lock=${Math.floor(Math.random() * 100000)}`,
    `https://dummyimage.com/640x480/0f1111/ffffff.png&text=Product+${encodeURIComponent(suffix)}`,
  ]);
  const response = await request.post('products', {
    headers: { Authorization: `Bearer ${adminAccessToken}` },
    data: {
      name: `${projectName} - ${suffix}`,
      price: 89.9,
      category: `${categoryName}-${suffix}`,
      description: productDescription,
      image: productImage,
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

async function createOrderForUser(request: any) {
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

  const createOrderRes = await request.post('orders', {
    headers,
    data: { shippingTotal: 0, discountTotal: 0 },
  });
  expect(createOrderRes.status()).toBe(201);
  const order = await createOrderRes.json();

  return { user, product, accessToken, order, adminAccessToken };
}

async function deleteProductAsAdmin(request: any, adminAccessToken: string, productId: number) {
  await request.delete(`products/${productId}`, {
    headers: { Authorization: `Bearer ${adminAccessToken}` },
  });
}

test.describe('API Payments', () => {
  test('deve criar pagamento de crédito autorizado e marcar pedido como paid', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payRes = await request.post(`orders/${order.id}/payments`, {
      headers,
      data: {
        method: 'credit',
        amount: Number(order.grand_total),
        cardNumber: '4111111111111111',
        holderName: 'Teste QA',
        expiry: '12/30',
        cvv: '123',
        installments: 1,
      },
    });

    expect(payRes.status()).toBe(201);
    const payment = await payRes.json();
    expect(payment.status).toBe('authorized');
    expect(payment.method).toBe('credit');

    const orderRes = await request.get(`orders/${order.id}`, { headers });
    expect(orderRes.status()).toBe(200);
    const updatedOrder = await orderRes.json();
    expect(updatedOrder.status).toBe('paid');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve criar pagamento pix pendente e permitir consulta por paymentId', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payRes = await request.post(`orders/${order.id}/payments`, {
      headers,
      data: {
        method: 'pix',
        amount: Number(order.grand_total),
      },
    });

    expect(payRes.status()).toBe(201);
    const payment = await payRes.json();
    expect(payment.status).toBe('pending');
    expect(payment.metadata?.pixCode).toBeTruthy();
    expect(payment.metadata?.qrCode).toBeTruthy();
    expect(String(payment.metadata?.readableText ?? '')).toMatch(
      /Value when reading QR Code|Valor ao ler QR Code/
    );

    const statusRes = await request.get(`orders/${order.id}/payments/${payment.id}`, {
      headers,
    });
    expect(statusRes.status()).toBe(200);
    const statusPayload = await statusRes.json();
    expect(statusPayload.id).toBe(payment.id);
    expect(statusPayload.status).toBe('pending');

    const orderRes = await request.get(`orders/${order.id}`, { headers });
    expect(orderRes.status()).toBe(200);
    const updatedOrder = await orderRes.json();
    expect(updatedOrder.status).toBe('pending_payment');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve retornar 400 quando valor de pagamento for maior que saldo do pedido', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payRes = await request.post(`orders/${order.id}/payments`, {
      headers,
      data: {
        method: 'credit',
        amount: Number(order.grand_total) + 10,
        cardNumber: '4111111111111111',
      },
    });

    expect(payRes.status()).toBe(400);
    const payload = await payRes.json();
    expect(payload.error).toBe('Amount exceeds order balance');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve baixar PDF do boleto mesmo para pedido inexistente (comportamento atual do backend)', async ({ request }) => {
    const response = await request.get('orders/9999/boleto/XYZ');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect(response.headers()['content-disposition']).toContain('boleto-9999-XYZ.pdf');
    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(100);
  });

  test('deve retornar 400 para ID de pedido inválido no download de boleto', async ({ request }) => {
    const response = await request.get('orders/invalid-id/boleto/ABC');
    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid order ID');
  });

  test('deve retornar 400 para método de pagamento inválido', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const response = await request.post(`orders/${order.id}/payments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { method: 'bitcoin' },
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid payment method');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve retornar 400 para requisição de pagamento sem método', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const response = await request.post(`orders/${order.id}/payments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {},
    });

    expect(response.status()).toBe(400);
    const payload = await response.json();
    expect(payload.error).toBe('Invalid payment method');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve retornar 404 ao pagar pedido inexistente quando autenticado', async ({ request }) => {
    const user = await createUser(request);
    const token = await loginAndGetAccessToken(request, user.email, 'Senha@1234');

    const response = await request.post('orders/999999999/payments', {
      headers: { Authorization: `Bearer ${token}` },
      data: { method: 'credit', amount: 10, cardNumber: '4111111111111111' },
    });

    expect(response.status()).toBe(404);
    const payload = await response.json();
    expect(payload.error).toBe('Order not found');
  });

  test('deve criar pagamento boleto pendente e baixar PDF com referência arbitrária', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const headers = { Authorization: `Bearer ${accessToken}` };

    const paymentRes = await request.post(`orders/${order.id}/payments`, {
      headers,
      data: {
        method: 'boleto',
        amount: Number(order.grand_total),
      },
    });

    expect(paymentRes.status()).toBe(201);
    const paymentPayload = await paymentRes.json();
    expect(paymentPayload.status).toBe('pending');
    expect(paymentPayload.method).toBe('boleto');
    expect(paymentPayload.metadata?.line).toBeTruthy();

    const boletoRes = await request.get(`orders/${order.id}/boleto/ANY-REFERENCE`);
    expect(boletoRes.status()).toBe(200);
    expect(boletoRes.headers()['content-type']).toContain('application/pdf');
    const pdfBytes = await boletoRes.body();
    expect(pdfBytes.byteLength).toBeGreaterThan(100);

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

  test('deve criar pagamento débito autorizado e marcar pedido como paid', async ({ request }) => {
    const { product, accessToken, order, adminAccessToken } = await createOrderForUser(request);
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payRes = await request.post(`orders/${order.id}/payments`, {
      headers,
      data: {
        method: 'debit',
        amount: Number(order.grand_total),
        cardNumber: '5555555555554444',
        installments: 1,
      },
    });

    expect(payRes.status()).toBe(201);
    const payment = await payRes.json();
    expect(payment.status).toBe('authorized');
    expect(payment.method).toBe('debit');

    const orderRes = await request.get(`orders/${order.id}`, { headers });
    expect(orderRes.status()).toBe(200);
    const updatedOrder = await orderRes.json();
    expect(updatedOrder.status).toBe('paid');
    expect(updatedOrder.payment_method).toBe('debit');

    await deleteProductAsAdmin(request, adminAccessToken, product.id);
  });

});
