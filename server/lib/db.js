/**
 * lib/db.js — PostgreSQL connection pool (singleton)
 *
 * Reads DATABASE_URL from environment (set in .env.local for dev,
 * or via the container env in production).
 */
import { Pool } from 'pg';

let pool;

export function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }
    return pool;
}

/**
 * Convenience: run a parameterised query.
 * @param {string}  sql
 * @param {Array}   [params=[]]
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(sql, params = []) {
    const client = getPool();
    return client.query(sql, params);
}
