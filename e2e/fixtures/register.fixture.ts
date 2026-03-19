import { expect, test as base, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * Constants for Register validation tests
 */
export const REGISTER_VALIDATION = {
  regex: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  },
  errorMessages: {
    firstNameRequired: /Nome é obrigatório./i,
    lastNameRequired: /Sobrenome é obrigatório./i,
    cpfInvalid: /CPF inválido./i,
    emailInvalid: /Email inválido./i,
    phoneInvalid: /Telefone inválido./i,
    passwordMinLength: /Mínimo 8 caracteres./i,
    passwordWeak: /Senha fraca/i,
    passwordMismatch: /senhas não correspondem/i,
    emailDuplicate: /Email já cadastrado/i,
  },
  testData: {
    validPhone: '(11) 91234-5678',
    duplicateEmail: 'duplicate@example.com',
    validZipCode: '01001-000',
    addressNumber: '999',
    addressDetails: {
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    },
  },
  apiEndpoints: {
    register: '**/api/users/register',
    viacep: '**/viacep.com.br/**',
  },
  httpStatus: {
    success: 201,
    badRequest: 400,
    conflict: 409,
    ok: 200,
  },
} as const;

/**
 * Fixture for setting up mock endpoints
 */
type RegisterFixtures = {
  setupRegisterMocks: (page: Page) => Promise<void>;
  setupViacepMock: (page: Page) => Promise<void>;
  setupDuplicateEmailMock: (page: Page) => Promise<void>;
};

export const test = base.extend<RegisterFixtures>({
  setupRegisterMocks: async ({}, use) => {
    const setupMocks = async (page: Page) => {
      await page.route(REGISTER_VALIDATION.apiEndpoints.register, async (route) => {
        const payload = route.request().postDataJSON();

        // Validate email format
        if (!REGISTER_VALIDATION.regex.email.test(payload.email)) {
          await route.fulfill({
            status: REGISTER_VALIDATION.httpStatus.badRequest,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Email inválido' }),
          });
          return;
        }

        // Validate password strength (min 8 chars, at least one uppercase, one lowercase, one number)
        if (!REGISTER_VALIDATION.regex.password.test(payload.password)) {
          await route.fulfill({
            status: REGISTER_VALIDATION.httpStatus.badRequest,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Senha fraca' }),
          });
          return;
        }

        // Success response
        await route.fulfill({
          status: REGISTER_VALIDATION.httpStatus.success,
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
    };

    await use(setupMocks);
  },

  setupViacepMock: async ({}, use) => {
    const setupMock = async (page: Page) => {
      await page.route(REGISTER_VALIDATION.apiEndpoints.viacep, async (route) => {
        await route.fulfill({
          status: REGISTER_VALIDATION.httpStatus.ok,
          contentType: 'application/json',
          body: JSON.stringify(REGISTER_VALIDATION.testData.addressDetails),
        });
      });
    };

    await use(setupMock);
  },

  setupDuplicateEmailMock: async ({}, use) => {
    const setupMock = async (page: Page) => {
      await page.route(REGISTER_VALIDATION.apiEndpoints.register, async (route) => {
        const payload = route.request().postDataJSON();

        if (payload.email === REGISTER_VALIDATION.testData.duplicateEmail) {
          await route.fulfill({
            status: REGISTER_VALIDATION.httpStatus.conflict,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Email já cadastrado' }),
          });
          return;
        }

        await route.fulfill({
          status: REGISTER_VALIDATION.httpStatus.success,
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
    };

    await use(setupMock);
  },
});

export { expect };
