import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type AdminLoginResponse = {
  accessToken: string;
  user?: {
    isAdmin?: boolean;
    roles?: string[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type AdminCredentials = {
  email: string;
  password: string;
  source: string;
};

const CREDENTIAL_PAIRS: Array<{ emailKey: string; passwordKey: string }> = [
  { emailKey: 'E2E_ADMIN_EMAIL', passwordKey: 'E2E_ADMIN_PASSWORD' },
  { emailKey: 'SEED_ADMIN_EMAIL', passwordKey: 'SEED_ADMIN_PASSWORD' },
  { emailKey: 'ADMIN_EMAIL', passwordKey: 'ADMIN_PASSWORD' },
];

function getServerDir(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  return path.resolve(currentDir, '../../../server');
}

function parseDotEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  const content = readFileSync(filePath, 'utf8');
  const parsed: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalIndex = line.indexOf('=');
    if (equalIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();
    const value = line.slice(equalIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) {
      parsed[key] = value;
    }
  }

  return parsed;
}

function loadServerEnvVariables(): Record<string, string> {
  const serverDir = getServerDir();
  const candidates = ['.env', '.env.local', '.env.test', '.env.ci'];
  const merged: Record<string, string> = {};

  for (const fileName of candidates) {
    const filePath = path.resolve(serverDir, fileName);
    Object.assign(merged, parseDotEnvFile(filePath));
  }

  return merged;
}

function getFirstDefined(env: Record<string, string | undefined>, keys: string[]): string {
  for (const key of keys) {
    const value = env[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function buildCredentialCandidates(): AdminCredentials[] {
  const serverEnv = loadServerEnvVariables();
  const mergedEnv: Record<string, string | undefined> = {
    ...serverEnv,
    ...(process.env as Record<string, string | undefined>),
  };

  const rawCandidates = [
    ...CREDENTIAL_PAIRS.map((pair) => ({
      email: mergedEnv[pair.emailKey],
      password: mergedEnv[pair.passwordKey],
      source: `${pair.emailKey}/${pair.passwordKey}`,
    })),
    {
      email: 'admin@tester.com',
      password: 'Admin@123',
      source: 'legacy-hardcoded-default',
    },
    {
      email: 'admin.teste@tester.com',
      password: 'Admin@123',
      source: 'ensure-admin-user-default',
    },
    {
      email: 'reiload@gmail.com',
      password: 'rei2026@QA',
      source: 'seed-default',
    },
  ];

  const unique = new Set<string>();
  const normalized: AdminCredentials[] = [];

  for (const candidate of rawCandidates) {
    const email = String(candidate.email ?? '').trim().toLowerCase();
    const password = String(candidate.password ?? '').trim();

    if (!email || !password) {
      continue;
    }

    const key = `${email}|${password}`;
    if (unique.has(key)) {
      continue;
    }

    unique.add(key);
    normalized.push({ email, password, source: candidate.source });
  }

  return normalized;
}

async function tryLoginCandidates(request: any, loginUrl: string, candidates: AdminCredentials[]) {
  const attempts: string[] = [];

  for (const candidate of candidates) {
    try {
      const response = await request.post(loginUrl, {
        data: {
          email: candidate.email,
          password: candidate.password,
        },
      });

      if (response.status() !== 200) {
        attempts.push(`${candidate.email} [${candidate.source}] -> HTTP ${response.status()}`);
        continue;
      }

      const payload = await response.json();
      const isAdmin = Boolean(payload?.user?.isAdmin)
        || (Array.isArray(payload?.user?.roles) && payload.user.roles.includes('admin'));

      if (!payload?.accessToken || !isAdmin) {
        attempts.push(`${candidate.email} [${candidate.source}] -> missing token/admin flag`);
        continue;
      }

      return {
        payload: payload as AdminLoginResponse,
        attempts,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown request error';
      attempts.push(`${candidate.email} [${candidate.source}] -> ${message}`);
    }
  }

  return {
    payload: null,
    attempts,
  };
}

function runEnsureAdminUser(email: string, password: string): { ran: boolean; message: string } {
  const serverDir = getServerDir();
  const scriptPath = path.resolve(serverDir, 'scripts/ensure-admin-user.js');

  if (!existsSync(scriptPath)) {
    return {
      ran: false,
      message: `script not found at ${scriptPath}`,
    };
  }

  try {
    const output = execFileSync(process.execPath, [scriptPath], {
      cwd: serverDir,
      env: {
        ...process.env,
        SEED_ADMIN_EMAIL: email,
        SEED_ADMIN_PASSWORD: password,
        ADMIN_BOOTSTRAP_PASSWORD: password,
      },
      stdio: 'pipe',
      encoding: 'utf8',
    });

    const sanitizedOutput = String(output ?? '').replace(/\s+/g, ' ').trim();
    return {
      ran: true,
      message: sanitizedOutput || 'ensure-admin-user executed successfully',
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error while running ensure-admin-user';
    return {
      ran: true,
      message,
    };
  }
}

export async function loginAsAdminWithFallback(request: any, loginUrl: string): Promise<AdminLoginResponse> {
  const firstCandidates = buildCredentialCandidates();
  const firstTry = await tryLoginCandidates(request, loginUrl, firstCandidates);
  if (firstTry.payload) {
    return firstTry.payload;
  }

  const bootstrapCandidates = firstCandidates.length
    ? firstCandidates
    : [
      {
        email: 'admin@tester.com',
        password: 'Admin@123',
        source: 'bootstrap-fallback-default',
      },
    ];

  const bootstrapMessages: string[] = [];

  for (const candidate of bootstrapCandidates) {
    const bootstrapOutcome = runEnsureAdminUser(candidate.email, candidate.password);
    bootstrapMessages.push(`${candidate.email} [${candidate.source}] -> ${bootstrapOutcome.message}`);
  }

  const secondTry = await tryLoginCandidates(request, loginUrl, buildCredentialCandidates());
  if (secondTry.payload) {
    return secondTry.payload;
  }

  throw new Error(
    [
      'Unable to authenticate as admin with available credential candidates, even after running ensure-admin-user script.',
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to explicit values for this environment.',
      `Bootstrap: ${bootstrapMessages.join(' || ')}`,
      `Attempts: ${[...firstTry.attempts, ...secondTry.attempts].join(' | ')}`,
    ].join(' ')
  );
}

export function isAdminAuthUnavailableError(error: unknown): boolean {
  return error instanceof Error
    && error.message.includes('Unable to authenticate as admin with available credential candidates');
}
