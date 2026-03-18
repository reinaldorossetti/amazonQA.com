import { faker } from '@faker-js/faker';
import { expect, test } from '../../fixtures/ui.fixture';
import { selectors } from '../../helpers/selectors';

test.describe('Register', () => {
  // Generate random user data for each test
  const generateUserData = () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Aa1@',
  });

  test.beforeEach(async ({ page }) => {
    // Mock register endpoint
    await page.route('**/api/users/register', async (route) => {
      const payload = route.request().postDataJSON();

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Email inválido' }),
        });
        return;
      }

      // Validate password strength (min 8 chars, at least one uppercase, one lowercase, one number)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(payload.password)) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Senha fraca' }),
        });
        return;
      }

      // Success response
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: faker.number.int({ min: 100, max: 9999 }),
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          person_type: 'PF',
        }),
      });
    });
  });

  test('TS01 - registro com dados válidos aleatórios', async ({ page, waitForPageLoad }) => {
    const userData = generateUserData();

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await page.fill(selectors.register.firstName, userData.firstName);
    await page.fill(selectors.register.lastName, userData.lastName);
    await page.fill(selectors.register.email, userData.email);
    await page.fill(selectors.register.password, userData.password);
    await page.fill(selectors.register.confirmPassword, userData.password);

    await page.click(selectors.register.submit);

    await expect(page).toHaveURL('/');
    await expect(page.locator(selectors.nav.userGreeting)).toContainText(userData.firstName);
  });

  test('TS02 - rejeita email em formato inválido aleatório', async ({ page, waitForPageLoad }) => {
    const userData = generateUserData();
    const invalidEmail = faker.lorem.word() + faker.lorem.word();

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await page.fill(selectors.register.firstName, userData.firstName);
    await page.fill(selectors.register.lastName, userData.lastName);
    await page.fill(selectors.register.email, invalidEmail);
    await page.fill(selectors.register.password, userData.password);
    await page.fill(selectors.register.confirmPassword, userData.password);

    await page.click(selectors.register.submit);

    await expect(page.locator(selectors.register.error)).toContainText(/Email inválido/i);
  });

  test('TS03 - rejeita senha fraca aleatória', async ({ page, waitForPageLoad }) => {
    const userData = generateUserData();
    const weakPassword = faker.number.int().toString();

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await page.fill(selectors.register.firstName, userData.firstName);
    await page.fill(selectors.register.lastName, userData.lastName);
    await page.fill(selectors.register.email, userData.email);
    await page.fill(selectors.register.password, weakPassword);
    await page.fill(selectors.register.confirmPassword, weakPassword);

    await page.click(selectors.register.submit);

    await expect(page.locator(selectors.register.error)).toContainText(/Senha fraca/i);
  });

  test('TS04 - rejeita senhas não-correspondentes com dados aleatórios', async ({ page, waitForPageLoad }) => {
    const userData = generateUserData();
    const differentPassword = faker.internet.password({ length: 12, memorable: false, pattern: /[A-Za-z0-9@]/ }) + 'Bb2@';

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await page.fill(selectors.register.firstName, userData.firstName);
    await page.fill(selectors.register.lastName, userData.lastName);
    await page.fill(selectors.register.email, userData.email);
    await page.fill(selectors.register.password, userData.password);
    await page.fill(selectors.register.confirmPassword, differentPassword);

    await page.click(selectors.register.submit);

    await expect(page.locator(selectors.register.error)).toContainText(/senhas não correspondem/i);
  });

  test('TS05 - valida campos obrigatórios aleatoriamente vazios', async ({ page, waitForPageLoad }) => {
    const missingField = faker.helpers.arrayElement(['firstName', 'lastName', 'email', 'password', 'confirmPassword']);

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    if (missingField !== 'firstName') await page.fill(selectors.register.firstName, faker.person.firstName());
    if (missingField !== 'lastName') await page.fill(selectors.register.lastName, faker.person.lastName());
    if (missingField !== 'email') await page.fill(selectors.register.email, faker.internet.email());
    if (missingField !== 'password') await page.fill(selectors.register.password, faker.internet.password() + 'Aa1@');
    if (missingField !== 'confirmPassword') await page.fill(selectors.register.confirmPassword, faker.internet.password() + 'Aa1@');

    await page.click(selectors.register.submit);

    await expect(page.locator(selectors.register.error)).toContainText(/Preencha todos os campos/i);
  });

  test('TS06 - rejeita email duplicado com dados aleatórios', async ({ page, waitForPageLoad }) => {
    const userData = generateUserData();
    const duplicateEmail = 'duplicate@example.com';

    // Mock register to treat specific email as duplicate
    await page.route('**/api/users/register', async (route) => {
      const payload = route.request().postDataJSON();

      if (payload.email === duplicateEmail) {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Email já cadastrado' }),
        });
        return;
      }

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: faker.number.int({ min: 100, max: 9999 }),
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          person_type: 'PF',
        }),
      });
    });

    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await page.fill(selectors.register.firstName, userData.firstName);
    await page.fill(selectors.register.lastName, userData.lastName);
    await page.fill(selectors.register.email, duplicateEmail);
    await page.fill(selectors.register.password, userData.password);
    await page.fill(selectors.register.confirmPassword, userData.password);

    await page.click(selectors.register.submit);

    await expect(page.locator(selectors.register.error)).toContainText(/Email já cadastrado/i);
  });
});
