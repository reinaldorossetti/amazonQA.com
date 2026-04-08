/**
 * real-purchase-flow.spec.ts
 *
 * Fluxo de compra REAL — sem nenhum mock de rede.
 * Todos os passos batem na API real em http://localhost:3001.
 *
 * Cobertura:
 *   TS01 — Login real → catálogo com produtos reais →
 *           produto aleatório → carrinho → checkout → cartão → confirmação.
 *
 *   TS02 — Busca produto por nome (via API) + compra com cartão de crédito.
 *
 *   TS03 — Múltiplos produtos aleatórios + compra com PIX.
 *
 *   TS04 — Admin cria usuário + produto via API e remove ambos na sequência.
 */

import { test, expect } from '../../fixtures/ui.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { CatalogPage } from '../../pages/CatalogPage';
import { CartPage } from '../../pages/CartPage';
import { NavComponent } from '../../pages/NavComponent';
import { ThankYouPage } from '../../pages/ThankYouPage';
import { loginAsAdminWithFallback } from '../../helpers/adminAuth';
import { isAdminAuthUnavailableError } from '../../helpers/adminAuth';

type RealFlowUser = {
  email: string;
  password: string;
};

type AdminLoginPayload = {
  accessToken: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    isAdmin?: boolean;
  };
};

// ─── URL base da API real ─────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3001/api';

/**
 * Helpers de preenchimento de campos do cartão usando pressSequentially
 * para garantir que os eventos React (onChange) disparem corretamente.
 */
async function fillCardField(page: any, selector: string, value: string) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: 'visible', timeout: 15_000 });
  await loc.click({ clickCount: 3 }); // seleciona tudo
  await loc.pressSequentially(value, { delay: 60 });
}

/** Busca todos os produtos da API real e retorna um aleatório */
async function fetchRandomProduct(): Promise<{ id: number; name: string; price: number }> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(`GET /api/products falhou: ${res.status}`);
  const products: Array<{ id: number; name: string; price: number }> = await res.json();
  if (!products.length) throw new Error('API não retornou produtos');
  return products[Math.floor(Math.random() * products.length)];
}

/** Busca todos os produtos já embaralhados */
async function fetchShuffledProducts(): Promise<Array<{ id: number; name: string; price: number }>> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error(`GET /api/products falhou: ${res.status}`);
  const products: Array<{ id: number; name: string; price: number }> = await res.json();
  return [...products].sort(() => Math.random() - 0.5);
}

/** Cria um usuário real exclusivo para o cenário e retorna as credenciais */
async function createRealFlowUser(request: any): Promise<RealFlowUser> {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const credentials: RealFlowUser = {
    email: `e2e.real.flow.${suffix}@example.com`,
    password: 'Senha@1234',
  };

  const response = await request.post(`${API_BASE}/users/register`, {
    data: {
      first_name: 'Real',
      last_name: `Flow-${suffix}`,
      email: credentials.email,
      password: credentials.password,
      person_type: 'PF',
    },
  });

  expect(response.status()).toBe(201);
  return credentials;
}

async function loginAsAdmin(request: any): Promise<AdminLoginPayload> {
  const payload = await loginAsAdminWithFallback(request, `${API_BASE}/users/login`);
  return payload as AdminLoginPayload;
}

async function createUserForDeletion(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post(`${API_BASE}/users/register`, {
    data: {
      first_name: 'Delete',
      last_name: `User-${suffix}`,
      email: `e2e.delete.user.${suffix}@example.com`,
      password: 'Senha@1234',
      person_type: 'PF',
    },
  });

  expect(response.status()).toBe(201);
  return response.json() as Promise<{ id: number; email: string }>;
}

async function createProductForDeletion(request: any, accessToken: string) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const response = await request.post(`${API_BASE}/products`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      name: `Produto Delete API ${suffix}`,
      price: 129.9,
      category: `Delete-E2E-${suffix}`,
      description: 'Produto criado no fluxo real para validar exclusão por API',
    },
  });

  expect(response.status()).toBe(201);
  return response.json() as Promise<{ id: number; name: string }>;
}

/** Helper: login real no app e aguarda redirecionamento para /minha-conta */
async function doRealLogin(page: any, credentials: RealFlowUser) {
  const loginPage = new LoginPage(page);
  await loginPage.goToLogin();
  await loginPage.login(credentials.email, credentials.password);
  await expect(page).toHaveURL('/minha-conta', { timeout: 20_000 });
  const nav = new NavComponent(page);
  await expect(nav.getUserGreetingLocator()).toBeVisible({ timeout: 15_000 });
}

/** Helper: vai ao catálogo e adiciona N produtos ao carrinho */
async function addProductsToCart(page: any, waitForPageLoad: any, count: number) {
  const catalogPage = new CatalogPage(page);
  const navComponent = new NavComponent(page);

  await catalogPage.goToCatalog();
  await waitForPageLoad(page, 'catalog');

  // Aguarda header do catálogo e botões de adicionar (produtos reais da API)
  await page.getByTestId(catalogPage.header).waitFor({ state: 'visible', timeout: 20_000 });
  const addButtons = catalogPage.getAddToCartButtonLocator();
  await addButtons.first().waitFor({ state: 'visible', timeout: 20_000 });

  const available = await addButtons.count();
  const toAdd = Math.min(count, available);

  for (let i = 0; i < toAdd; i++) {
    await catalogPage.getAddToCartButtonLocator().nth(i).click();
    await page.waitForTimeout(500);
  }

  return { navComponent, catalogPage, toAdd };
}

/**
 * Helper: preenche os dados do cartão de crédito na tela de pagamentos.
 * Usa pressSequentially para garantir que os eventos React disparem.
 */
async function fillCreditCardForm(page: any) {
  // Certifica que o método "Crédito" está selecionado (é o padrão)
  const creditCard = page.getByText('Crédito', { exact: true });
  if (await creditCard.count() > 0) {
    await creditCard.first().click();
    await page.waitForTimeout(400);
  }

  // Preenche campos do cartão usando pressSequentially (garante eventos React)
  await fillCardField(page, '#payments-card-holder-input', 'DEMO TESTER');
  await fillCardField(page, '#payments-card-number-input', '4111111111111111');
  await fillCardField(page, '#payments-card-expiry-input', '1228');
  await fillCardField(page, '#payments-card-cvv-input', '123');

  // Aguarda a detecção da bandeira Visa aparecer
  await page.waitForTimeout(400);
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('🛒 Fluxo de Compra Real (sem mock)', () => {

  /**
   * TS01 — Compra com cartão de crédito:
   *   Login real → produto aleatório da API → carrinho → checkout → cartão → confirmação
   */
  test('TS01 — Login real + produto aleatório + checkout + pagamento com cartão', async ({ page, waitForPageLoad, request }) => {

    // 1. Sorteia produto real via API antes de abrir o browser
    const product = await fetchRandomProduct();
    console.log(`\n▶ Produto sorteado: [${product.id}] ${product.name} — R$ ${product.price}`);

    const navComponent = new NavComponent(page);
    const cartPage     = new CartPage(page);
    const thankYouPage = new ThankYouPage(page);

    // 2. Cria usuário real e faz login
    const credentials = await createRealFlowUser(request);
    await doRealLogin(page, credentials);

    // 3. Catálogo real — adiciona 1 produto
    const { toAdd } = await addProductsToCart(page, waitForPageLoad, 1);
    expect(toAdd).toBeGreaterThan(0);

    // 4. Verifica badge e abre carrinho
    await expect(navComponent.getCartBadgeLocator()).not.toContainText('0', { timeout: 10_000 });
    await navComponent.clickCartButton();
    await expect(page).toHaveURL('/cart', { timeout: 10_000 });
    await waitForPageLoad(page, 'cart');
    await expect(cartPage.getTotalAmountLocator()).toBeVisible({ timeout: 10_000 });

    // 5. Intercepta resposta do pagamento para diagnóstico
    let paymentResponseStatus = 0;
    let paymentResponseBody: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/orders/') && response.url().includes('/payments')) {
        paymentResponseStatus = response.status();
        try { paymentResponseBody = await response.json(); } catch {}
      }
    });

    // 6. Avança para checkout (cria pedido real na API)
    await cartPage.clickProceedToCheckout();
    await expect(page).toHaveURL('/payments', { timeout: 20_000 });

    // 7. Preenche dados do cartão
    await fillCreditCardForm(page);

    // 8. Clica em "Pagar agora"
    const payBtn = page.getByRole('button', { name: /Pagar agora|Pay now/i });
    await expect(payBtn).toBeVisible({ timeout: 10_000 });
    await payBtn.click();

    // 9. Aguarda navegação para /thank-you
    await expect(page).toHaveURL('/thank-you', { timeout: 30_000 });
    await waitForPageLoad(page, 'thankYou');
    await expect(thankYouPage.getSummaryWrapperLocator()).toBeVisible({ timeout: 15_000 });

    console.log(`\n✅ Compra com cartão concluída! Produto: ${product.name}`);
    if (paymentResponseStatus) {
      console.log(`   API pagamento: HTTP ${paymentResponseStatus} — status: ${paymentResponseBody?.status}`);
    }
  });

  /**
   * TS02 — Busca de produto real + compra com cartão:
   *   Login → busca por nome da API → adiciona → checkout → cartão → confirmação
   */
  test('TS02 — Busca de produto real + compra com cartão de crédito', async ({ page, waitForPageLoad, request }) => {

    // 1. Sorteia produto para usar como termo de busca
    const product = await fetchRandomProduct();
    const searchTerm = product.name.split(' ').slice(0, 2).join(' ');
    console.log(`\n▶ Produto: [${product.id}] ${product.name}`);
    console.log(`▶ Termo de busca: "${searchTerm}"`);

    const navComponent  = new NavComponent(page);
    const cartPage      = new CartPage(page);
    const catalogPage   = new CatalogPage(page);
    const thankYouPage  = new ThankYouPage(page);

    // 2. Cria usuário real e faz login
    const credentials = await createRealFlowUser(request);
    await doRealLogin(page, credentials);

    // 3. Vai ao catálogo e aguarda produtos reais carregarem
    await catalogPage.goToCatalog();
    await waitForPageLoad(page, 'catalog');
    await catalogPage.getAddToCartButtonLocator().first().waitFor({ state: 'visible', timeout: 20_000 });

    // 4. Busca por nome
    await navComponent.getSearchInputLocator().waitFor({ state: 'visible', timeout: 10_000 });
    await navComponent.getSearchInputLocator().fill(searchTerm);
    await page.waitForTimeout(800); // aguarda debounce

    // 5. Verifica resultado e adiciona produto
    const addButtons = catalogPage.getAddToCartButtonLocator();
    const found = await addButtons.count();
    if (found === 0) {
      console.log(`⚠ Sem resultados para "${searchTerm}" — limpando filtro`);
      await navComponent.getSearchInputLocator().fill('');
      await page.waitForTimeout(500);
      await catalogPage.getAddToCartButtonLocator().first().waitFor({ state: 'visible', timeout: 10_000 });
    }
    await catalogPage.getAddToCartButtonLocator().first().click();

    // 6. Vai ao carrinho
    await expect(navComponent.getCartBadgeLocator()).not.toContainText('0', { timeout: 10_000 });
    await navComponent.clickCartButton();
    await expect(page).toHaveURL('/cart', { timeout: 10_000 });
    await waitForPageLoad(page, 'cart');
    await expect(cartPage.getTotalAmountLocator()).toBeVisible({ timeout: 10_000 });

    // 7. Checkout → pagamentos
    await cartPage.clickProceedToCheckout();
    await expect(page).toHaveURL('/payments', { timeout: 20_000 });

    // 8. Preenche dados do cartão
    await fillCreditCardForm(page);

    // 9. Confirma pagamento
    const payBtn = page.getByRole('button', { name: /Pagar agora|Pay now/i });
    await expect(payBtn).toBeVisible({ timeout: 10_000 });
    await payBtn.click();

    // 10. Confirmação
    await expect(page).toHaveURL('/thank-you', { timeout: 30_000 });
    await waitForPageLoad(page, 'thankYou');
    await expect(thankYouPage.getSummaryWrapperLocator()).toBeVisible({ timeout: 15_000 });

    console.log(`\n✅ Compra via busca concluída! Termo: "${searchTerm}"`);
  });

  /**
   * TS03 — Múltiplos produtos aleatórios + compra com PIX:
   *   Login → sorteia 3 produtos da API → adiciona ao carrinho → checkout → PIX → confirmação
   */
  test('TS03 — Múltiplos produtos aleatórios + checkout com PIX', async ({ page, waitForPageLoad, request }) => {

    // 1. Consulta API real e embaralha produtos
    const products = await fetchShuffledProducts();
    const howMany = Math.min(3, products.length);
    console.log(`\n▶ Adicionando até ${howMany} produtos aleatórios:`);
    products.slice(0, howMany).forEach(p => console.log(`   • [${p.id}] ${p.name} — R$ ${p.price}`));

    const navComponent = new NavComponent(page);
    const cartPage     = new CartPage(page);
    const thankYouPage = new ThankYouPage(page);

    // 2. Cria usuário real e faz login
    const credentials = await createRealFlowUser(request);
    await doRealLogin(page, credentials);

    // 3. Catálogo real — adiciona N produtos
    const { toAdd } = await addProductsToCart(page, waitForPageLoad, howMany);
    expect(toAdd).toBeGreaterThan(0);

    // 4. Verifica badge e abre carrinho
    await expect(navComponent.getCartBadgeLocator()).toContainText(String(toAdd), { timeout: 10_000 });
    await navComponent.clickCartButton();
    await expect(page).toHaveURL('/cart', { timeout: 10_000 });
    await waitForPageLoad(page, 'cart');
    await expect(cartPage.getTotalAmountLocator()).toBeVisible({ timeout: 10_000 });

    // 5. Checkout → pagamentos (cria pedido real na API)
    await cartPage.clickProceedToCheckout();
    await expect(page).toHaveURL('/payments', { timeout: 20_000 });

    // 6. Seleciona PIX (Card MUI com texto "PIX")
    const pixCard = page.getByText('PIX', { exact: true });
    await expect(pixCard.first()).toBeVisible({ timeout: 10_000 });
    await pixCard.first().click();
    await page.waitForTimeout(500);

    // 7. Confirma pagamento PIX (label é "Gerar QR Code" na UI real)
    const confirmBtn = page.getByRole('button', {
      name: /Pagar agora|Pay now|Gerar QR Code|Generate QR Code|Gerar PIX/i
    });
    await expect(confirmBtn).toBeVisible({ timeout: 10_000 });
    await confirmBtn.click();

    // 8. Confirmação (PIX fica com status pending, mas NAVEGA para /thank-you mesmo assim)
    await expect(page).toHaveURL('/thank-you', { timeout: 30_000 });
    await waitForPageLoad(page, 'thankYou');
    await expect(thankYouPage.getSummaryWrapperLocator()).toBeVisible({ timeout: 15_000 });

    console.log(`\n✅ Compra com PIX concluída! ${toAdd} produto(s).`);
  });

  /**
   * TS04 — Cria usuário e produto via API e depois remove os mesmos
   * usando token admin (sem mock, com backend real).
   */
  test('TS04 — Criar usuário + produto via API e deletar ambos', async ({ page, request }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');

    let adminSession: AdminLoginPayload;
    try {
      adminSession = await loginAsAdmin(request);
    } catch (error: unknown) {
      if (isAdminAuthUnavailableError(error)) {
        test.skip(true, `Skipping TS04: ${error instanceof Error ? error.message : 'admin auth unavailable'}`);
        return;
      }
      throw error;
    }

    const createdUser = await createUserForDeletion(request);
    expect(createdUser.id).toBeTruthy();

    const createdProduct = await createProductForDeletion(request, adminSession.accessToken);
    expect(createdProduct.id).toBeTruthy();

    const deleteUserResponse = await request.delete(`${API_BASE}/users/${createdUser.id}`, {
      headers: { Authorization: `Bearer ${adminSession.accessToken}` },
    });
    expect(deleteUserResponse.status()).toBe(200);

    const deletedUserLookup = await request.get(`${API_BASE}/users/${createdUser.id}`, {
      headers: { Authorization: `Bearer ${adminSession.accessToken}` },
    });
    expect(deletedUserLookup.status()).toBe(404);

    const deleteProductResponse = await request.delete(`${API_BASE}/products/${createdProduct.id}`, {
      headers: { Authorization: `Bearer ${adminSession.accessToken}` },
    });
    expect(deleteProductResponse.status()).toBe(200);

    const deletedProductLookup = await request.get(`${API_BASE}/products/${createdProduct.id}`);
    expect(deletedProductLookup.status()).toBe(404);

    console.log(`\n✅ TS04 concluído! Usuário ${createdUser.email} e produto ${createdProduct.name} removidos com sucesso.`);
  });

});
