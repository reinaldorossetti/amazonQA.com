import { NextResponse } from 'next/server';
import { query } from '../../../../../../lib/db';
import { authenticateRequest } from '../../../../../../lib/auth';
import { isUserAdmin } from '../../../../../../lib/user-roles';

type RouteContext = { params: Promise<{ id: string; paymentId: string }> | { id: string; paymentId: string } };

type PaymentRow = {
  id: number;
  order_id: number;
  user_id: number;
  method: string;
  amount: number;
  status: string;
  card_brand: string | null;
  provider_reference: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  order_owner_id: number;
};

function toPositiveInt(value: string | undefined): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function getPayment(orderId: number, paymentId: number): Promise<PaymentRow | null> {
  const result = await query<PaymentRow>(
    `SELECT p.id, p.order_id, p.user_id, p.method, p.amount, p.status,
            p.card_brand, p.provider_reference, p.metadata, p.created_at, p.updated_at,
            o.user_id AS order_owner_id
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     WHERE p.order_id = $1 AND p.id = $2`,
    [orderId, paymentId]
  );
  return result.rows[0] || null;
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

    const orderId = toPositiveInt(routeParams?.id);
    const paymentId = toPositiveInt(routeParams?.paymentId);

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const payment = await getPayment(orderId, paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && payment.order_owner_id !== authUserId) {
      return NextResponse.json({ error: 'Access denied for this payment' }, { status: 403 });
    }

    return NextResponse.json(payment, { status: 200 });
  } catch (error: unknown) {
    console.error('[GET /api/orders/:id/payments/:paymentId]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}
