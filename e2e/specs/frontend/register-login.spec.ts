import { expect } from '../../fixtures/ui.fixture';
import { test, LOGIN_VALIDATION } from '../../fixtures/login.fixture';
import { REGISTER_VALIDATION } from '../../fixtures/register.fixture';
import { RegisterPage } from '../../pages/RegisterPage';
import { LoginPage } from '../../pages/LoginPage';
import { NavComponent } from '../../pages/NavComponent';
import { PageBase } from '../../helpers/PageBase';

test.describe('Register → Login — Fluxo Completo', () => {

  /**
   * TS01 - Fluxo E2E: cadastra um novo usuário e em seguida realiza login
    *        com as mesmas credenciais, verificando redirecionamento para área logada
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
    const loginPage = new LoginPage(page);
    const navComponent = new NavComponent(page);
    const userData = base.generateUserData();
    const cpf = base.generateValidCPF();

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
    await registerPage.goToRegister();

    await base.fill(registerPage.firstNameInput, userData.firstName);
    await base.fill(registerPage.lastNameInput, userData.lastName);
    await base.fill(registerPage.cpfInput, cpf);
    await base.fill(registerPage.emailInput, userData.email);
    await base.fill(registerPage.phoneInput, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(registerPage.passwordInput, userData.password);
    await base.fill(registerPage.confirmPasswordInput, userData.password);
    await registerPage.clickNext();

    // Preenche endereço (step 2) — espera o ViaCEP preencher o logradouro
    await base.fill(registerPage.zipCodeInput, REGISTER_VALIDATION.testData.validZipCode);
    await expect(page.locator(registerPage.streetInput)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(registerPage.numberInput, REGISTER_VALIDATION.testData.addressNumber);
    await registerPage.clickSubmit();

    // Verifica toast de sucesso do cadastro
    await registerPage.waitForSuccessMessage(base.timeOut);

    // ── Step 2: Navega para o Login com as credenciais do cadastro ───────────
    await loginPage.goToLogin();

    await loginPage.login(userData.email, userData.password);

    // ── Step 3: Verifica redirecionamento para área logada e saudação na NavBar ───
    await expect(page).toHaveURL('/minha-conta');
    await expect(page.locator('#account-layout-wrapper')).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(navComponent.userGreeting)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(navComponent.userGreeting)).toContainText(userData.firstName, { timeout: base.timeOut });
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
    const loginPage = new LoginPage(page);
    const navComponent = new NavComponent(page);
    const userData = base.generateUserData();

    // Mock de login com sucesso para ambas as tentativas
    await setupLoginSuccessMock(page, userData.email, userData.firstName);

    await loginPage.goToLogin();

    await loginPage.login(userData.email, userData.password);

    await expect(page).toHaveURL('/minha-conta');
    await expect(page.locator('#account-layout-wrapper')).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(navComponent.userGreeting)).toBeVisible({ timeout: 10_000 });

    await navComponent.clickLogout();

    // Após logout a saudação não deve mais estar visível
    await expect(page.locator(navComponent.userGreeting)).not.toBeVisible({ timeout: base.timeOut });

    await loginPage.goToLogin();

    await loginPage.login(userData.email, userData.password);

    await expect(page).toHaveURL('/minha-conta');
    await expect(page.locator('#account-layout-wrapper')).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(navComponent.userGreeting)).toBeVisible({ timeout: base.timeOut });
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
    const loginPage = new LoginPage(page);

    await setupLoginFailureMock(page);

    await loginPage.goToLogin();

    await loginPage.login(LOGIN_VALIDATION.testData.validEmail, LOGIN_VALIDATION.testData.wrongPassword);

    await expect(page.locator(loginPage.errorAlert)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(loginPage.errorAlert)).toContainText(LOGIN_VALIDATION.errorMessages.invalidCredentials);

    // Usuário permanece na página de login
    await expect(page).toHaveURL('/login');
  });
});
