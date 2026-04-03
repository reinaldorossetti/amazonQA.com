import { expect } from '../../fixtures/ui.fixture';
import { test, REGISTER_VALIDATION } from '../../fixtures/register.fixture';
import { RegisterPage } from '../../pages/RegisterPage';
import { LoginPage } from '../../pages/LoginPage';
import { NavComponent } from '../../pages/NavComponent';
/* Removed import to helpers; Using local registerPage imported from pages/RegisterPage */
import { waitForPageLoad, PageBase } from '../../helpers/PageBase';

test.describe('Register', () => {
  
  /**
   * TS01 - Happy path: fills out both steps completely and verifies success via toast message
   */
  test('TS01 - Should successfully register a new user when providing all valid requirements', async ({ page, setupViacepMock }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const cpf = base.generateValidCPF();

    // ViaCEP mock to avoid depending on external network
    await setupViacepMock(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(registerPage.firstNameInput, userData.firstName);
    await base.fill(registerPage.lastNameInput, userData.lastName);
    await base.fill(registerPage.cpfInput, cpf);
    await base.fill(registerPage.emailInput, userData.email);
    await base.fill(registerPage.phoneInput, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(registerPage.passwordInput, userData.password);
    await base.fill(registerPage.confirmPasswordInput, userData.password);
    await base.click(registerPage.nextButton);
    await base.fill(registerPage.zipCodeInput, REGISTER_VALIDATION.testData.validZipCode);

    await expect(page.locator(registerPage.streetInput)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(registerPage.numberInput, REGISTER_VALIDATION.testData.addressNumber);
    await page.click(registerPage.submitButton);

    await expect(page.locator('body')).toContainText(/Cadastro realizado com sucesso!/i, { timeout: 10_000 });
  });

  /**
   * TS02 - Email em formato inválido: erro aparece no helper text do campo email no step 0
   */
  test('TS02 - rejeita email em formato inválido aleatório', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const invalidEmail = base.generateInvalidEmail();

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(registerPage.firstNameInput, userData.firstName);
    await base.fill(registerPage.lastNameInput, userData.lastName);
    await base.fill(registerPage.emailInput, invalidEmail);
    await base.fill(registerPage.passwordInput, userData.password);
    await base.fill(registerPage.confirmPasswordInput, userData.password);
    await base.click(registerPage.nextButton);

    await expect(page.locator(registerPage.errorEmail)).toContainText(REGISTER_VALIDATION.errorMessages.emailInvalid);
  });

  /**
   * TS03 - Senha curta (< 8 chars): falha na validação local do step 0
   */
  test('TS03 - rejeita senha curta no step 0', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const shortPassword = base.generateShortPassword();

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(registerPage.firstNameInput, userData.firstName);
    await base.fill(registerPage.lastNameInput, userData.lastName);
    await base.fill(registerPage.emailInput, userData.email);
    await base.fill(registerPage.passwordInput, shortPassword);
    await base.fill(registerPage.confirmPasswordInput, shortPassword);

    await base.click(registerPage.nextButton);

    await expect(page.locator(registerPage.errorPassword)).toContainText(REGISTER_VALIDATION.errorMessages.passwordMinLength);
  });

  /**
   * TS04 - Senhas não correspondem: erro aparece no helper text do campo confirmar senha
   */
  test('TS04 - rejeita senhas não-correspondentes com dados aleatórios', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const differentPassword = base.generateDifferentPassword();

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(registerPage.firstNameInput, userData.firstName);
    await base.fill(registerPage.lastNameInput, userData.lastName);
    await base.fill(registerPage.emailInput, userData.email);
    await base.fill(registerPage.passwordInput, userData.password);
    await base.fill(registerPage.confirmPasswordInput, differentPassword);
    await base.click(registerPage.nextButton);

    await expect(page.locator(registerPage.errorConfirmPassword)).toContainText(/As senhas não coincidem/i);
  });

  /**
   * TS05 - Missing required field: clicking Next should not advance to step 1
   *        and the empty field should display its specific validation error message.
   */
  test('TS05 - Should display specific validation errors and prevent step advancement when individual required fields are empty', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    
    // We can define the test scenarios mapping each field to its selectors
    const testCases = [
      {
        fieldToOmit: 'firstName',
        fillAction: async () => {
          await base.fill(registerPage.lastNameInput, userData.lastName);
          await base.fill(registerPage.emailInput, userData.email);
          await base.fill(registerPage.passwordInput, userData.password);
          await base.fill(registerPage.confirmPasswordInput, userData.password);
        },
        expectedErrorSelector: registerPage.errorFirstName
      },
      {
        fieldToOmit: 'lastName',
        fillAction: async () => {
          await base.fill(registerPage.firstNameInput, userData.firstName);
          await base.fill(registerPage.emailInput, userData.email);
          await base.fill(registerPage.passwordInput, userData.password);
          await base.fill(registerPage.confirmPasswordInput, userData.password);
        },
        expectedErrorSelector: registerPage.errorLastName
      },
      {
        fieldToOmit: 'email',
        fillAction: async () => {
          await base.fill(registerPage.firstNameInput, userData.firstName);
          await base.fill(registerPage.lastNameInput, userData.lastName);
          await base.fill(registerPage.passwordInput, userData.password);
          await base.fill(registerPage.confirmPasswordInput, userData.password);
        },
        expectedErrorSelector: registerPage.errorEmail
      },
      {
        fieldToOmit: 'password',
        fillAction: async () => {
          await base.fill(registerPage.firstNameInput, userData.firstName);
          await base.fill(registerPage.lastNameInput, userData.lastName);
          await base.fill(registerPage.emailInput, userData.email);
        },
        expectedErrorSelector: registerPage.errorPassword
      }
    ];

    // Pick one scenario randomly to test per execution 
    // (If you want to test ALL of them, we could loop over testCases instead of picking randomly)
    const scenario = testCases[Math.floor(Math.random() * testCases.length)];

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    // Fill all data EXCEPT the selected field
    await scenario.fillAction();
    
    await base.click(registerPage.nextButton);

    // Ensure step 0 is still visible (did not advance to step 1)
    await expect(page.locator(registerPage.nextButton)).toBeVisible();

    // Verify the specific empty field shows an error message
    await expect(page.locator(scenario.expectedErrorSelector)).toBeVisible();
  });

  /**
   * TS06 - Email duplicado: o erro vem do servidor após o submit do step 1,
   *        exibido via toast de erro.
   */
  test('TS06 - rejeita email duplicado com dados aleatórios', async ({ page, setupDuplicateEmailMock, setupViacepMock }) => {
    const registerPage = new RegisterPage(page);
    const base = new PageBase(page);
    const userData = base.generateUserData();
    const cpf = base.generateValidCPF();

    await setupDuplicateEmailMock(page);
    await setupViacepMock(page);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await base.fill(registerPage.firstNameInput, userData.firstName);
    await base.fill(registerPage.lastNameInput, userData.lastName);
    await base.fill(registerPage.cpfInput, cpf);
    await base.fill(registerPage.emailInput, REGISTER_VALIDATION.testData.duplicateEmail);
    await base.fill(registerPage.phoneInput, REGISTER_VALIDATION.testData.validPhone);
    await base.fill(registerPage.passwordInput, userData.password);
    await base.fill(registerPage.confirmPasswordInput, userData.password);

    await base.click(registerPage.nextButton);

    await base.fill(registerPage.zipCodeInput, REGISTER_VALIDATION.testData.validZipCode);
    await expect(page.locator(registerPage.streetInput)).not.toHaveValue('', { timeout: 10_000 });
    await base.fill(registerPage.numberInput, REGISTER_VALIDATION.testData.addressNumber);

    await page.click(registerPage.submitButton);

    // Erro exibido via toast
    await expect(page.locator('.Toastify__toast-body')).toContainText(REGISTER_VALIDATION.errorMessages.emailDuplicate, { timeout: 10_000 });
  });

  /**
   * TS07 - Todos os campos vazios: clicar em Next exibe todos os erros de validação do step 0
   */
  test('TS07 - valida todos os campos vazios com mensagens de validação individuais', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    // Click "next" button with all fields empty
    await page.click(registerPage.nextButton);

    // Verify all validation error messages appear
    await expect(page.locator(registerPage.errorFirstName)).toBeVisible();
    await expect(page.locator(registerPage.errorFirstName)).toContainText(REGISTER_VALIDATION.errorMessages.firstNameRequired);

    await expect(page.locator(registerPage.errorLastName)).toBeVisible();
    await expect(page.locator(registerPage.errorLastName)).toContainText(REGISTER_VALIDATION.errorMessages.lastNameRequired);

    await expect(page.locator(registerPage.errorCpf)).toBeVisible();
    await expect(page.locator(registerPage.errorCpf)).toContainText(REGISTER_VALIDATION.errorMessages.cpfInvalid);

    await expect(page.locator(registerPage.errorEmail)).toBeVisible();
    await expect(page.locator(registerPage.errorEmail)).toContainText(REGISTER_VALIDATION.errorMessages.emailInvalid);

    await expect(page.locator(registerPage.errorPhone)).toBeVisible();
    await expect(page.locator(registerPage.errorPhone)).toContainText(REGISTER_VALIDATION.errorMessages.phoneInvalid);

    await expect(page.locator(registerPage.errorPassword)).toBeVisible();
    await expect(page.locator(registerPage.errorPassword)).toContainText(REGISTER_VALIDATION.errorMessages.passwordMinLength);
  });
});
