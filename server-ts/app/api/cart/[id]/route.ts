import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { authenticateRequest } from '../../../../lib/auth';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

function toCartItemId(params: { id: string }): number | null {
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

    const cartItemId = toCartItemId(routeParams);
    if (!cartItemId) {
      return NextResponse.json({ error: 'Invalid cart item ID' }, { status: 400 });
    }

    const { userId: authUserId } = authResult.auth;
    const result = await query(
      `SELECT ci.id, ci.quantity, ci.added_at,
              p.id AS product_id, p.name, p.price, p.image, p.category
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = $1 AND ci.user_id = $2
       LIMIT 1`,
      [cartItemId, authUserId]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: unknown) {
    console.error('[GET /api/cart/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch cart item by ID' }, { status: 500 });
  }
}
