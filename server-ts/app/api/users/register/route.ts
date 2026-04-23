import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '../../../../lib/db';

type RegisterBody = {
  person_type?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  cpf?: string;
  cnpj?: string;
  company_name?: string;
  address_zip?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  residence_proof_filename?: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as RegisterBody;
    const {
      person_type,
      first_name,
      last_name,
      email,
      phone,
      password,
      cpf,
      cnpj,
      company_name,
      address_zip,
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
      residence_proof_filename,
    } = body;

    // Validate required fields and build a clear response for missing ones
    const requiredFields = ['person_type', 'first_name', 'last_name', 'email', 'password'];
    const missingFields = requiredFields.filter((f) => {
      const v = (body as any)[f];
      return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
    });

    if (missingFields.length) {
      return NextResponse.json({ error: 'Missing required fields', missingFields }, { status: 400 });
    }

    // Validate person_type value
    if (!(person_type === 'PF' || person_type === 'PJ')) {
      return NextResponse.json(
        { error: 'Invalid value', field: 'person_type', message: 'person_type must be PF or PJ' },
        { status: 400 }
      );
    }

    if (person_type === 'PF' && (!cpf || cpf.trim() === '')) {
      return NextResponse.json({ error: 'CPF is required for person_type PF' }, { status: 400 });
    }

    if (person_type === 'PJ' && (!cnpj || cnpj.trim() === '')) {
      return NextResponse.json({ error: 'CNPJ is required for person_type PJ' }, { status: 400 });
    }

    const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
    }

    if (cpf) {
      const digits = cpf.replace(/\D/g, '');
      const cpfCheck = await query('SELECT id FROM users WHERE cpf = $1', [digits]);
      if (cpfCheck.rows.length) {
        return NextResponse.json({ error: 'This CPF is already registered.' }, { status: 409 });
      }
    }

    if (cnpj) {
      const digits = cnpj.replace(/\D/g, '');
      const cnpjCheck = await query('SELECT id FROM users WHERE cnpj = $1', [digits]);
      if (cnpjCheck.rows.length) {
        return NextResponse.json({ error: 'This CNPJ is already registered.' }, { status: 409 });
      }
    }

    const saltRounds = 12;
    const pepper = process.env.BCRYPT_PEPPER ?? '';
    const hashedPassword = await bcrypt.hash(password + pepper, saltRounds);

    const result = await query(
      `INSERT INTO users (
          person_type, first_name, last_name, email, phone, password,
          cpf, cnpj, company_name,
          address_zip, address_street, address_number, address_complement,
          address_neighborhood, address_city, address_state,
          residence_proof_filename
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING id, person_type, first_name, last_name, email, created_at`,
      [
        person_type,
        first_name,
        last_name,
        email,
        phone ?? null,
        hashedPassword,
        cpf ? cpf.replace(/\D/g, '') : null,
        cnpj ? cnpj.replace(/\D/g, '') : null,
        company_name ?? null,
        address_zip ?? null,
        address_street ?? null,
        address_number ?? null,
        address_complement ?? null,
        address_neighborhood ?? null,
        address_city ?? null,
        address_state ?? null,
        residence_proof_filename ?? null,
      ]
    );

    await query(
      `INSERT INTO user_roles (user_id, role)
       VALUES ($1, 'user')
       ON CONFLICT (user_id, role) DO NOTHING`,
      [Number((result.rows[0] as { id: number }).id)]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/users/register]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
