import type { Page } from '@playwright/test';

type AuthUser = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  personType: 'PF' | 'PJ';
};

export async function setAuthenticatedUser(page: Page, user: AuthUser) {
  await page.addInitScript((payload) => {
    localStorage.setItem('auth_user', JSON.stringify(payload));
  }, user);
}
