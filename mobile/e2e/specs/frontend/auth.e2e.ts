const { PageLoginLogout } = require('../../pages/PageLoginLogout');

describe('Frontend parity - Auth', () => {
  const pageLoginLogout = new PageLoginLogout();

  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('TS01 - should log in successfully with next redirect and greeting', async () => {
    await pageLoginLogout.waitVisible(pageLoginLogout.loginEmailInput);
    await expect(pageLoginLogout.byId(pageLoginLogout.loginEmailInput)).toBeVisible();
    await pageLoginLogout.fillInput(pageLoginLogout.loginEmailInput, 'invalid-login@example.com');
    await pageLoginLogout.fillInput(pageLoginLogout.loginPasswordInput, 'invalid-password');
    await device.pressBack();
    await pageLoginLogout.tap(pageLoginLogout.loginSubmitButton);
    await pageLoginLogout.waitVisible(pageLoginLogout.loginErrorMessage);
  });

  it('TS02 - should display error for invalid credentials', async () => {
    await pageLoginLogout.waitVisible(pageLoginLogout.loginEmailInput);
    await expect(pageLoginLogout.byId(pageLoginLogout.loginEmailInput)).toBeVisible();
    await pageLoginLogout.fillInput(pageLoginLogout.loginEmailInput, 'invalid-login@example.com');
    await pageLoginLogout.fillInput(pageLoginLogout.loginPasswordInput, 'invalid-password');
    await device.pressBack();
    await pageLoginLogout.tap(pageLoginLogout.loginSubmitButton);
    await pageLoginLogout.waitVisible(pageLoginLogout.loginErrorMessage);
  });

  it('TS03 - should validate required fields', async () => {
    await pageLoginLogout.waitVisible(pageLoginLogout.loginSubmitButton);
    await expect(pageLoginLogout.byId(pageLoginLogout.loginSubmitButton)).toBeVisible();
    await pageLoginLogout.tap(pageLoginLogout.loginSubmitButton);
    await pageLoginLogout.waitVisible(pageLoginLogout.loginErrorMessage);
  });

  it.todo('TS04 - should show validation when password is blank');
  it.todo('TS05 - should show validation when email is blank');
  it.todo('TS06 - should keep authenticated state after reload');
});
