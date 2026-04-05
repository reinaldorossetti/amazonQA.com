/**
 * scripts/reset.js — Drop all tables + Reseed
 *
 * Drops every application table (cascade) and then re-seeds the database from
 * scratch.  Useful to guarantee a clean state before running the build or
 * before the test suite.
 *
 * Usage (standalone):
 *   cd server
 *   node scripts/reset.js
 *
 * Called automatically by:
 *   npm run build  →  npm run db:reset && next build
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

// ─── Tables to drop (in dependency order — children before parents) ───────────
const DROP_DDL = `
DROP TABLE IF EXISTS payments        CASCADE;
DROP TABLE IF EXISTS order_items     CASCADE;
DROP TABLE IF EXISTS orders          CASCADE;
DROP TABLE IF EXISTS cart_items      CASCADE;
DROP TABLE IF EXISTS user_roles      CASCADE;
DROP TABLE IF EXISTS users           CASCADE;
DROP TABLE IF EXISTS products        CASCADE;
`;

// ─── Re-create DDL (copied from seed.js to keep reset self-contained) ─────────
const CREATE_DDL = `
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
    created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ,
    is_active                BOOLEAN      NOT NULL DEFAULT TRUE,
    account_closed_at        TIMESTAMPTZ
);

-- ─── user_roles ──────────────────────────────────────────────────────────────
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

async function reset() {
    const client = await pool.connect();
    try {
        // ── 1. Drop everything ──────────────────────────────────────────────────
        console.log('🗑️  Limpando banco de dados...');
        await client.query(DROP_DDL);
        console.log('✓ Todas as tabelas removidas.');

        // ── 2. Re-create schema ─────────────────────────────────────────────────
        console.log('📦 Recriando tabelas...');
        await client.query(CREATE_DDL);
        console.log('✓ Tabelas recriadas (products, users, user_roles, cart_items, orders, order_items, payments).');

        // ── 3. Seed products from the frontend mock JSON ────────────────────────
        const mockPath = resolve(__dirname, '../../web/src/data/products_mock.json');
        const products = JSON.parse(readFileSync(mockPath, 'utf8'));

        console.log(`🌱 Inserindo ${products.length} produtos...`);
        for (const p of products) {
            await client.query(
                `INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [p.name, p.price, p.description ?? null, p.category ?? null,
                 p.image ?? null, p.manufacturer ?? null, p.line ?? null, p.model ?? null]
            );
        }
        console.log('✓ Produtos inseridos.');

        // ── 4. Assign admin role to first user (if any) ─────────────────────────
        const preferredAdminEmail = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
        let adminUserId = null;

        if (preferredAdminEmail) {
            const row = await client.query(
                'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
                [preferredAdminEmail]
            );
            adminUserId = row.rows[0]?.id ?? null;
        }

        if (!adminUserId) {
            const first = await client.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
            adminUserId = first.rows[0]?.id ?? null;
        }

        if (adminUserId) {
            await client.query(
                `INSERT INTO user_roles (user_id, role) VALUES ($1, 'user')  ON CONFLICT DO NOTHING`,
                [adminUserId]
            );
            await client.query(
                `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`,
                [adminUserId]
            );
            console.log(`✓ Perfis user/admin garantidos (user_id=${adminUserId}).`);
        } else {
            console.log('⚠  Nenhum usuário encontrado — perfil admin não atribuído.');
        }

        console.log('\n🚀 Reset completo! Banco limpo e pronto para uso.\n');
    } catch (err) {
        console.error('❌ Reset falhou:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

reset();
