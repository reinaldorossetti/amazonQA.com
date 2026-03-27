/**
 * scripts/seed.js — DDL + Seed
 *
 * Creates the three tables (products, users, cart_items) and
 * populates products from the frontend mock JSON.
 *
 * Usage:
 *   cd server
 *   node scripts/seed.js
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local from the server/ directory
config({ path: resolve(__dirname, '../.env.local') });

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const DDL = `
-- ─── products ────────────────────────────────────────────────────────────────
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

-- ─── users ───────────────────────────────────────────────────────────────────
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

-- ─── user_roles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
    id         SERIAL       PRIMARY KEY,
    user_id    INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT         NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- ─── cart_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL      PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT         NOT NULL DEFAULT 1,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ─── orders ───────────────────────────────────────────────────────────────────
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

-- ─── order_items ──────────────────────────────────────────────────────────────
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

-- ─── payments ─────────────────────────────────────────────────────────────────
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

async function seed() {
    const client = await pool.connect();
    try {
        console.log('📦 Criando tabelas...');
        await client.query(DDL);
        console.log('✓ Tabelas criadas (products, users, cart_items, user_roles, orders, order_items, payments)');

        // Garantir papel padrão para usuários existentes
        await client.query(
            `INSERT INTO user_roles (user_id, role)
             SELECT u.id, 'user'
             FROM users u
             WHERE NOT EXISTS (
                 SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
             )`
        );

        // Garantir perfil admin (promove o usuário definido por e-mail, ou o primeiro usuário cadastrado)
        const preferredAdminEmail = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
        let adminUserId = null;

        if (preferredAdminEmail) {
            const adminByEmail = await client.query(
                'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
                [preferredAdminEmail]
            );
            adminUserId = adminByEmail.rows[0]?.id ?? null;
        }

        if (!adminUserId) {
            const firstUser = await client.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
            adminUserId = firstUser.rows[0]?.id ?? null;
        }

        if (adminUserId) {
            await client.query(
                `INSERT INTO user_roles (user_id, role)
                 VALUES ($1, 'admin')
                 ON CONFLICT (user_id, role) DO NOTHING`,
                [adminUserId]
            );

            // Garante explicitamente também o perfil user para o mesmo usuário
            await client.query(
                `INSERT INTO user_roles (user_id, role)
                 VALUES ($1, 'user')
                 ON CONFLICT (user_id, role) DO NOTHING`,
                [adminUserId]
            );

            console.log(`✓ Perfis garantidos: user/admin (admin user_id=${adminUserId})`);
        } else {
            console.log('⚠ Nenhum usuário encontrado para atribuir perfil admin.');
        }

        // Load products from the frontend mock JSON
        const mockPath = resolve(__dirname, '../../src/data/products_mock.json');
        const products = JSON.parse(readFileSync(mockPath, 'utf8'));

        console.log(`🌱 Inserindo ${products.length} produtos...`);
        for (const p of products) {
            await client.query(
                `INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                 ON CONFLICT DO NOTHING`,
                [p.name, p.price, p.description ?? null, p.category ?? null,
                 p.image ?? null, p.manufacturer ?? null, p.line ?? null, p.model ?? null]
            );
        }
        console.log('✓ Seed completo!');
    } catch (err) {
        console.error('❌ Seed falhou:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
