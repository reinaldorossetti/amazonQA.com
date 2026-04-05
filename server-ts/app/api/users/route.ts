import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/db';
import { authenticateRequest } from '../../../lib/auth';
import { isUserAdmin, ensureUserRole } from '../../../lib/user-roles';

function parsePagination(searchParams: URLSearchParams): { page: number; pageSize: number; offset: number } {
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

type AdminCreateUserBody = {
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
  role?: string;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId } = authResult.auth;
    const admin = await isUserAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const { page, pageSize, offset } = parsePagination(searchParams);
    const status = (searchParams.get('status') ?? 'all').toLowerCase();

    let whereClause = '';
    if (status === 'active') whereClause = 'WHERE COALESCE(is_active, true) = true';
    if (status === 'closed') whereClause = 'WHERE COALESCE(is_active, true) = false';

    const totalResult = await query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM users ${whereClause}`
    );
    const total = totalResult.rows[0]?.total ?? 0;

    const usersResult = await query(
      `SELECT id, person_type, first_name, last_name, email, phone,
              created_at, updated_at, is_active, account_closed_at
       FROM users
       ${whereClause}
       ORDER BY id ASC
       LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );

    return NextResponse.json({
      page,
      pageSize,
      total,
      items: usersResult.rows,
    });
  } catch (error: unknown) {
    console.error('[GET /api/users]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin) {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = (await request.json()) as AdminCreateUserBody;
    const {
      person_type = 'PF',
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
      role = 'user',
    } = body;

    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        { error: 'Required fields: first_name, last_name, email, password' },
        { status: 400 }
      );
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

    const insertResult = await query(
      `INSERT INTO users (
          person_type, first_name, last_name, email, phone, password,
          cpf, cnpj, company_name,
          address_zip, address_street, address_number, address_complement,
          address_neighborhood, address_city, address_state,
          residence_proof_filename, updated_at, is_active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),true)
      RETURNING id, person_type, first_name, last_name, email, created_at, updated_at, is_active`,
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

    const createdUser = insertResult.rows[0] as { id: number } & Record<string, unknown>;
    const normalizedRole = role === 'admin' ? 'admin' : 'user';
    await ensureUserRole(createdUser.id, 'user');
    if (normalizedRole === 'admin') {
      await ensureUserRole(createdUser.id, 'admin');
    }

    return NextResponse.json(
      {
        ...createdUser,
        roles: normalizedRole === 'admin' ? ['admin', 'user'] : ['user'],
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[POST /api/users]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}
