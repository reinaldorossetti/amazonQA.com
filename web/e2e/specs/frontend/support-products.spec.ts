import { expect, test } from '../../fixtures/ui.fixture';
import { setAuthenticatedSession } from '../../helpers/auth';
import { loginAsAdminWithFallback, isAdminAuthUnavailableError } from '../../helpers/adminAuth';
import { faker } from '@faker-js/faker';

type LoginPayload = {
  accessToken: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    person_type?: 'PF' | 'PJ';
    isAdmin?: boolean;
    isSupport?: boolean;
    roles?: string[];
  };
};

const API_BASE_URL = process.env.API_BASE_URL;

/**
 * Login as support user via API
 */
async function loginAsSupport(request: any): Promise<LoginPayload> {
  const email = process.env.SEED_SUPPORT_EMAIL ?? 'suporte@tester.com';
  const password = process.env.SEED_SUPPORT_PASSWORD ?? 'suporte2026@QA';

  const response = await request.post(`${API_BASE_URL}/users/login`, {
    data: { email, password },
  });

  if (response.status() !== 200) {
    throw new Error(`Support login failed: HTTP ${response.status()}`);
  }

  return response.json();
}

/**
 * Login as admin via API
 */
async function loginAsAdmin(request: any): Promise<LoginPayload> {
  const payload = await loginAsAdminWithFallback(request, `${API_BASE_URL}/users/login`);
  return payload as LoginPayload;
}

/**
 * Set browser session for a user (support or admin)
 */
async function setSession(page: any, session: LoginPayload) {
  await setAuthenticatedSession(
    page,
    {
      id: session.user.id,
      name: session.user.first_name,
      lastName: session.user.last_name,
      email: session.user.email,
      personType: session.user.person_type ?? 'PF',
      isAdmin: Boolean(session.user.isAdmin),
      roles: session.user.roles ?? [],
    },
    session.accessToken
  );
}

/**
 * Create a product via API and return it
 */
async function createProductViaAPI(request: any, accessToken: string) {
  const product = {
    name: `E2E-UI ${faker.commerce.productName()} ${Date.now()}`,
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    description: faker.commerce.productDescription(),
    category: faker.helpers.arrayElement(['Eletrônicos', 'Acessórios', 'Esportes', 'Games']),
    image: faker.image.url(),
    manufacturer: faker.company.name(),
    line: faker.commerce.productAdjective(),
    model: faker.string.alphanumeric(5).toUpperCase(),
    shipping_cost: faker.helpers.arrayElement([0, 9.90, 15.00]),
  };

  const res = await request.post(`${API_BASE_URL}/products`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: product,
  });

  expect(res.status()).toBe(201);
  return res.json();
}

/**
 * Navigate to Support Products page
 */
async function goToSupportProducts(page: any) {
  await page.goto('/');
  await page.locator('#nav-user-greeting, [data-testid="nav-user-greeting"]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('#nav-user-greeting, [data-testid="nav-user-greeting"]').first().click();
  await page.locator('#account-menu-minha-conta-suporte-produtos, [data-testid="account-menu-minha-conta-suporte-produtos"]').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.locator('#account-menu-minha-conta-suporte-produtos, [data-testid="account-menu-minha-conta-suporte-produtos"]').first().click();
  await page.locator('#support-products-wrapper').waitFor({ state: 'visible', timeout: 30_000 });
}

test.describe('Support Products - Frontend E2E', () => {

  // ── Acesso e Visualização ─────────────────────────────────────────

  test('SUP-UI01 - Support deve acessar tela de gestão de produtos', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    await setSession(page, session);
    await goToSupportProducts(page);

    await expect(page.locator('#support-products-title')).toContainText('Gestão de Produtos');
    await expect(page.locator('#support-products-new-btn')).toBeVisible();
  });

  test('SUP-UI02 - Support deve ver tabela de produtos carregada', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    await setSession(page, session);
    await goToSupportProducts(page);

    await expect(page.locator('#support-products-table')).toBeVisible();
    const rows = page.locator('#support-products-table tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('SUP-UI03 - Support deve filtrar produtos pelo campo de busca', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    const created = await createProductViaAPI(request, session.accessToken);
    await setSession(page, session);
    await goToSupportProducts(page);

    await page.locator('#support-products-search').fill(created.name.split(' ')[0]);
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toContainText(created.name);

    // Cleanup
    await request.delete(`${API_BASE_URL}/products/${created.id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  });

  test('SUP-UI04 - Busca sem resultados deve exibir mensagem vazia', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    await setSession(page, session);
    await goToSupportProducts(page);

    await page.locator('#support-products-search').fill(`__inexistente_${Date.now()}__`);
    await page.waitForTimeout(500);

    await expect(page.locator('#support-products-empty')).toBeVisible();
    await expect(page.locator('body')).toContainText('Nenhum produto encontrado');
  });

  // ── Criação de Produto via Modal ──────────────────────────────────

  test('SUP-UI05 - Support deve abrir o modal de criação ao clicar "Novo produto"', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    await setSession(page, session);
    await goToSupportProducts(page);

    await page.locator('#support-products-new-btn').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Cadastrar Produto');
  });

  test('SUP-UI06 - Modal deve validar campo nome obrigatório', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    await setSession(page, session);
    await goToSupportProducts(page);

    await page.locator('#support-products-new-btn').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Fill only price, skip name
    const priceInput = page.locator('[role="dialog"] input').nth(1);
    await priceInput.fill('99.99');

    // Click save
    await page.locator('[role="dialog"] button:has-text("Cadastrar Produto")').click();

    // Should show validation error
    await expect(page.locator('[role="dialog"]')).toContainText('obrigatório');
  });

  // ── Edição de Produto ─────────────────────────────────────────────

  test('SUP-UI07 - Support deve abrir modal de edição com dados preenchidos', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    const created = await createProductViaAPI(request, session.accessToken);
    await setSession(page, session);
    await goToSupportProducts(page);

    await page.locator(`#support-products-edit-${created.id}`).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[role="dialog"]')).toContainText('Editar Produto');

    // Check that name field is pre-filled
    const nameInput = page.locator('[role="dialog"] input').first();
    await expect(nameInput).toHaveValue(created.name);

    // Close and cleanup
    await page.locator('[role="dialog"] button[aria-label="close"]').click();
    await request.delete(`${API_BASE_URL}/products/${created.id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
  });

  test('SUP-UI08 - Support deve excluir produto via botão de delete', async ({ page, request }) => {
    let session: LoginPayload;
    try {
      session = await loginAsSupport(request);
    } catch {
      test.skip(true, 'Support login unavailable');
      return;
    }

    const created = await createProductViaAPI(request, session.accessToken);
    await setSession(page, session);
    await goToSupportProducts(page);

    await expect(page.locator('body')).toContainText(created.name);

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.locator(`#support-products-delete-${created.id}`).click();

    // Product should disappear from the table
    await expect(page.locator('body')).not.toContainText(created.name, { timeout: 15_000 });
  });
});
