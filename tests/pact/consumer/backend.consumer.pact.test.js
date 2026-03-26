import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';
import { MatchersV3, PactV3 } from '@pact-foundation/pact';
import { getCartItems, getProducts, upsertCartItem } from '../../../src/db/api.js';

const { eachLike, integer, like, number, string } = MatchersV3;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pactDir = path.resolve(__dirname, '../../../pacts');

function withMockServerFetch(mockserver, fn) {
  const originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      return originalFetch(`${mockserver.url}${input}`, init);
    }

    if (input instanceof URL && input.pathname.startsWith('/')) {
      return originalFetch(`${mockserver.url}${input.pathname}${input.search}`, init);
    }

    return originalFetch(input, init);
  };

  return Promise.resolve()
    .then(fn)
    .finally(() => {
      globalThis.fetch = originalFetch;
    });
}

function createProvider() {
  return new PactV3({
    consumer: 'tester-web-frontend',
    provider: 'tester-backend-api',
    dir: pactDir,
  });
}

describe('Pact Consumer Contracts - tester-web-frontend x tester-backend-api', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('GET /api/products?category=Eletrônicos retorna lista tipada de produtos', async () => {
    const provider = createProvider();

    provider
      .given('catálogo com produtos disponíveis')
      .uponReceiving('uma requisição para listar produtos por categoria')
      .withRequest({
        method: 'GET',
        path: '/api/products',
        query: {
          category: 'Eletrônicos',
        },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: eachLike({
          id: integer(1),
          name: string('Produto Pact'),
          price: number(199.9),
          category: like('Eletrônicos'),
          image: like('https://example.com/pact.png'),
        }),
      });

    await provider.executeTest((mockserver) =>
      withMockServerFetch(mockserver, async () => {
        const products = await getProducts('Eletrônicos');

        expect(Array.isArray(products)).toBe(true);
        expect(products.length).toBeGreaterThan(0);
        expect(products[0]).toHaveProperty('id');
        expect(products[0]).toHaveProperty('name');
      })
    );
  });

  it('GET /api/cart?userId=:id retorna itens do carrinho para usuário autenticado', async () => {
    const provider = createProvider();

    provider
      .given('usuário autenticado com itens no carrinho')
      .uponReceiving('uma requisição para listar itens do carrinho')
      .withRequest({
        method: 'GET',
        path: '/api/cart',
        query: {
          userId: '9001',
        },
        headers: {
          Authorization: 'Bearer pact-token',
        },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: eachLike({
          id: integer(101),
          quantity: integer(2),
          product_id: integer(1),
          name: string('Produto Pact 1'),
          price: number(99.9),
        }),
      });

    await provider.executeTest((mockserver) =>
      withMockServerFetch(mockserver, async () => {
        localStorage.setItem('auth_token', 'pact-token');

        const cartItems = await getCartItems(9001);

        expect(Array.isArray(cartItems)).toBe(true);
        expect(cartItems.length).toBeGreaterThan(0);
        expect(cartItems[0]).toHaveProperty('product_id');
      })
    );
  });

  it('POST /api/cart adiciona itens em lote e retorna itens processados', async () => {
    const provider = createProvider();

    provider
      .given('usuário autenticado apto para adicionar itens no carrinho')
      .uponReceiving('uma requisição para adicionar produtos em lote no carrinho')
      .withRequest({
        method: 'POST',
        path: '/api/cart',
        headers: {
          Authorization: 'Bearer pact-token',
          'Content-Type': 'application/json',
        },
        body: {
          products: [
            { productId: integer(1), quantity: integer(2) },
            { productId: integer(2), quantity: integer(1) },
          ],
        },
      })
      .willRespondWith({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: {
          items: eachLike({
            id: integer(201),
            user_id: integer(9002),
            product_id: integer(1),
            quantity: integer(2),
          }),
          processed: integer(2),
        },
      });

    await provider.executeTest((mockserver) =>
      withMockServerFetch(mockserver, async () => {
        localStorage.setItem('auth_token', 'pact-token');

        const response = await upsertCartItem([
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ]);

        expect(response).toHaveProperty('items');
        expect(response).toHaveProperty('processed');
      })
    );
  });
});
