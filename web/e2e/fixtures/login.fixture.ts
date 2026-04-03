import { expect, test as base, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * Constants for Login validation tests
 */
export const LOGIN_VALIDATION = {
  errorMessages: {
    invalidCredentials: /Credenciais inválidas/i,
    emptyFields: /Preencha e-mail e senha/i,
  },
  testData: {
    validEmail: 'usuario@teste.com',
    validPassword: 'Senha@123',
    wrongPassword: 'SenhaErrada@999',
    invalidEmail: 'nao-eh-um-email',
  },
  apiEndpoints: {
    login: '**/api/users/login',
  },
  httpStatus: {
    ok: 200,
    unauthorized: 401,
  },
} as const;

/**
 * Mock user returned on successful login
 */
export const mockLoggedUser = (firstName: string, email: string) => ({
  id: faker.number.int({ min: 1, max: 9999 }),
  first_name: firstName,
  last_name: faker.person.lastName(),
  email,
  person_type: 'PF',
});

export const mockLoginResponse = (firstName: string, email: string) => ({
  accessToken: `mock-token-${faker.string.alphanumeric(12)}`,
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: mockLoggedUser(firstName, email),
});

type LoginFixtures = {
  setupLoginSuccessMock: (page: Page, email?: string, firstName?: string) => Promise<void>;
  setupLoginFailureMock: (page: Page) => Promise<void>;
};

export const test = base.extend<LoginFixtures>({
  /**
   * Intercepts POST /api/users/login and always responds with a successful user object.
   */
  setupLoginSuccessMock: async ({}, use) => {
    const setupMock = async (page: Page, email?: string, firstName?: string) => {
      await page.route(LOGIN_VALIDATION.apiEndpoints.login, async (route) => {
        await route.fulfill({
          status: LOGIN_VALIDATION.httpStatus.ok,
          contentType: 'application/json',
          body: JSON.stringify(mockLoginResponse(
            firstName ?? faker.person.firstName(),
            email ?? LOGIN_VALIDATION.testData.validEmail,
          )),
        });
      });
    };

    await use(setupMock);
  },

  /**
   * Intercepts POST /api/users/login and always responds with 401 Unauthorized.
   */
  setupLoginFailureMock: async ({}, use) => {
    const setupMock = async (page: Page) => {
      await page.route(LOGIN_VALIDATION.apiEndpoints.login, async (route) => {
        await route.fulfill({
          status: LOGIN_VALIDATION.httpStatus.unauthorized,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Credenciais inválidas.' }),
        });
      });
    };

    await use(setupMock);
  },
});

export { expect };
