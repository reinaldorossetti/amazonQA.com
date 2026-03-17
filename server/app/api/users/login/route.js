/**
 * app/api/users/login/route.js
 * POST /api/users/login  — authenticate an existing user
 *
 * Body: { email, password }
 * Returns user (without password) or 401.
 */
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'email e password são obrigatórios' },
                { status: 400 }
            );
        }

        const { rows } = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = rows[0];
        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // Return user without the password field
        const { password: _pw, ...safeUser } = user;
        return NextResponse.json(safeUser);
    } catch (err) {
        console.error('[POST /api/users/login]', err.message);
        return NextResponse.json({ error: 'Erro ao autenticar' }, { status: 500 });
    }
}
