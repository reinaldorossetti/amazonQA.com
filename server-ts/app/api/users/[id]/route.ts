import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { authenticateRequest } from '../../../../lib/auth';
import { isUserAdmin, getRolesForUser } from '../../../../lib/user-roles';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

type UserUpdateBody = {
  person_type?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
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

function toUserId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const targetUserId = toUserId(routeParams);
    if (!targetUserId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && authUserId !== targetUserId) {
      return NextResponse.json({ error: 'Access denied for this user' }, { status: 403 });
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0] as Record<string, unknown> & { id: number; roles: string[]; isAdmin: boolean };
    user.roles = await getRolesForUser(user.id);
    user.isAdmin = user.roles.includes('admin');

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('[GET /api/users/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const targetUserId = toUserId(routeParams);
    if (!targetUserId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && authUserId !== targetUserId) {
      return NextResponse.json({ error: 'Access denied for this user' }, { status: 403 });
    }

    const body = (await request.json()) as UserUpdateBody;
    const allowedFields: Array<keyof UserUpdateBody> = [
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

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        values.push(body[field] ?? null);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (!updates.length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    if (Object.prototype.hasOwnProperty.call(body, 'email') && body.email) {
      const check = await query('SELECT id FROM users WHERE email = $1 AND id <> $2', [
        body.email,
        targetUserId,
      ]);
      if (check.rows.length) {
        return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'cpf') && body.cpf) {
      const cpfDigits = String(body.cpf).replace(/\D/g, '');
      const check = await query('SELECT id FROM users WHERE cpf = $1 AND id <> $2', [cpfDigits, targetUserId]);
      if (check.rows.length) {
        return NextResponse.json({ error: 'This CPF is already registered.' }, { status: 409 });
      }
      const cpfIdx = updates.findIndex((update) => update.startsWith('cpf ='));
      if (cpfIdx >= 0) {
        values[cpfIdx] = cpfDigits;
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'cnpj') && body.cnpj) {
      const cnpjDigits = String(body.cnpj).replace(/\D/g, '');
      const check = await query('SELECT id FROM users WHERE cnpj = $1 AND id <> $2', [
        cnpjDigits,
        targetUserId,
      ]);
      if (check.rows.length) {
        return NextResponse.json({ error: 'This CNPJ is already registered.' }, { status: 409 });
      }
      const cnpjIdx = updates.findIndex((update) => update.startsWith('cnpj ='));
      if (cnpjIdx >= 0) {
        values[cnpjIdx] = cnpjDigits;
      }
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = updateResult.rows[0] as Record<string, unknown> & { id: number; roles: string[]; isAdmin: boolean };
    user.roles = await getRolesForUser(user.id);
    user.isAdmin = user.roles.includes('admin');

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error('[PUT /api/users/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const targetUserId = toUserId(routeParams);
    if (!targetUserId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin) {
      return NextResponse.json({ error: 'Only admin can delete users' }, { status: 403 });
    }

    const deleteResult = await query('DELETE FROM users WHERE id = $1 RETURNING id', [targetUserId]);
    if (!deleteResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User permanently removed',
      id: (deleteResult.rows[0] as { id: number }).id,
    });
  } catch (error: unknown) {
    console.error('[DELETE /api/users/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
