import { query } from './db.js';

export async function getRolesForUser(userId) {
    const { rows } = await query(
        'SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role ASC',
        [userId]
    );
    return rows.map((row) => row.role);
}

export async function isUserAdmin(userId) {
    const { rowCount } = await query(
        'SELECT 1 FROM user_roles WHERE user_id = $1 AND role = $2 LIMIT 1',
        [userId, 'admin']
    );
    return rowCount > 0;
}

export async function ensureUserRole(userId, role = 'user') {
    await query(
        `INSERT INTO user_roles (user_id, role)
         VALUES ($1, $2)
         ON CONFLICT (user_id, role) DO NOTHING`,
        [userId, role]
    );
}
