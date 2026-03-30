import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db.js';
import { authenticateRequest } from '../../../../../lib/auth.js';

const ADDRESS_FIELDS = [
    'address_zip',
    'address_street',
    'address_number',
    'address_complement',
    'address_neighborhood',
    'address_city',
    'address_state',
];

export async function PUT(request) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const { userId } = authResult.auth;
        const body = await request.json();

        const updates = [];
        const values = [];

        for (const field of ADDRESS_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(body, field)) {
                values.push(body[field]);
                updates.push(`${field} = $${values.length}`);
            }
        }

        if (!updates.length) {
            return NextResponse.json({ error: 'Nenhum campo de endereço para atualizar' }, { status: 400 });
        }

        values.push(userId);

        const updateResult = await query(
            `UPDATE users
             SET ${updates.join(', ')}, updated_at = NOW()
             WHERE id = $${values.length}
             RETURNING id, person_type, first_name, last_name, email, phone,
                       address_zip, address_street, address_number, address_complement,
                       address_neighborhood, address_city, address_state,
                       updated_at`,
            values
        );

        if (!updateResult.rows.length) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json(updateResult.rows[0]);
    } catch (err) {
        console.error('[PUT /api/users/me/address]', err.message);
        return NextResponse.json({ error: 'Erro ao atualizar endereço do usuário autenticado' }, { status: 500 });
    }
}
