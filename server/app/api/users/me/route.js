import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { authenticateRequest } from '../../../../lib/auth.js';
import { getRolesForUser } from '../../../../lib/user-roles.js';

export async function GET(request) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const { userId } = authResult.auth;

        const result = await query(
            `SELECT id, person_type, first_name, last_name, email, phone,
                    cpf, cnpj, company_name,
                    address_zip, address_street, address_number, address_complement,
                    address_neighborhood, address_city, address_state,
                    residence_proof_filename,
                    created_at, updated_at, is_active, account_closed_at
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (!result.rows.length) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const user = result.rows[0];
        user.roles = await getRolesForUser(user.id);
        user.isAdmin = user.roles.includes('admin');

        return NextResponse.json(user);
    } catch (err) {
        console.error('[GET /api/users/me]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar dados do usuário autenticado' }, { status: 500 });
    }
}
