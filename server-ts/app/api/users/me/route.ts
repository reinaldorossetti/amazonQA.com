import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { authenticateRequest } from '../../../../lib/auth';
import { getRolesForUser } from '../../../../lib/user-roles';

type UserMeRow = {
  id: number;
  person_type: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
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

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId } = authResult.auth;

    const result = await query<UserMeRow>(
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0] as UserMeRow & { roles: string[]; isAdmin: boolean };
    user.roles = await getRolesForUser(user.id);
    user.isAdmin = user.roles.includes('admin');

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('[GET /api/users/me]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch authenticated user data' }, { status: 500 });
  }
}
