import { expect, test } from '../../fixtures/ui.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { NavComponent } from '../../pages/NavComponent';

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
          accessToken: 'mock-token-valid-user',
          tokenType: 'Bearer',
          expiresIn: 3600,
          user: {
            id: 1,
            first_name: 'Valid',
            last_name: 'User',
            email: 'valid@example.com',
            person_type: 'PF',
          },
        }),
      });
    });
  });

  /**
   * Validates successful login when a `next` route is provided.
   * Expected behavior: user is redirected to `/cart` and a greeting is displayed.
   */
  test('TS01 - should log in successfully with next redirect and greeting', async ({ page, waitForPageLoad }) => {
    const loginPage = new LoginPage(page);
    const navComponent = new NavComponent(page);
    await page.goto('/login?next=/cart');
    await waitForPageLoad(page, 'login');

    await loginPage.fillEmail('valid@example.com');
    await loginPage.fillPassword('Senha@1234');
    await loginPage.submit();

    await expect(page).toHaveURL('/cart');
    await expect(page.locator(navComponent.userGreeting)).toBeVisible();
    await expect(page.locator(navComponent.userGreeting)).toContainText('Valid');
  });

  /**
   * Validates authentication failure for invalid credentials.
   * Expected behavior: login page shows an "invalid credentials" error message.
   */
  test('TS02 - should display error for invalid credentials', async ({ page, waitForPageLoad }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await loginPage.fillEmail('invalid@example.com');
    await loginPage.fillPassword('senhaErrada');
    await loginPage.submit();

    await expect(page.locator(loginPage.errorAlert)).toContainText(/Credenciais inválidas/i);
  });

  /**
   * Validates required field enforcement on login form submission.
   * Expected behavior: submitting empty fields shows a required-fields validation message.
   */
  test('TS03 - should validate required fields', async ({ page, waitForPageLoad }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await loginPage.submit();
    await expect(page.locator(loginPage.errorAlert)).toContainText(/Preencha e-mail e senha/i);
  });

  /**
   * Validates form behavior when password is left blank.
   * Expected behavior: required-fields validation message is shown.
   */
  test('TS04 - should show validation when password is blank', async ({ page, waitForPageLoad }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await loginPage.fillEmail('valid@example.com');
    await loginPage.fillPassword('');
    await loginPage.submit();

    await expect(page.locator(loginPage.errorAlert)).toContainText(/Preencha e-mail e senha/i);
  });

  /**
   * Validates form behavior when email is left blank.
   * Expected behavior: required-fields validation message is shown.
   */
  test('TS05 - should show validation when email is blank', async ({ page, waitForPageLoad }) => {
    const loginPage = new LoginPage(page);
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await loginPage.fillEmail('');
    await loginPage.fillPassword('Senha@1234');
    await loginPage.submit();

    await expect(page.locator(loginPage.errorAlert)).toContainText(/Preencha e-mail e senha/i);
  });

  /**
   * Validates session persistence after page reload.
   * Expected behavior: authenticated user greeting remains visible after reload.
   */
  test('TS06 - should keep authenticated state after reload', async ({ page, waitForPageLoad }) => {
    const loginPage = new LoginPage(page);
    const navComponent = new NavComponent(page);
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await loginPage.fillEmail('valid@example.com');
    await loginPage.fillPassword('Senha@1234');
    await loginPage.submit();

    await page.reload();
    await expect(page.locator(navComponent.userGreeting)).toContainText('Valid');
  });
});
