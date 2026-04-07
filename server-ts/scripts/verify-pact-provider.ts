import process from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, type ChildProcess } from 'node:child_process';
import { config as dotenvConfig } from 'dotenv';
import { Verifier } from '@pact-foundation/pact';
import { query } from '../lib/db';
import { signAccessToken } from '../lib/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(serverDir, '..');
const pactsDir = path.resolve(rootDir, 'pacts');

dotenvConfig({ path: path.resolve(rootDir, '.env') });
dotenvConfig({ path: path.resolve(serverDir, '.env.local') });
dotenvConfig({ path: path.resolve(serverDir, '.env'), override: false });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'pact-test-secret-1234567890';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.JWT_ISSUER = process.env.JWT_ISSUER || 'tester.com';
process.env.JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'tester.com-web';

const providerBaseUrl = process.env.PACT_PROVIDER_BASE_URL || 'http://127.0.0.1:3001';

let cartAuthToken = '';
let providerProcess: ChildProcess | undefined;

function npmCommand(): string {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForProvider(url: string, timeoutMs = 90_000): Promise<true> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/products`);
      if (response.ok) {
        return true;
      }
    } catch {
      // provider not ready yet
    }

    await sleep(1_000);
  }

  throw new Error(`Provider did not become available at ${url} within ${timeoutMs}ms`);
}

async function ensureProduct(productId: number, name: string): Promise<void> {
  await query(
    `INSERT INTO products (id, name, price, category, image)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [productId, name, 99.9, 'Eletrônicos', 'https://example.com/pact.png']
  );
}

async function ensureUser(userId: number, email: string): Promise<void> {
  await query(
    `INSERT INTO users (id, person_type, first_name, last_name, email, password, is_active)
     VALUES ($1, 'PF', 'Pact', 'User', $2, $3, true)
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       is_active = true,
       account_closed_at = NULL`,
    [userId, email, 'pact-provider-password']
  );
}

async function setupCatalogState(): Promise<void> {
  await ensureProduct(1, 'Produto Pact 1');
  await ensureProduct(2, 'Produto Pact 2');
}

async function setupCartWithItemsState(): Promise<void> {
  const userId = 9001;
  await setupCatalogState();
  await ensureUser(userId, 'pact-cart-list@example.com');

  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
  await query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3), ($1, $4, $5)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = EXCLUDED.quantity`,
    [userId, 1, 2, 2, 1]
  );

  cartAuthToken = signAccessToken({ id: userId, email: 'pact-cart-list@example.com', person_type: 'PF' }).accessToken;
}

async function setupCartAddState(): Promise<void> {
  const userId = 9002;
  await setupCatalogState();
  await ensureUser(userId, 'pact-cart-add@example.com');

  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

  cartAuthToken = signAccessToken({ id: userId, email: 'pact-cart-add@example.com', person_type: 'PF' }).accessToken;
}

async function startProviderIfNeeded(): Promise<void> {
  try {
    await waitForProvider(providerBaseUrl, 3_000);
    console.log(`[PACT/server-ts] Provider was already available at ${providerBaseUrl}`);
    return;
  } catch {
    // start locally
  }

  providerProcess = spawn(npmCommand(), ['run', 'dev'], {
    cwd: serverDir,
    env: { ...process.env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  await waitForProvider(providerBaseUrl);
}

async function stopProviderIfStarted(): Promise<void> {
  if (!providerProcess) {
    return;
  }

  providerProcess.kill('SIGTERM');
  await sleep(1_000);
}

type PactLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

async function verifyProvider(): Promise<string> {
  await startProviderIfNeeded();

  const verifierOptions = {
    provider: 'tester-backend-api',
    providerBaseUrl,
    pactFilesOrDirs: [pactsDir],
    providerVersion: process.env.PACT_PROVIDER_VERSION || process.env.GIT_COMMIT || 'local-dev-server-ts',
    providerVersionBranch: process.env.PACT_PROVIDER_BRANCH || process.env.GIT_BRANCH || 'main',
    stateHandlers: {
      'catálogo com produtos disponíveis': async () => {
        await setupCatalogState();
      },
      'usuário autenticado com itens no carrinho': async () => {
        await setupCartWithItemsState();
      },
      'usuário autenticado apto para adicionar itens no carrinho': async () => {
        await setupCartAddState();
      },
    },
    requestFilter: (req: { path?: string; headers: Record<string, string> }, _res: unknown, next: () => void) => {
      if (req.path?.startsWith('/api/cart')) {
        req.headers.authorization = `Bearer ${cartAuthToken}`;
      }

      next();
    },
    publishVerificationResult: false,
    logLevel: (process.env.PACT_LOG_LEVEL || 'info') as PactLogLevel,
  };

  const brokerUrl = process.env.PACT_BROKER_BASE_URL;
  const providerVersion = process.env.PACT_PROVIDER_VERSION;

  if (brokerUrl && providerVersion) {
    const brokerOptions = verifierOptions as Record<string, unknown>;
    brokerOptions.pactBroker = brokerUrl;
    brokerOptions.enablePending = true;

    if (process.env.PACT_BROKER_TOKEN) {
      brokerOptions.pactBrokerToken = process.env.PACT_BROKER_TOKEN;
    }

    brokerOptions.providerVersion = providerVersion;
    brokerOptions.publishVerificationResult = true;
  }

  return new Verifier(verifierOptions as import('@pact-foundation/pact').VerifierOptions).verifyProvider();
}

verifyProvider()
  .then(() => {
    console.log('[PACT/server-ts] Provider verification completed successfully.');
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[PACT/server-ts] Provider verification failed:', message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await stopProviderIfStarted();
  });
