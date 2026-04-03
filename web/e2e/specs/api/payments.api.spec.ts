import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';

async function createUser(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post('users/register', {
    data: {
      first_name: 'Payment',
      last_name: `Tester-${suffix}`,
      email: `pw.pay.${suffix}@example.com`,
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
  const projectName = faker.commerce.productName();
  const categoryName = faker.commerce.department();
  const productDescription = faker.commerce.productDescription();
  const productImage = faker.helpers.arrayElement([
    `https://picsum.photos/seed/payments-${suffix}/640/480`,
    `https://loremflickr.com/640/480/product?lock=${Math.floor(Math.random() * 100000)}`,
    `https://dummyimage.com/640x480/0f1111/ffffff.png&text=Product+${encodeURIComponent(suffix)}`,
  ]);
  const response = await request.post('products', {
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
  const product = await createProduct(request);
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

  return { user, product, accessToken, order };
}

test.describe('API Payments', () => {
  test('deve criar pagamento de crédito autorizado e marcar pedido como paid', async ({ request }) => {
    const { product, accessToken, order } = await createOrderForUser(request);
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

    await request.delete(`products/${product.id}`);
  });

  test('deve criar pagamento pix pendente e permitir consulta por paymentId', async ({ request }) => {
    const { product, accessToken, order } = await createOrderForUser(request);
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
    expect(payment.metadata?.qrCodeImage).toContain('data:image/svg+xml');
    expect(payment.metadata?.readableText).toContain('Valor ao ler QR Code');

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

    await request.delete(`products/${product.id}`);
  });

  test('deve retornar 400 quando valor de pagamento for maior que saldo do pedido', async ({ request }) => {
    const { product, accessToken, order } = await createOrderForUser(request);
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
    expect(payload.error).toBe('Valor maior que saldo do pedido');

    await request.delete(`products/${product.id}`);
  });
});
