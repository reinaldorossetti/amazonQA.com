import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '../../../../lib/db';
import { signAccessToken } from '../../../../lib/auth';

type LoginBody = {
  email?: string;
  password?: string;
};

type UserRow = {
  id: number;
  person_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  password: string;
  cpf: string | null;
  cnpj: string | null;
  company_name: string | null;
  address_zip: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  residence_proof_filename: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  account_closed_at: string | null;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password } = (await request.json()) as LoginBody;

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    const result = await query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (user.is_active === false || user.account_closed_at) {
      return NextResponse.json({ error: 'Account closed or inactive.' }, { status: 403 });
    }

    const pepper = process.env.BCRYPT_PEPPER ?? '';
    const isPasswordValid = await bcrypt.compare(password + pepper, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const safeUser: Omit<UserRow, 'password'> & { roles: string[]; isAdmin: boolean } = {
      ...user,
      roles: [],
      isAdmin: false,
    };
    delete (safeUser as unknown as { password?: string }).password;

    const rolesResult = await query<{ role: string }>(
      'SELECT role FROM user_roles WHERE user_id = $1 ORDER BY role ASC',
      [user.id]
    );

    safeUser.roles = rolesResult.rows.map((row: { role: string }) => row.role);
    safeUser.isAdmin = safeUser.roles.includes('admin');

    const { accessToken, expiresIn } = signAccessToken(safeUser);

    return NextResponse.json({
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: safeUser,
    });
  } catch (error: unknown) {
    console.error('[POST /api/users/login]', getErrorMessage(error));
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
