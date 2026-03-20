/**
 * app/api/users/register/route.js
 * POST /api/users/register  — create new user
 *
 * Body: { person_type, first_name, last_name, email, phone?, password,
 *         cpf?, cnpj?, company_name?, address_* }
 */
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            person_type = 'PF',
            first_name, last_name, email, phone, password,
            cpf, cnpj, company_name,
            address_zip, address_street, address_number, address_complement,
            address_neighborhood, address_city, address_state,
            residence_proof_filename,
        } = body;

        if (!first_name || !last_name || !email || !password) {
            return NextResponse.json(
                { error: 'Campos obrigatórios: first_name, last_name, email, password' },
                { status: 400 }
            );
        }

        // Uniqueness checks with friendly error messages
        const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length) {
            return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
        }

        if (cpf) {
            const digits = cpf.replace(/\D/g, '');
            const cpfCheck = await query('SELECT id FROM users WHERE cpf = $1', [digits]);
            if (cpfCheck.rows.length) {
                return NextResponse.json({ error: 'Este CPF já está cadastrado.' }, { status: 409 });
            }
        }

        if (cnpj) {
            const digits = cnpj.replace(/\D/g, '');
            const cnpjCheck = await query('SELECT id FROM users WHERE cnpj = $1', [digits]);
            if (cnpjCheck.rows.length) {
                return NextResponse.json({ error: 'Este CNPJ já está cadastrado.' }, { status: 409 });
            }
        }

        const saltRounds = 12;
        const customSalt = "Reinaldo";
        const hashedPassword = await bcrypt.hash(password + customSalt, saltRounds);

        const { rows } = await query(
            `INSERT INTO users (
                person_type, first_name, last_name, email, phone, password,
                cpf, cnpj, company_name,
                address_zip, address_street, address_number, address_complement,
                address_neighborhood, address_city, address_state,
                residence_proof_filename
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            RETURNING id, person_type, first_name, last_name, email, created_at`,
            [
                person_type, first_name, last_name, email,
                phone ?? null, hashedPassword,
                cpf  ? cpf.replace(/\D/g, '')  : null,
                cnpj ? cnpj.replace(/\D/g, '') : null,
                company_name ?? null,
                address_zip ?? null, address_street ?? null, address_number ?? null,
                address_complement ?? null, address_neighborhood ?? null,
                address_city ?? null, address_state ?? null,
                residence_proof_filename ?? null,
            ]
        );

        return NextResponse.json(rows[0], { status: 201 });
    } catch (err) {
        console.error('[POST /api/users/register]', err.message);
        return NextResponse.json({ error: 'Erro ao cadastrar usuário' }, { status: 500 });
    }
}
