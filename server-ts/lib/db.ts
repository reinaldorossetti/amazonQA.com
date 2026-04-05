import process from 'node:process';
import { Pool, types, type QueryResult, type QueryResultRow } from 'pg';

// Parse NUMERIC (OID 1700) as float instead of string
types.setTypeParser(1700, (value: string): number => Number.parseFloat(value));

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = []
): Promise<QueryResult<T>> {
  return getPool().query<T>(sql, params as unknown[]);
}
