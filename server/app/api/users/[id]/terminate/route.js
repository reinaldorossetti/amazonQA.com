import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db.js';
import { authenticateRequest } from '../../../../../lib/auth.js';
import { isUserAdmin } from '../../../../../lib/user-roles.js';

function toUserId(params) {
    const id = Number(params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function POST(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const targetUserId = toUserId(params);
        if (!targetUserId) {
            return NextResponse.json({ error: 'ID de usuário inválido' }, { status: 400 });
        }

        const { userId: authUserId } = authResult.auth;
        const admin = await isUserAdmin(authUserId);
        if (!admin && authUserId !== targetUserId) {
            return NextResponse.json({ error: 'Acesso negado para encerrar esta conta' }, { status: 403 });
        }

        const userResult = await query('SELECT id, first_name, created_at, account_closed_at FROM users WHERE id = $1', [targetUserId]);
        if (!userResult.rows.length) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        if (userResult.rows[0].account_closed_at) {
            return NextResponse.json({ error: 'Conta já está encerrada' }, { status: 409 });
        }

        const saltRounds = 12;
        const pepper = process.env.BCRYPT_PEPPER ?? '';
        const randomPassword = crypto.randomUUID();
        const hashedPassword = await bcrypt.hash(randomPassword + pepper, saltRounds);

        const obscuredEmail = `closed-${targetUserId}-${Date.now()}@anon.local`;

        const updateResult = await query(
            `UPDATE users
             SET last_name = '[OFUSCADO]',
                 email = $1,
                 phone = NULL,
                 password = $2,
                 cpf = NULL,
                 cnpj = NULL,
                 company_name = NULL,
                 address_zip = NULL,
                 address_street = NULL,
                 address_number = NULL,
                 address_complement = NULL,
                 address_neighborhood = NULL,
                 address_city = NULL,
                 address_state = NULL,
                 residence_proof_filename = NULL,
                 is_active = false,
                 account_closed_at = NOW(),
                 updated_at = NOW()
             WHERE id = $3
             RETURNING id, first_name, created_at, account_closed_at, is_active`,
            [obscuredEmail, hashedPassword, targetUserId]
        );

        await query('DELETE FROM user_roles WHERE user_id = $1', [targetUserId]);
        await query(
            `INSERT INTO user_roles (user_id, role)
             VALUES ($1, 'user')
             ON CONFLICT (user_id, role) DO NOTHING`,
            [targetUserId]
        );

        return NextResponse.json({
            message: 'Conta encerrada com ofuscação aplicada',
            user: updateResult.rows[0],
        });
    } catch (err) {
        console.error('[POST /api/users/:id/terminate]', err.message);
        return NextResponse.json({ error: 'Erro ao encerrar conta' }, { status: 500 });
    }
}
