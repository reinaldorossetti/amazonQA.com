const { TIMEOUTS, hasValidCredentials, getLoginCredentials } = require('./pages/global.page');

describe('Login flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('deve renderizar o formulário de login', async () => {
    await expect(element(by.id('login-email-input'))).toBeVisible();
    await expect(element(by.id('login-password-input'))).toBeVisible();
    await expect(element(by.id('login-submit-button'))).toBeVisible();
  });

  it('deve exibir mensagem de erro com credenciais inválidas', async () => {
    await element(by.id('login-email-input')).clearText(''); // Clear first
    await element(by.id('login-email-input')).typeText('invalid-login@example.com\n');
    await element(by.id('login-password-input')).clearText('');
    await element(by.id('login-password-input')).typeText('invalid-password\n');
    await device.pressBack(); // close keyboard explicitly
    await element(by.id('login-submit-button')).tap();

    await waitFor(element(by.id('login-error-message')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.default);
  });

  const credentials = getLoginCredentials();
  const hasValidCredentialsFlag = hasValidCredentials as unknown as boolean;

  (hasValidCredentialsFlag ? it : it.skip)('deve autenticar com credenciais válidas', async () => {
    await waitFor(element(by.id('login-email-input'))).toBeVisible().withTimeout(TIMEOUTS.short);
    await element(by.id('login-email-input')).clearText('');
    await element(by.id('login-email-input')).typeText(credentials.email + '\n');
    await element(by.id('login-password-input')).clearText('');
    await element(by.id('login-password-input')).typeText(credentials.password + '\n');
    await device.pressBack(); // close keyboard explicitly
    await element(by.id('login-submit-button')).tap();

    await waitFor(element(by.text('Home')))
      .toBeVisible()
      .withTimeout(TIMEOUTS.long);
  });
});
