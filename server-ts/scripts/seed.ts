import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, '../.env.local') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `
CREATE TABLE IF NOT EXISTS products (
    id           SERIAL        PRIMARY KEY,
    name         TEXT          NOT NULL,
    price        NUMERIC(10,2) NOT NULL,
    description  TEXT,
    category     TEXT,
    image        TEXT,
    manufacturer TEXT,
    line         TEXT,
    model        TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id                       SERIAL       PRIMARY KEY,
    person_type              TEXT         NOT NULL DEFAULT 'PF',
    first_name               TEXT         NOT NULL,
    last_name                TEXT         NOT NULL,
    email                    TEXT         NOT NULL UNIQUE,
    phone                    TEXT,
    password                 TEXT         NOT NULL,
    cpf                      TEXT         UNIQUE,
    cnpj                     TEXT         UNIQUE,
    company_name             TEXT,
    address_zip              TEXT,
    address_street           TEXT,
    address_number           TEXT,
    address_complement       TEXT,
    address_neighborhood     TEXT,
    address_city             TEXT,
    address_state            TEXT,
    residence_proof_filename TEXT,
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_closed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS user_roles (
    id         SERIAL       PRIMARY KEY,
    user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL      PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT         NOT NULL DEFAULT 1,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL        PRIMARY KEY,
    order_number     TEXT          UNIQUE,
    user_id          INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status           TEXT          NOT NULL DEFAULT 'created',
    subtotal         NUMERIC(10,2) NOT NULL,
    shipping_total   NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_total   NUMERIC(10,2) NOT NULL DEFAULT 0,
    grand_total      NUMERIC(10,2) NOT NULL,
    currency         TEXT          NOT NULL DEFAULT 'BRL',
    payment_method   TEXT,
    idempotency_key  TEXT,
    shipping_address JSONB,
    billing_info     JSONB,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    cancelled_at     TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_orders_user_idempotency
    ON orders(user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS order_items (
    id                    SERIAL        PRIMARY KEY,
    order_id              INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id            INT           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name_snapshot TEXT          NOT NULL,
    unit_price_snapshot   NUMERIC(10,2) NOT NULL,
    quantity              INT           NOT NULL,
    line_total            NUMERIC(10,2) NOT NULL,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id                 SERIAL        PRIMARY KEY,
    order_id           INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id            INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method             TEXT          NOT NULL,
    amount             NUMERIC(10,2) NOT NULL,
    status             TEXT          NOT NULL,
    card_brand         TEXT,
    provider_reference TEXT,
    metadata           JSONB,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
`;

type ProductSeed = {
  name: string;
  price: number;
  description?: string;
  category?: string;
  image?: string;
  manufacturer?: string;
  line?: string;
  model?: string;
};

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('📦 Creating tables...');
    await client.query(DDL);
    console.log('✓ Tables created (products, users, cart_items, user_roles, orders, order_items, payments)');

    await client.query(
      `INSERT INTO user_roles (user_id, role)
       SELECT u.id, 'user'
       FROM users u
       WHERE NOT EXISTS (
           SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
       )`
    );

    const preferredAdminEmail = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
    let adminUserId: number | null = null;

    if (preferredAdminEmail) {
      const adminByEmail = await client.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [
        preferredAdminEmail,
      ]);
      adminUserId = (adminByEmail.rows[0]?.id as number | undefined) ?? null;
    }

    if (!adminUserId) {
      const firstUser = await client.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
      adminUserId = (firstUser.rows[0]?.id as number | undefined) ?? null;
    }

    if (adminUserId) {
      await client.query(
        `INSERT INTO user_roles (user_id, role)
         VALUES ($1, 'admin')
         ON CONFLICT (user_id, role) DO NOTHING`,
        [adminUserId]
      );

      await client.query(
        `INSERT INTO user_roles (user_id, role)
         VALUES ($1, 'user')
         ON CONFLICT (user_id, role) DO NOTHING`,
        [adminUserId]
      );

      console.log(`✓ Roles ensured: user/admin (admin user_id=${adminUserId})`);
    } else {
      console.log('⚠ No user found to assign admin role.');
    }

    const mockPath = resolve(__dirname, '../../web/src/data/products_mock.json');
    const products = JSON.parse(readFileSync(mockPath, 'utf8')) as ProductSeed[];

    console.log(`🌱 Inserting ${products.length} products...`);
    for (const product of products) {
      await client.query(
        `INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        [
          product.name,
          product.price,
          product.description ?? null,
          product.category ?? null,
          product.image ?? null,
          product.manufacturer ?? null,
          product.line ?? null,
          product.model ?? null,
        ]
      );
    }

    console.log('✓ Seed completed!');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Seed failed:', message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
