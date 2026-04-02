import axios from 'axios';
import fs from 'fs';
import path from 'path';

function readBaseUrlFromEnvFile(): string | undefined {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return undefined;
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const match = content.match(/^EXPO_PUBLIC_API_BASE_URL\s*=\s*(.+)$/m);
  if (!match) {
    return undefined;
  }

  const rawValue = match[1]?.trim();
  if (!rawValue) {
    return undefined;
  }

  return rawValue.replace(/^['\"]|['\"]$/g, '');
}

function resolveBaseUrl(): string | undefined {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? readBaseUrlFromEnvFile();
}

describe('backend connectivity', () => {
  it('connects to backend and receives an HTTP response from /products', async () => {
    const baseUrl = resolveBaseUrl();

    expect(baseUrl).toBeTruthy();

    const endpoint = new URL('/products', baseUrl).toString();

    try {
      const response = await axios.get(endpoint, {
        timeout: 10000,
        validateStatus: () => true,
      });

      expect(response.status).toBeGreaterThanOrEqual(100);
      expect(response.status).toBeLessThan(600);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Falha de comunicação com o backend em ${endpoint}. ` +
          `Código: ${error.code ?? 'N/A'}. Mensagem: ${error.message}`
        );
      }

      throw error;
    }
  });
});
