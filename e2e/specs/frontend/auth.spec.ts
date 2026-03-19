import { selectors } from '../../fixtures/selectors/selectors';
import { expect, test } from '../../fixtures/ui.fixture';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users/login', async (route) => {
      const payload = route.request().postDataJSON();
      const ok = payload.email === 'valid@example.com' && payload.password === 'Senha@1234';

      if (!ok) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Credenciais inválidas.' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          first_name: 'Valid',
          last_name: 'User',
          email: 'valid@example.com',
          person_type: 'PF',
        }),
      });
    });
  });

  test('TS01 - login válido com redirect next e saudação', async ({ page, waitForPageLoad }) => {
    await page.goto('/login?next=/cart');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'valid@example.com');
    await page.fill(selectors.login.password, 'Senha@1234');
    await page.click(selectors.login.submit);

    await expect(page).toHaveURL('/cart');
    await expect(page.locator(selectors.nav.userGreeting)).toBeVisible();
    await expect(page.locator(selectors.nav.userGreeting)).toContainText('Valid');
  });

  test('TS02 - deve exibir erro para credenciais inválidas', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'invalid@example.com');
    await page.fill(selectors.login.password, 'senhaErrada');
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toContainText(/Credenciais inválidas/i);
  });

  test('TS03 - deve validar campos obrigatórios', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.click(selectors.login.submit);
    await expect(page.locator(selectors.login.error)).toContainText(/Preencha e-mail e senha/i);
  });

  test('TS04 - login com senha em branco', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'valid@example.com');
    await page.fill(selectors.login.password, '');
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toContainText(/Preencha e-mail e senha/i);
  });

  test('TS05 - login com usuário em branco', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, '');
    await page.fill(selectors.login.password, 'Senha@1234');
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toContainText(/Preencha e-mail e senha/i);
  });

  test('TS06 - deve manter estado autenticado após reload', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'valid@example.com');
    await page.fill(selectors.login.password, 'Senha@1234');
    await page.click(selectors.login.submit);

    await page.reload();
    await expect(page.locator(selectors.nav.userGreeting)).toContainText('Valid');
  });
});
