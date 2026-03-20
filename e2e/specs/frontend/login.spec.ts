import { expect } from '../../fixtures/ui.fixture';
import { test, LOGIN_VALIDATION } from '../../fixtures/login.fixture';
import { selectors } from '../../fixtures/selectors/selectors';
import { PageBase, waitForPageLoad } from '../../helpers/PageBase';

test.describe('Login', () => {

  /**
   * TS01 - Happy path: preenche e-mail e senha válidos e verifica redirecionamento
   *        ao catálogo e saudação ao usuário na NavBar.
   */
  test('TS01 - Should successfully log in when providing valid credentials', async ({ page, setupLoginSuccessMock }) => {
    const base = new PageBase(page);
    const userData = base.generateUserData();

    await setupLoginSuccessMock(page, userData.email, userData.firstName);

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, userData.email);
    await base.fill(selectors.login.password, userData.password);
    await base.click(selectors.login.submit);

    // After successful login, user is redirected to catalog
    await waitForPageLoad(page, 'catalog');
    await expect(page).toHaveURL('/');

    // The nav bar should greet the logged user
    await expect(page.locator(selectors.nav.userGreeting)).toBeVisible({ timeout: base.timeOut });
  });

  /**
   * TS02 - Credenciais inválidas: a API retorna 401 e o alerta de erro deve ser exibido.
   */
  test('TS02 - Should display an error alert when credentials are invalid', async ({ page, setupLoginFailureMock }) => {
    const base = new PageBase(page);

    await setupLoginFailureMock(page);

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, LOGIN_VALIDATION.testData.validEmail);
    await base.fill(selectors.login.password, LOGIN_VALIDATION.testData.wrongPassword);
    await base.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(selectors.login.error)).toContainText(LOGIN_VALIDATION.errorMessages.invalidCredentials);
  });

  /**
   * TS03 - Campos vazios: clicar em Entrar sem preencher nada exibe a mensagem de validação local.
   */
  test('TS03 - Should display a validation message when submitting with empty fields', async ({ page }) => {
    const base = new PageBase(page);

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(selectors.login.error)).toContainText(LOGIN_VALIDATION.errorMessages.emptyFields);
  });

  /**
   * TS04 - Apenas e-mail preenchido: clicar em Entrar sem senha exibe a mensagem de validação local.
   */
  test('TS04 - Should display a validation message when password is empty', async ({ page }) => {
    const base = new PageBase(page);

    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await base.fill(selectors.login.email, LOGIN_VALIDATION.testData.validEmail);
    await page.click(selectors.login.submit);

    await expect(page.locator(selectors.login.error)).toBeVisible({ timeout: base.timeOut });
    await expect(page.locator(selectors.login.error)).toContainText(LOGIN_VALIDATION.errorMessages.emptyFields);
  });

  /**
   * TS05 - Navegação: o botão "Criar sua conta" na página de login deve redirecionar para /register.
   */
  test('TS05 - Should navigate to the register page when clicking the create account button', async ({ page }) => {
    await page.goto('/login');
    await waitForPageLoad(page, 'login');

    await page.click(selectors.login.createAccount);

    await waitForPageLoad(page, 'register');
    await expect(page).toHaveURL('/register');
  });
});
