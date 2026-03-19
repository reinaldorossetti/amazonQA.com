import { faker } from '@faker-js/faker';
import { expect } from '../../fixtures/ui.fixture';
import { test, REGISTER_VALIDATION } from '../../fixtures/register.fixture';
import { selectors } from '../../fixtures/selectors/selectors';
import { RegisterPage } from '../../helpers/RegisterPage';
import { waitForPageLoad, PageBase } from '../../helpers/PageBase';

test.describe('Register', () => {
  /**
   * Generate random user data for test cases
   */
  const generateUserData = () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Aa1@',
  });

  /**
   * Generate invalid email (no @ symbol)
   */
  const generateInvalidEmail = () => faker.lorem.word() + faker.lorem.word() + '.com';

  /**
   * Generate password shorter than 8 chars (fails local validation)
   */
  const generateShortPassword = () => faker.string.alphanumeric(5);

  /**
   * Generate different password for mismatch test
   */
  const generateDifferentPassword = () =>
    faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Bb2@';

  /**
   * TS01 - Happy path: preenche os dois steps completos e verifica sucesso via toast
   */
  test('TS01 - Validar registro realizado com sucesso', async ({ page, setupViacepMock }) => {
    const userData = generateUserData();
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const cpf = registerPage.generateValidCPF();

    // Mock do ViaCEP para não depender de rede externa
    await setupViacepMock(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    // ── Step 0: Dados Pessoais ────────────────────────────────────────────────
    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.cpf, cpf);
    await base.fill(selectors.register.email, userData.email);
    await base.fill(selectors.register.phone, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(selectors.register.password, userData.password);
    await base.fill(selectors.register.confirmPassword, userData.password);

    await base.click(selectors.register.next);

    // ── Step 1: Endereço ──────────────────────────────────────────────────────
    await base.fill(selectors.register.addressZip, REGISTER_VALIDATION.testData.validZipCode);
    // Aguarda o ViaCEP preencher automaticamente o logradouro
    await expect(page.locator(selectors.register.addressStreet)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(selectors.register.addressNumber, REGISTER_VALIDATION.testData.addressNumber);

    await page.click(selectors.register.submit);

    // ── Verificações ──────────────────────────────────────────────────────────
    await expect(page.locator('body')).toContainText(/Cadastro realizado com sucesso!/i, { timeout: 10_000 });
  });

  /**
   * TS02 - Email em formato inválido: erro aparece no helper text do campo email no step 0
   */
  test('TS02 - rejeita email em formato inválido aleatório', async ({ page }) => {
    const userData = generateUserData();
    const invalidEmail = generateInvalidEmail();
    const base = new PageBase(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.email, invalidEmail);
    await base.fill(selectors.register.password, userData.password);
    await base.fill(selectors.register.confirmPassword, userData.password);

    await base.click(selectors.register.next);

    await expect(page.locator(selectors.register.errorEmail)).toContainText(REGISTER_VALIDATION.errorMessages.emailInvalid);
  });

  /**
   * TS03 - Senha curta (< 8 chars): falha na validação local do step 0
   */
  test('TS03 - rejeita senha curta no step 0', async ({ page }) => {
    const userData = generateUserData();
    const shortPassword = generateShortPassword();
    const base = new PageBase(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.email, userData.email);
    await base.fill(selectors.register.password, shortPassword);
    await base.fill(selectors.register.confirmPassword, shortPassword);

    await base.click(selectors.register.next);

    await expect(page.locator(selectors.register.errorPassword)).toContainText(REGISTER_VALIDATION.errorMessages.passwordMinLength);
  });

  /**
   * TS04 - Senhas não correspondem: erro aparece no helper text do campo confirmar senha
   */
  test('TS04 - rejeita senhas não-correspondentes com dados aleatórios', async ({ page }) => {
    const userData = generateUserData();
    const differentPassword = generateDifferentPassword();
    const base = new PageBase(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.email, userData.email);
    await base.fill(selectors.register.password, userData.password);
    await base.fill(selectors.register.confirmPassword, differentPassword);

    await base.click(selectors.register.next);

    await expect(page.locator(selectors.register.errorConfirmPassword)).toContainText(/As senhas não coincidem/i);
  });

  /**
   * TS05 - Campo obrigatório faltando: ao clicar em Next o step não avança
   *        e o campo sem preenchimento exibe sua mensagem de erro individual.
   */
  test('TS05 - valida campo obrigatório faltando no step 0', async ({ page }) => {
    const missingField = faker.helpers.arrayElement(['firstName', 'lastName', 'email', 'password']);
    const base = new PageBase(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    if (missingField !== 'firstName') await base.fill(selectors.register.firstName, faker.person.firstName());
    if (missingField !== 'lastName') await base.fill(selectors.register.lastName, faker.person.lastName());
    if (missingField !== 'email') await base.fill(selectors.register.email, faker.internet.email());
    if (missingField !== 'password') {
      const pwd = faker.internet.password({ length: 10 }) + 'Aa1@';
      await base.fill(selectors.register.password, pwd);
      await base.fill(selectors.register.confirmPassword, pwd);
    }

    await base.click(selectors.register.next);

    // Garante que o step 0 permanece visível (não avançou para step 1)
    await expect(page.locator(selectors.register.next)).toBeVisible();

    // Verifica o erro do campo específico que está vazio
    const errorSelectors: Record<string, string> = {
      firstName: selectors.register.errorFirstName,
      lastName: selectors.register.errorLastName,
      email: selectors.register.errorEmail,
      password: selectors.register.errorPassword,
    };
    await expect(page.locator(errorSelectors[missingField])).toBeVisible();
  });

  /**
   * TS06 - Email duplicado: o erro vem do servidor após o submit do step 1,
   *        exibido via toast de erro.
   */
  test('TS06 - rejeita email duplicado com dados aleatórios', async ({ page, setupDuplicateEmailMock, setupViacepMock }) => {
    const userData = generateUserData();
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const cpf = registerPage.generateValidCPF();

    await setupDuplicateEmailMock(page);
    await setupViacepMock(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    // ── Step 0 ────────────────────────────────────────────────────────────────
    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.cpf, cpf);
    await base.fill(selectors.register.email, REGISTER_VALIDATION.testData.duplicateEmail);
    await base.fill(selectors.register.phone, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(selectors.register.password, userData.password);
    await base.fill(selectors.register.confirmPassword, userData.password);

    await base.click(selectors.register.next);

    // ── Step 1 ────────────────────────────────────────────────────────────────
    await base.fill(selectors.register.addressZip, REGISTER_VALIDATION.testData.validZipCode);
    await expect(page.locator(selectors.register.addressStreet)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(selectors.register.addressNumber, REGISTER_VALIDATION.testData.addressNumber);

    await page.click(selectors.register.submit);

    // Erro exibido via toast
    await expect(page.locator('.Toastify__toast-body')).toContainText(REGISTER_VALIDATION.errorMessages.emailDuplicate, { timeout: 10_000 });
  });

  /**
   * TS07 - Todos os campos vazios: clicar em Next exibe todos os erros de validação do step 0
   */
  test('TS07 - valida todos os campos vazios com mensagens de validação individuais', async ({ page }) => {
    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    // Click "next" button with all fields empty
    await page.click(selectors.register.next);

    // Verify all validation error messages appear
    await expect(page.locator(selectors.register.errorFirstName)).toBeVisible();
    await expect(page.locator(selectors.register.errorFirstName)).toContainText(REGISTER_VALIDATION.errorMessages.firstNameRequired);

    await expect(page.locator(selectors.register.errorLastName)).toBeVisible();
    await expect(page.locator(selectors.register.errorLastName)).toContainText(REGISTER_VALIDATION.errorMessages.lastNameRequired);

    await expect(page.locator(selectors.register.errorCpf)).toBeVisible();
    await expect(page.locator(selectors.register.errorCpf)).toContainText(REGISTER_VALIDATION.errorMessages.cpfInvalid);

    await expect(page.locator(selectors.register.errorEmail)).toBeVisible();
    await expect(page.locator(selectors.register.errorEmail)).toContainText(REGISTER_VALIDATION.errorMessages.emailInvalid);

    await expect(page.locator(selectors.register.errorPhone)).toBeVisible();
    await expect(page.locator(selectors.register.errorPhone)).toContainText(REGISTER_VALIDATION.errorMessages.phoneInvalid);

    await expect(page.locator(selectors.register.errorPassword)).toBeVisible();
    await expect(page.locator(selectors.register.errorPassword)).toContainText(REGISTER_VALIDATION.errorMessages.passwordMinLength);
  });
});
