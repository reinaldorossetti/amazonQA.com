import { expect } from '../../fixtures/ui.fixture';
import { test, REGISTER_VALIDATION } from '../../fixtures/register.fixture';
import { selectors } from '../../fixtures/selectors/selectors';
import { RegisterPage } from '../../helpers/RegisterPage';
import { waitForPageLoad, PageBase } from '../../helpers/PageBase';

test.describe('Register', () => {

  /**
   * TS01 - Happy path: fills out both steps completely and verifies success via toast message
   */
  test('TS01 - Should successfully register a new user when providing all valid requirements', async ({ page, setupViacepMock }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const cpf = registerPage.generateValidCPF();

    // ViaCEP mock to avoid depending on external network
    await setupViacepMock(page);

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
    await base.fill(selectors.register.addressZip, REGISTER_VALIDATION.testData.validZipCode);
    
    await expect(page.locator(selectors.register.addressStreet)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(selectors.register.addressNumber, REGISTER_VALIDATION.testData.addressNumber);
    await page.click(selectors.register.submit);

    await expect(page.locator('body')).toContainText(/Cadastro realizado com sucesso!/i, { timeout: 10_000 });
  });

  /**
   * TS02 - Email em formato inválido: erro aparece no helper text do campo email no step 0
   */
  test('TS02 - rejeita email em formato inválido aleatório', async ({ page }) => {
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const invalidEmail = base.generateInvalidEmail();

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
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const shortPassword = base.generateShortPassword();

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
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const differentPassword = base.generateDifferentPassword();

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
   * TS05 - Missing required field: clicking Next should not advance to step 1
   *        and the empty field should display its specific validation error message.
   */
  test('TS05 - Should display specific validation errors and prevent step advancement when individual required fields are empty', async ({ page }) => {
    const base = new PageBase(page);
    const userData = base.generateUserData();
    
    // We can define the test scenarios mapping each field to its selectors
    const testCases = [
      {
        fieldToOmit: 'firstName',
        fillAction: async () => {
          await base.fill(selectors.register.lastName, userData.lastName);
          await base.fill(selectors.register.email, userData.email);
          await base.fill(selectors.register.password, userData.password);
          await base.fill(selectors.register.confirmPassword, userData.password);
        },
        expectedErrorSelector: selectors.register.errorFirstName
      },
      {
        fieldToOmit: 'lastName',
        fillAction: async () => {
          await base.fill(selectors.register.firstName, userData.firstName);
          await base.fill(selectors.register.email, userData.email);
          await base.fill(selectors.register.password, userData.password);
          await base.fill(selectors.register.confirmPassword, userData.password);
        },
        expectedErrorSelector: selectors.register.errorLastName
      },
      {
        fieldToOmit: 'email',
        fillAction: async () => {
          await base.fill(selectors.register.firstName, userData.firstName);
          await base.fill(selectors.register.lastName, userData.lastName);
          await base.fill(selectors.register.password, userData.password);
          await base.fill(selectors.register.confirmPassword, userData.password);
        },
        expectedErrorSelector: selectors.register.errorEmail
      },
      {
        fieldToOmit: 'password',
        fillAction: async () => {
          await base.fill(selectors.register.firstName, userData.firstName);
          await base.fill(selectors.register.lastName, userData.lastName);
          await base.fill(selectors.register.email, userData.email);
        },
        expectedErrorSelector: selectors.register.errorPassword
      }
    ];

    // Pick one scenario randomly to test per execution 
    // (If you want to test ALL of them, we could loop over testCases instead of picking randomly)
    const scenario = testCases[Math.floor(Math.random() * testCases.length)];

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    // Fill all data EXCEPT the selected field
    await scenario.fillAction();
    
    await base.click(selectors.register.next);

    // Ensure step 0 is still visible (did not advance to step 1)
    await expect(page.locator(selectors.register.next)).toBeVisible();

    // Verify the specific empty field shows an error message
    await expect(page.locator(scenario.expectedErrorSelector)).toBeVisible();
  });

  /**
   * TS06 - Email duplicado: o erro vem do servidor após o submit do step 1,
   *        exibido via toast de erro.
   */
  test('TS06 - rejeita email duplicado com dados aleatórios', async ({ page, setupDuplicateEmailMock, setupViacepMock }) => {
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const registerPage = new RegisterPage(page);
    const cpf = registerPage.generateValidCPF();

    await setupDuplicateEmailMock(page);
    await setupViacepMock(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(selectors.register.firstName, userData.firstName);
    await base.fill(selectors.register.lastName, userData.lastName);
    await base.fill(selectors.register.cpf, cpf);
    await base.fill(selectors.register.email, REGISTER_VALIDATION.testData.duplicateEmail);
    await base.fill(selectors.register.phone, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(selectors.register.password, userData.password);
    await base.fill(selectors.register.confirmPassword, userData.password);

    await base.click(selectors.register.next);

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
