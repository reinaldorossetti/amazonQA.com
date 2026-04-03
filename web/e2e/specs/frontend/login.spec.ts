import { expect } from '../../fixtures/ui.fixture';
import { test, LOGIN_VALIDATION } from '../../fixtures/login.fixture';
import { LoginPage } from '../../pages/LoginPage';
import { NavComponent } from '../../pages/NavComponent';
import { PageBase, waitForPageLoad } from '../../helpers/PageBase';

test.describe('Login', () => {

  /**
   * TS01 - Happy path: preenche e-mail e senha válidos e verifica redirecionamento
    *        para área logada e saudação ao usuário na NavBar.
   */
  test('TS01 - Should successfully log in when providing valid credentials', async ({ page, setupLoginSuccessMock }) => {
    const base = new PageBase(page);
    const loginPage = new LoginPage(page);
    const navComponent = new NavComponent(page);
    const userData = base.generateUserData();

    await setupLoginSuccessMock(page, userData.email, userData.firstName);

    await loginPage.goToLogin();

    await loginPage.login(userData.email, userData.password);

    // After successful login, user is redirected to account area
    await expect(page).toHaveURL('/minha-conta');
    await expect(page.locator('#account-layout-wrapper')).toBeVisible({ timeout: base.timeOut });

    // The nav bar should greet the logged user
    await expect(page.locator(navComponent.userGreeting)).toBeVisible({ timeout: base.timeOut });
  });

  /**
   * TS02 - Credenciais inválidas: a API retorna 401 e o alerta de erro deve ser exibido.
   */
  test('TS02 - Should display an error alert when credentials are invalid', async ({ page, setupLoginFailureMock }) => {
    const base = new PageBase(page);
    const loginPage = new LoginPage(page);

    await setupLoginFailureMock(page);

    await loginPage.goToLogin();

    await loginPage.login(LOGIN_VALIDATION.testData.validEmail, LOGIN_VALIDATION.testData.wrongPassword);

    await expect(page.locator(loginPage.errorAlert)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(loginPage.errorAlert)).toContainText(LOGIN_VALIDATION.errorMessages.invalidCredentials);
  });

  /**
   * TS03 - Campos vazios: clicar em Entrar sem preencher nada exibe a mensagem de validação local.
   */
  test('TS03 - Should display a validation message when submitting with empty fields', async ({ page }) => {
    const base = new PageBase(page);
    const loginPage = new LoginPage(page);

    await loginPage.goToLogin();

    await loginPage.submit();

    await expect(page.locator(loginPage.errorAlert)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(loginPage.errorAlert)).toContainText(LOGIN_VALIDATION.errorMessages.emptyFields);
  });

  /**
   * TS04 - Apenas e-mail preenchido: clicar em Entrar sem senha exibe a mensagem de validação local.
   */
  test('TS04 - Should display a validation message when password is empty', async ({ page }) => {
    const base = new PageBase(page);
    const loginPage = new LoginPage(page);

    await loginPage.goToLogin();

    await loginPage.fillEmail(LOGIN_VALIDATION.testData.validEmail);
    await loginPage.submit();

    await expect(page.locator(loginPage.errorAlert)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(loginPage.errorAlert)).toContainText(LOGIN_VALIDATION.errorMessages.emptyFields);
  });

  /**
   * TS05 - Navegação: o botão "Criar sua conta" na página de login deve redirecionar para /register.
   */
  test('TS05 - Should navigate to the register page when clicking the create account button', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goToLogin();

    await loginPage.clickCreateAccount();

    await waitForPageLoad(page, 'register');
    await expect(page).toHaveURL('/register');
  });
});
