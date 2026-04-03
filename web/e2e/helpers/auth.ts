import type { Page } from '@playwright/test';

type AuthUser = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  personType: 'PF' | 'PJ';
  isAdmin?: boolean;
  roles?: string[];
};

export async function setAuthenticatedUser(page: Page, user: AuthUser) {
  await page.addInitScript((payload) => {
    localStorage.setItem('auth_user', JSON.stringify(payload));
    localStorage.setItem('auth_token', 'e2e.mock.token');
  }, user);
}

export async function setAuthenticatedSession(page: Page, user: AuthUser, accessToken: string) {
  await page.addInitScript(
    ({ payload, token }) => {
      localStorage.setItem('auth_user', JSON.stringify(payload));
      localStorage.setItem('auth_token', token);
    },
    { payload: user, token: accessToken }
  );
}
