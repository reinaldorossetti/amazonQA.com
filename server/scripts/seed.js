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

-- ─── cart_items ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL      PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT         NOT NULL DEFAULT 1,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);
`;

async function seed() {
    const client = await pool.connect();
    try {
        console.log('📦 Criando tabelas...');
        await client.query(DDL);
        console.log('✓ Tabelas criadas (products, users, cart_items)');

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
