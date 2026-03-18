import { faker } from '@faker-js/faker';
import { mockProducts } from '../../data/products.mock';
import { selectors } from '../../helpers/selectors';
import { expect, test } from '../../fixtures/ui.fixture';
import { RegisterPage } from '../../helpers/RegisterPage';

test.describe('Register and Language', () => {
  test('TS01 registro PF completo com sucesso', async ({ page, waitForPageLoad }) => {
    const registerPage = new RegisterPage(page);
    const userData = await registerPage.fillRegistrationForm();

    await page.route('https://viacep.com.br/ws/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          logradouro: 'Rua Teste',
          bairro: 'Centro',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      });
    });

    await page.route('**/api/users/register', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1001, first_name: userData.firstName, email: userData.email }),
      });
    });

    await registerPage.goToRegister();
    await waitForPageLoad(page, 'register');

    await registerPage.fillPersonalData(userData);
    await registerPage.clickNext();

    await registerPage.fillAddress();
    await registerPage.clickSubmit();

    // Validar mensagem de sucesso
    await registerPage.waitForSuccessMessage();
    await expect(page).toHaveURL('/', { timeout: 8_000 });
  });

  test('TS03 validação de campos obrigatórios no registro', async ({ page, waitForPageLoad }) => {
    await page.goto('/register');
    await waitForPageLoad(page, 'register');

    await page.click(selectors.register.next);
    await expect(page.locator('body')).toHaveText(/Nome é obrigatório./i);
  });

  test('TS01/TS02 idioma alterna e persiste após reload', async ({ page, waitForPageLoad }) => {
    await page.route('**/api/products**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProducts),
      });
    });

    await page.goto('/');
    await waitForPageLoad(page, 'catalog');

    await expect(page.getByRole('heading', { name: 'Catálogo de Produtos' })).toBeVisible();

    await page.locator(selectors.nav.languageToggle).click();
    await expect(page.getByRole('heading', { name: 'Product Catalog' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Product Catalog' })).toBeVisible();
  });
});
