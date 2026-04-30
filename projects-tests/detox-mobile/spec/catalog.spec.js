const { device, expect, element, by } = require('detox');
const LoginPage = require('../src/pages/LoginPage');
const CatalogPage = require('../src/pages/CatalogPage');

describe('Catalog (Detox)', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('Header logo is displayed after skipping login', async () => {
    await LoginPage.tapSkip();
    await CatalogPage.expectHeader();
  });

  it('Empty cart shows zero badge', async () => {
    await LoginPage.tapSkip();
    await CatalogPage.assertCartBadgeNotExist();
  });
});
