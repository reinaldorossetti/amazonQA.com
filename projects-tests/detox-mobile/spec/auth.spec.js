const { device, expect, element, by } = require('detox');
const LoginPage = require('../src/pages/LoginPage');
const RegisterPage = require('../src/pages/RegisterPage');

describe('Auth flows (Detox)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('Login screen elements are displayed', async () => {
    await expect(element(by.text('E-mail ou Telefone'))).toBeVisible();
    await expect(element(by.text('Senha'))).toBeVisible();
    await expect(element(by.text('Continuar'))).toBeVisible();
    await expect(element(by.text('Entrar como visitante'))).toBeVisible();
    await expect(element(by.text('Não tem conta? Comece aqui.'))).toBeVisible();
    await expect(element(by.text('Autor: Reinaldo M R Junior'))).toBeVisible();
  });

  it('Navigate to register screen', async () => {
    await LoginPage.tapRegister();
    await RegisterPage.expectRegisterScreen();
  });
});
