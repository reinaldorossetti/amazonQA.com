describe('Login flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('deve renderizar o formulário de login', async () => {
    await expect(element(by.id('login-email-input'))).toBeVisible();
    await expect(element(by.id('login-password-input'))).toBeVisible();
    await expect(element(by.id('login-submit-button'))).toBeVisible();
  });

  it('deve exibir mensagem de erro com credenciais inválidas', async () => {
    await element(by.id('login-email-input')).replaceText('invalid-login@example.com');
    await element(by.id('login-password-input')).replaceText('invalid-password');
    await element(by.id('login-submit-button')).tap();

    await waitFor(element(by.id('login-error-message')))
      .toBeVisible()
      .withTimeout(15000);
  });

  const hasValidCredentials = Boolean(process.env.E2E_LOGIN_EMAIL && process.env.E2E_LOGIN_PASSWORD);

  (hasValidCredentials ? it : it.skip)('deve autenticar com credenciais válidas', async () => {
    await element(by.id('login-email-input')).replaceText(process.env.E2E_LOGIN_EMAIL);
    await element(by.id('login-password-input')).replaceText(process.env.E2E_LOGIN_PASSWORD);
    await element(by.id('login-submit-button')).tap();

    await waitFor(element(by.text('Home')))
      .toBeVisible()
      .withTimeout(20000);
  });
});
