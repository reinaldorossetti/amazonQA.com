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

  /**
   * Validates successful login when a `next` route is provided.
   * Expected behavior: user is redirected to `/cart` and a greeting is displayed.
   */
  test('TS01 - should log in successfully with next redirect and greeting', async ({ page, waitForPageLoad }) => {
    await page.goto('/login?next=/cart');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'valid@example.com');
    await page.fill(selectors.login.password, 'Senha@1234');
    await page.click(selectors.login.submit);

    await expect(page).toHaveURL('/cart');
    await expect(page.locator(selectors.nav.userGreeting)).toBeVisible();
    await expect(page.locator(selectors.nav.userGreeting)).toContainText('Valid');
  });

  /**
   * Validates authentication failure for invalid credentials.
   * Expected behavior: login page shows an "invalid credentials" error message.
   */
  test('TS02 - should display error for invalid credentials', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'invalid@example.com');
    await page.fill(selectors.login.password, 'senhaErrada');
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toContainText(/Credenciais inválidas/i);
  });

  /**
   * Validates required field enforcement on login form submission.
   * Expected behavior: submitting empty fields shows a required-fields validation message.
   */
  test('TS03 - should validate required fields', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.click(selectors.login.submit);
    await expect(page.locator(selectors.login.error)).toContainText(/Preencha e-mail e senha/i);
  });

  /**
   * Validates form behavior when password is left blank.
   * Expected behavior: required-fields validation message is shown.
   */
  test('TS04 - should show validation when password is blank', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'valid@example.com');
    await page.fill(selectors.login.password, '');
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toContainText(/Preencha e-mail e senha/i);
  });

  /**
   * Validates form behavior when email is left blank.
   * Expected behavior: required-fields validation message is shown.
   */
  test('TS05 - should show validation when email is blank', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, '');
    await page.fill(selectors.login.password, 'Senha@1234');
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toContainText(/Preencha e-mail e senha/i);
  });

  /**
   * Validates session persistence after page reload.
   * Expected behavior: authenticated user greeting remains visible after reload.
   */
  test('TS06 - should keep authenticated state after reload', async ({ page, waitForPageLoad }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.fill(selectors.login.email, 'valid@example.com');
    await page.fill(selectors.login.password, 'Senha@1234');
    await page.click(selectors.login.submit);

    await page.reload();
    await expect(page.locator(selectors.nav.userGreeting)).toContainText('Valid');
  });
});
