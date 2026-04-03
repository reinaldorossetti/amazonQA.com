import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '../../fixtures/ui.fixture';
import { setAuthenticatedSession } from '../../helpers/auth';
import { AdminPage } from '../../pages/AdminPage';

type AdminLoginPayload = {
  accessToken: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    person_type?: 'PF' | 'PJ';
    isAdmin?: boolean;
    roles?: string[];
  };
};

const API_BASE_URL = 'http://127.0.0.1:3001/api';
const THIS_FILE = fileURLToPath(import.meta.url);
const THIS_DIR = path.dirname(THIS_FILE);
const REPO_ROOT = path.resolve(THIS_DIR, '../../../../');
const SERVER_DIR = path.join(REPO_ROOT, 'server');

function ensureAdminUserAndGetEmail() {
  const commandOutput = execFileSync(process.execPath, ['scripts/ensure-admin-user.js'], {
    cwd: SERVER_DIR,
    encoding: 'utf-8',
  });

  const emailMatch = commandOutput.match(/"email"\s*:\s*"([^"]+)"/);
  return emailMatch?.[1] ?? 'admin.teste@tester.com';
}

async function loginAsAdmin(request: any): Promise<AdminLoginPayload> {
  const adminEmail = ensureAdminUserAndGetEmail();

  const response = await request.post(`${API_BASE_URL}/users/login`, {
    data: {
      email: adminEmail,
      password: 'Admin@123',
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.accessToken).toBeTruthy();
  expect(payload.user?.isAdmin).toBeTruthy();

  return payload as AdminLoginPayload;
}

async function createProductAsAdmin(request: any, accessToken: string) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const response = await request.post(`${API_BASE_URL}/products`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      name: `Produto Admin E2E ${suffix}`,
      price: 349.9,
      category: `Admin-E2E-${suffix}`,
      description: 'Produto real criado para teste de deleção via UI admin',
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

async function listProducts(request: any) {
  const response = await request.get(`${API_BASE_URL}/products`);
  expect(response.status()).toBe(200);

  const payload = await response.json();
  expect(Array.isArray(payload)).toBeTruthy();
  return payload as Array<{ id: number; name: string; category?: string }>;
}

async function createRegularUser(request: any) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const response = await request.post(`${API_BASE_URL}/users/register`, {
    data: {
      first_name: 'Usuário',
      last_name: `E2E-${suffix}`,
      email: `e2e.admin.user.${suffix}@example.com`,
      password: 'Senha@1234',
      person_type: 'PF',
    },
  });

  expect(response.status()).toBe(201);
  return response.json();
}

async function listUsersAsAdmin(request: any, accessToken: string, page = 1, pageSize = 100) {
  const response = await request.get(`${API_BASE_URL}/users?page=${page}&pageSize=${pageSize}&status=all`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(response.status()).toBe(200);

  const payload = await response.json();
  expect(Array.isArray(payload?.items)).toBeTruthy();
  return payload as {
    total: number;
    page: number;
    pageSize: number;
    items: Array<{ id: number; first_name: string; last_name: string; email: string }>;
  };
}

test.describe('Admin management', () => {
  test.describe.configure({ mode: 'serial' });

  test('ADM01 - admin deve listar produtos reais e excluir o último cadastrado', async ({ page, request }) => {
    const adminPage = new AdminPage(page);
    const adminSession = await loginAsAdmin(request);

    const createdProduct = await createProductAsAdmin(request, adminSession.accessToken);
    const products = await listProducts(request);
    const latestProduct = [...products].sort((a, b) => b.id - a.id)[0];

    expect(latestProduct).toBeTruthy();
    expect(latestProduct.id).toBe(createdProduct.id);

    await setAuthenticatedSession(
      page,
      {
        id: adminSession.user.id,
        name: adminSession.user.first_name,
        lastName: adminSession.user.last_name,
        email: adminSession.user.email,
        personType: adminSession.user.person_type ?? 'PF',
        isAdmin: Boolean(adminSession.user.isAdmin),
        roles: adminSession.user.roles ?? [],
      },
      adminSession.accessToken
    );

    await adminPage.goToAdminProducts();

    await expect(page.locator('body')).toContainText(latestProduct.name);
    await expect(adminPage.getDeleteProductButtonById(latestProduct.id)).toBeVisible();

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await adminPage.getDeleteProductButtonById(latestProduct.id).click();

    await expect(page.locator('body')).not.toContainText(latestProduct.name);
  });

  test('ADM02 - admin deve listar usuários reais e excluir o último cadastrado', async ({ page, request, pageBase }) => {
    const adminPage = new AdminPage(page);
    const adminSession = await loginAsAdmin(request);

    const createdUser = await createRegularUser(request);
    expect(createdUser?.id).toBeTruthy();

    const firstPage = await listUsersAsAdmin(request, adminSession.accessToken, 1, 100);
    const totalPages = Math.max(1, Math.ceil((firstPage.total || 0) / firstPage.pageSize));
    const lastPage = totalPages > 1
      ? await listUsersAsAdmin(request, adminSession.accessToken, totalPages, firstPage.pageSize)
      : firstPage;

    const latestUser = [...lastPage.items]
      .filter((item) => Number(item.id) !== Number(adminSession.user.id))
      .sort((a, b) => b.id - a.id)[0];

    expect(latestUser).toBeTruthy();
    expect(latestUser.id).toBe(createdUser.id);

    await setAuthenticatedSession(
      page,
      {
        id: adminSession.user.id,
        name: adminSession.user.first_name,
        lastName: adminSession.user.last_name,
        email: adminSession.user.email,
        personType: adminSession.user.person_type ?? 'PF',
        isAdmin: Boolean(adminSession.user.isAdmin),
        roles: adminSession.user.roles ?? [],
      },
      adminSession.accessToken
    );

    await adminPage.goToAdminUsers();

    await expect(page.locator('body')).toContainText(createdUser.email);
    await expect(adminPage.getDeleteUserButtonById(createdUser.id)).toBeVisible();

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await pageBase.click(`#admin-users-delete-${createdUser.id}`);

    await expect(page.locator('[data-testid="toast-body"]').last()).toContainText('Usuário excluído com sucesso.');

    const deletedUserResponse = await request.get(`${API_BASE_URL}/users/${createdUser.id}`, {
      headers: { Authorization: `Bearer ${adminSession.accessToken}` },
    });
    expect(deletedUserResponse.status()).toBe(404);
    const deletedUserPayload = await deletedUserResponse.json();
    expect(deletedUserPayload?.error).toMatch(/Usuário não encontrado/i);

    await expect(page.locator('body')).not.toContainText(createdUser.email);
  });
});
