import { test as base } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export const test = base.extend({});

test.afterEach(async ({ page }, testInfo) => {
  // Captura screenshot em caso de falha
  if (testInfo.status !== 'passed') {
    const screenshotsDir = path.join(testInfo.outputDir, 'screenshots');

    // Cria o diretório se não existir
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotsDir, `${testInfo.title}-${timestamp}.png`);

    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testInfo.attachments.push({
        name: 'screenshot',
        path: screenshotPath,
        contentType: 'image/png',
      });
    } catch (error) {
      console.error(`Erro ao capturar screenshot: ${error}`);
    }

    // Captura também o HTML da página
    const htmlPath = path.join(screenshotsDir, `${testInfo.title}-${timestamp}.html`);
    try {
      const pageContent = await page.content();
      fs.writeFileSync(htmlPath, pageContent, 'utf-8');
      testInfo.attachments.push({
        name: 'page-html',
        path: htmlPath,
        contentType: 'text/html',
      });
    } catch (error) {
      console.error(`Erro ao capturar HTML: ${error}`);
    }
  }
});

export { expect } from '@playwright/test';
