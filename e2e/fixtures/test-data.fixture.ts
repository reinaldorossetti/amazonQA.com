import { expect, test as base } from '@playwright/test';

export type TestIdentity = {
  workerTag: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cpf: string;
};

export const test = base.extend<{ testIdentity: TestIdentity }>({
  testIdentity: async ({}, use, testInfo) => {
    const now = Date.now();
    const workerTag = `w${testInfo.workerIndex}`;

    await use({
      workerTag,
      firstName: `Playwright${workerTag}`,
      lastName: `User${now}`,
      email: `playwright.${workerTag}.${now}@example.com`,
      password: 'Senha@1234',
      cpf: '529.982.247-25',
    });
  },
});

export { expect };
