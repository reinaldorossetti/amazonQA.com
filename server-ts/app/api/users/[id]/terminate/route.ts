import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { authenticateRequest } from '../../../../../lib/auth';
import { isUserAdmin } from '../../../../../lib/user-roles';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

function toUserId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request, { params }: RouteContext): Promise<Response> {
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
      return NextResponse.json({ error: 'Access denied to close this account' }, { status: 403 });
    }

    const userResult = await query<{ id: number; account_closed_at: string | null }>(
      'SELECT id, first_name, created_at, account_closed_at FROM users WHERE id = $1',
      [targetUserId]
    );

    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userResult.rows[0].account_closed_at) {
      return NextResponse.json({ error: 'Account is already closed' }, { status: 409 });
    }

    const saltRounds = 12;
    const pepper = process.env.BCRYPT_PEPPER ?? '';
    const randomPassword = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(randomPassword + pepper, saltRounds);

    const obscuredEmail = `closed-${targetUserId}-${Date.now()}@anon.local`;

    const updateResult = await query(
      `UPDATE users
       SET last_name = '[REDACTED]',
           email = $1,
           phone = NULL,
           password = $2,
           cpf = NULL,
           cnpj = NULL,
           company_name = NULL,
           address_zip = NULL,
           address_street = NULL,
           address_number = NULL,
           address_complement = NULL,
           address_neighborhood = NULL,
           address_city = NULL,
           address_state = NULL,
           residence_proof_filename = NULL,
           is_active = false,
           account_closed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, first_name, created_at, account_closed_at, is_active`,
      [obscuredEmail, hashedPassword, targetUserId]
    );

    await query('DELETE FROM user_roles WHERE user_id = $1', [targetUserId]);
    await query(
      `INSERT INTO user_roles (user_id, role)
       VALUES ($1, 'user')
       ON CONFLICT (user_id, role) DO NOTHING`,
      [targetUserId]
    );

    return NextResponse.json({
      message: 'Account closed with data obfuscation applied',
      user: updateResult.rows[0],
    });
  } catch (error: unknown) {
    console.error('[POST /api/users/:id/terminate]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to close account' }, { status: 500 });
  }
}
