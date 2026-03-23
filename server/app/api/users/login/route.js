/**
 * app/api/users/login/route.js
 * POST /api/users/login  — authenticate an existing user
 *
 * Body: { email, password }
 * Returns user (without password) or 401.
 */
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import bcrypt from 'bcrypt';
import { signAccessToken } from '../../../../lib/auth.js';

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
        if (!user) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        if (user.is_active === false || user.account_closed_at) {
            return NextResponse.json({ error: 'Conta encerrada ou inativa.' }, { status: 403 });
        }

        const customSalt = "Reinaldo2026";
        const isPasswordValid = await bcrypt.compare(password + customSalt, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // Return user without the password field
        const safeUser = { ...user };
        delete safeUser.password;

        const rolesResult = await query(
            'SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role ASC',
            [user.id]
        );
        safeUser.roles = rolesResult.rows.map((row) => row.role);
        safeUser.isAdmin = safeUser.roles.includes('admin');

        const { accessToken, expiresIn } = signAccessToken(safeUser);

        return NextResponse.json({
            accessToken,
            tokenType: 'Bearer',
            expiresIn,
            user: safeUser,
        });
    } catch (err) {
        console.error('[POST /api/users/login]', err.message);
        return NextResponse.json({ error: 'Erro ao autenticar' }, { status: 500 });
    }
}
