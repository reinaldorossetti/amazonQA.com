import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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

function buildCredentialCandidates(): AdminCredentials[] {
  const rawCandidates = [
    {
      email: process.env.E2E_ADMIN_EMAIL,
      password: process.env.E2E_ADMIN_PASSWORD,
      source: 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD',
    },
    {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
      source: 'SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD',
    },
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

function runEnsureAdminUser(email: string): { ran: boolean; message: string } {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFile);
  const serverDir = path.resolve(currentDir, '../../../server');
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
  const firstTry = await tryLoginCandidates(request, loginUrl, buildCredentialCandidates());
  if (firstTry.payload) {
    return firstTry.payload;
  }

  const bootstrapEmail = String(
    process.env.E2E_ADMIN_EMAIL
      ?? process.env.SEED_ADMIN_EMAIL
      ?? 'admin@tester.com'
  )
    .trim()
    .toLowerCase();

  const bootstrapOutcome = runEnsureAdminUser(bootstrapEmail);

  if (bootstrapOutcome.ran) {
    const secondTry = await tryLoginCandidates(request, loginUrl, [
      {
        email: bootstrapEmail,
        password: 'Admin@123',
        source: 'ensure-admin-user-bootstrap',
      },
      ...buildCredentialCandidates(),
    ]);

    if (secondTry.payload) {
      return secondTry.payload;
    }

    throw new Error(
      [
        'Unable to authenticate as admin with available credential candidates, even after running ensure-admin-user script.',
        'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to explicit values for this environment.',
        `Bootstrap: ${bootstrapOutcome.message}`,
        `Attempts: ${[...firstTry.attempts, ...secondTry.attempts].join(' | ')}`,
      ].join(' ')
    );
  }

  throw new Error(
    [
      'Unable to authenticate as admin with available credential candidates.',
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to explicit values for this environment.',
      `Bootstrap: ${bootstrapOutcome.message}`,
      `Attempts: ${firstTry.attempts.join(' | ')}`,
    ].join(' ')
  );
}
