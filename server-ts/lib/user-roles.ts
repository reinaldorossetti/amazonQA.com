import { query } from './db';

type RoleRow = { role: string };

export async function getRolesForUser(userId: number): Promise<string[]> {
  const result = await query<RoleRow>(
    'SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role ASC',
    [userId]
  );

  return result.rows.map((row: RoleRow) => row.role);
}

export async function isUserAdmin(userId: number): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM user_roles WHERE user_id = $1 AND role = $2 LIMIT 1',
    [userId, 'admin']
  );

  return (result.rowCount ?? 0) > 0;
}

export async function ensureUserRole(userId: number, role = 'user'): Promise<void> {
  await query(
    `INSERT INTO user_roles (user_id, role)
     VALUES ($1, $2)
     ON CONFLICT (user_id, role) DO NOTHING`,
    [userId, role]
  );
}
