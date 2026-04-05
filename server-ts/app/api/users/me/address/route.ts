import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { authenticateRequest } from '../../../../../lib/auth';

const ADDRESS_FIELDS = [
  'address_zip',
  'address_street',
  'address_number',
  'address_complement',
  'address_neighborhood',
  'address_city',
  'address_state',
] as const;

type AddressField = (typeof ADDRESS_FIELDS)[number];
type AddressBody = Partial<Record<AddressField, string | null>>;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function PUT(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId } = authResult.auth;
    const body = (await request.json()) as AddressBody;

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of ADDRESS_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        values.push(body[field] ?? null);
        updates.push(`${field} = $${values.length}`);
      }
    }

    if (!updates.length) {
      return NextResponse.json({ error: 'No address fields to update' }, { status: 400 });
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updateResult.rows[0]);
  } catch (error: unknown) {
    console.error('[PUT /api/users/me/address]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to update authenticated user address' }, { status: 500 });
  }
}
