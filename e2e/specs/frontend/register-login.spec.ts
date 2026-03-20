import { expect } from '../../fixtures/ui.fixture';
import { test, LOGIN_VALIDATION } from '../../fixtures/login.fixture';
import { REGISTER_VALIDATION } from '../../fixtures/register.fixture';
import { selectors } from '../../fixtures/selectors/selectors';
import { RegisterPage } from '../../helpers/RegisterPage';
import { PageBase, waitForPageLoad } from '../../helpers/PageBase';

test.describe('Register → Login — Fluxo Completo', () => {

  /**
   * TS01 - Fluxo E2E: cadastra um novo usuário e em seguida realiza login
   *        com as mesmas credenciais, verificando redirecionamento ao catálogo
   *        e a saudação ao usuário na NavBar.
   *
   * Mock strategy:
   *   - ViaCEP:                  retorna endereço mockado de São Paulo
   *   - POST /api/users/register: retorna 201 com os dados gerados aleatoriamente
   *   - POST /api/users/login:    retorna 200 com os mesmos dados do cadastro
   */
  test('TS01 - Should register a new user and immediately login with the same credentials', async ({
    page,
    setupLoginSuccessMock,
  }) => {
    const base = new PageBase(page);
    const registerPage = new RegisterPage(page);
    const userData = base.generateUserData();
    const cpf = registerPage.generateValidCPF();

    // 1. ViaCEP — preenchimento automático de endereço
    await page.route(REGISTER_VALIDATION.apiEndpoints.viacep, async (route) => {
      await route.fulfill({
        status: REGISTER_VALIDATION.httpStatus.ok,
        contentType: 'application/json',
        body: JSON.stringify(REGISTER_VALIDATION.testData.addressDetails),
      });
    });

    // 2. POST /api/users/register — retorna 201 com dados do usuário
    await page.route(REGISTER_VALIDATION.apiEndpoints.register, async (route) => {
      await route.fulfill({
        status: REGISTER_VALIDATION.httpStatus.success,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 42,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          person_type: 'PF',
        }),
      });
    });

    // 3. POST /api/users/login — retorna 200 com os dados do usuário cadastrado
    await setupLoginSuccessMock(page, userData.email, userData.firstName);

    // ── Step 1: Preencher o formulário de Cadastro ───────────────────────────
    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.cpf, cpf);
    await base.fill(selectors.register.email, userData.email);
    await base.fill(selectors.register.phone, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(selectors.register.password, userData.password);
    await base.fill(selectors.register.confirmPassword, userData.password);
    await base.click(selectors.register.next);

    // Preenche endereço (step 2) — espera o ViaCEP preencher o logradouro
    await base.fill(selectors.register.addressZip, REGISTER_VALIDATION.testData.validZipCode);
    await expect(page.locator(selectors.register.addressStreet)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(selectors.register.addressNumber, REGISTER_VALIDATION.testData.addressNumber);
    await page.click(selectors.register.submit);

    // Verifica toast de sucesso do cadastro
    await expect(page.locator('body')).toContainText(/Cadastro realizado com sucesso!/i, { timeout: base.timeOut });

    // ── Step 2: Navega para o Login com as credenciais do cadastro ───────────
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, userData.email);
    await base.fill(selectors.login.password, userData.password);
    await base.click(selectors.login.submit);

    // ── Step 3: Verifica redirecionamento ao catálogo e saudação na NavBar ───
    await waitForPageLoad(page, 'catalog');
    await expect(page).toHaveURL('/');
    await expect(page.locator(selectors.nav.userGreeting)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(selectors.nav.userGreeting)).toContainText(userData.firstName, { timeout: base.timeOut });
  });

  /**
   * TS02 - Logout e re-login: após fazer logout, o usuário pode entrar novamente
   *        com as mesmas credenciais e a saudação deve reaparecer na NavBar.
   */
  test('TS02 - Should allow the user to log out and log back in with the same credentials', async ({
    page,
    setupLoginSuccessMock,
  }) => {
    const base = new PageBase(page);
    const userData = base.generateUserData();

    // Mock de login com sucesso para ambas as tentativas
    await setupLoginSuccessMock(page, userData.email, userData.firstName);

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, userData.email);
    await base.fill(selectors.login.password, userData.password);
    await base.click(selectors.login.submit);

    await waitForPageLoad(page, 'catalog');
    await expect(page.locator(selectors.nav.userGreeting)).toBeVisible({ timeout: 10_000 });

    await base.click(selectors.nav.logoutButton);

    // Após logout a saudação não deve mais estar visível
    await expect(page.locator(selectors.nav.userGreeting)).not.toBeVisible({ timeout: base.timeOut });

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, userData.email);
    await base.fill(selectors.login.password, userData.password);
    await base.click(selectors.login.submit);

    await waitForPageLoad(page, 'catalog');
    await expect(page.locator(selectors.nav.userGreeting)).toBeVisible({ timeout: base.timeOut });
  });

  /**
   * TS03 - Tentativa de login com credenciais erradas após cadastro:
   *        o alerta de erro deve aparecer sem redirecionar o usuário.
   */
  test('TS03 - Should show an error when logging in with wrong password after registration', async ({
    page,
    setupLoginFailureMock,
  }) => {
    const base = new PageBase(page);

    await setupLoginFailureMock(page);

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, LOGIN_VALIDATION.testData.validEmail);
    await base.fill(selectors.login.password, LOGIN_VALIDATION.testData.wrongPassword);
    await base.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(selectors.login.error)).toContainText(LOGIN_VALIDATION.errorMessages.invalidCredentials);

    // Usuário permanece na página de login
    await expect(page).toHaveURL('/login');
  });
});
