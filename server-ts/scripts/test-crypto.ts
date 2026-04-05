import pg from 'pg';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

type RegisterResponse = {
  id: number;
  email: string;
};

type LoginResponse = {
  accessToken: string;
};

async function runTest(): Promise<void> {
  try {
    const testUser = {
      first_name: 'John',
      last_name: 'Security',
      email: `test_crypto_${Date.now()}@example.com`,
      password: 'MySuperSecretPassword123!',
      person_type: 'PF',
    };

    console.log('1. Registering a new user via API...');
    const regRes = await fetch('http://localhost:3001/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    if (!regRes.ok) {
      throw new Error(`Registration failed: ${await regRes.text()}`);
    }

    const regData = (await regRes.json()) as RegisterResponse;
    console.log('✅ User successfully registered:', regData);

    console.log('\n2. Querying database to verify password format...');
    const dbRes = await pool.query('SELECT email, password FROM users WHERE email = $1', [testUser.email]);
    const storedUser = dbRes.rows[0] as { password: string };

    console.log('🔒 Password stored in database:', storedUser.password);
    if (storedUser.password.startsWith('$2b$')) {
      console.log('✅ ENCRYPTION VALIDATED! Password is in bcrypt hash format ($2b$).');
    } else {
      console.log('❌ WARNING: Password does NOT appear to be using bcrypt hash.');
    }

    console.log('\n3. Logging in with the original password to validate hash verification...');
    const loginRes = await fetch('http://localhost:3001/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed: ${await loginRes.text()}`);
    }

    const loginData = (await loginRes.json()) as LoginResponse;
    console.log('✅ Login validated successfully! Returned data:', loginData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error during test:', message);
  } finally {
    await pool.end();
  }
}

runTest();
