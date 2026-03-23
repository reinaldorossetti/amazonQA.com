import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { authenticateRequest } from '../../../../lib/auth.js';
import { isUserAdmin, getRolesForUser } from '../../../../lib/user-roles.js';

function toUserId(params) {
    const id = Number(params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request, { params }) {
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
            return NextResponse.json({ error: 'Acesso negado para este usuário' }, { status: 403 });
        }

        const result = await query(
            `SELECT id, person_type, first_name, last_name, email, phone,
                    cpf, cnpj, company_name,
                    address_zip, address_street, address_number, address_complement,
                    address_neighborhood, address_city, address_state,
                    residence_proof_filename,
                    created_at, updated_at, is_active, account_closed_at
             FROM users
             WHERE id = $1`,
            [targetUserId]
        );

        if (!result.rows.length) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const user = result.rows[0];
        user.roles = await getRolesForUser(user.id);
        user.isAdmin = user.roles.includes('admin');

        return NextResponse.json(user);
    } catch (err) {
        console.error('[GET /api/users/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar usuário' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
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
            return NextResponse.json({ error: 'Acesso negado para este usuário' }, { status: 403 });
        }

        const body = await request.json();
        const allowedFields = [
            'person_type',
            'first_name',
            'last_name',
            'email',
            'phone',
            'cpf',
            'cnpj',
            'company_name',
            'address_zip',
            'address_street',
            'address_number',
            'address_complement',
            'address_neighborhood',
            'address_city',
            'address_state',
            'residence_proof_filename',
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(body, field)) {
                values.push(body[field]);
                updates.push(`${field} = $${values.length}`);
            }
        }

        if (!updates.length) {
            return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
        }

        if (Object.prototype.hasOwnProperty.call(body, 'email') && body.email) {
            const check = await query('SELECT id FROM users WHERE email = $1 AND id <> $2', [body.email, targetUserId]);
            if (check.rows.length) {
                return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
            }
        }

        if (Object.prototype.hasOwnProperty.call(body, 'cpf') && body.cpf) {
            const cpfDigits = String(body.cpf).replace(/\D/g, '');
            const check = await query('SELECT id FROM users WHERE cpf = $1 AND id <> $2', [cpfDigits, targetUserId]);
            if (check.rows.length) {
                return NextResponse.json({ error: 'Este CPF já está cadastrado.' }, { status: 409 });
            }
            const cpfIdx = updates.findIndex((u) => u.startsWith('cpf ='));
            if (cpfIdx >= 0) values[cpfIdx] = cpfDigits;
        }

        if (Object.prototype.hasOwnProperty.call(body, 'cnpj') && body.cnpj) {
            const cnpjDigits = String(body.cnpj).replace(/\D/g, '');
            const check = await query('SELECT id FROM users WHERE cnpj = $1 AND id <> $2', [cnpjDigits, targetUserId]);
            if (check.rows.length) {
                return NextResponse.json({ error: 'Este CNPJ já está cadastrado.' }, { status: 409 });
            }
            const cnpjIdx = updates.findIndex((u) => u.startsWith('cnpj ='));
            if (cnpjIdx >= 0) values[cnpjIdx] = cnpjDigits;
        }

        values.push(targetUserId);
        const userIdParam = values.length;

        const updateResult = await query(
            `UPDATE users
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${userIdParam}
             RETURNING id, person_type, first_name, last_name, email, phone,
                       cpf, cnpj, company_name,
                       address_zip, address_street, address_number, address_complement,
                       address_neighborhood, address_city, address_state,
                       residence_proof_filename,
                       created_at, updated_at, is_active, account_closed_at`,
            values
        );

        if (!updateResult.rows.length) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        const user = updateResult.rows[0];
        user.roles = await getRolesForUser(user.id);
        user.isAdmin = user.roles.includes('admin');

        return NextResponse.json(user);
    } catch (err) {
        console.error('[PUT /api/users/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
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
        if (!admin) {
            return NextResponse.json({ error: 'Apenas admin pode excluir usuários' }, { status: 403 });
        }

        const deleteResult = await query('DELETE FROM users WHERE id = $1 RETURNING id', [targetUserId]);
        if (!deleteResult.rows.length) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Usuário removido permanentemente', id: deleteResult.rows[0].id });
    } catch (err) {
        console.error('[DELETE /api/users/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
    }
}
