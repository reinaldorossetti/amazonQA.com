import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const email = process.env.SEED_ADMIN_EMAIL || 'admin.teste@tester.com';
const customSalt = 'Reinaldo2026';

async function ensureAdminUser() {
  const exists = await pool.query(
    'SELECT id FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1',
    [email]
  );

  let userId = exists.rows[0]?.id;

  if (!userId) {
    const hash = await bcrypt.hash(`Admin@123${customSalt}`, 12);
    const created = await pool.query(
      `INSERT INTO users (
         person_type, first_name, last_name, email, password, is_active, updated_at
       ) VALUES (
         'PF', 'Admin', 'Teste', $1, $2, true, NOW()
       ) RETURNING id`,
      [email, hash]
    );
    userId = created.rows[0].id;
  }

  await pool.query(
    `INSERT INTO user_roles (user_id, role)
     VALUES ($1, 'user')
     ON CONFLICT (user_id, role) DO NOTHING`,
    [userId]
  );

  await pool.query(
    `INSERT INTO user_roles (user_id, role)
     VALUES ($1, 'admin')
     ON CONFLICT (user_id, role) DO NOTHING`,
    [userId]
  );

  const roles = await pool.query(
    'SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role ASC',
    [userId]
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        userId,
        email,
        roles: roles.rows.map((r) => r.role),
      },
      null,
      2
    )
  );
}

ensureAdminUser()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
