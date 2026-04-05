import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { authenticateRequest } from '../../../../lib/auth';
import { isUserAdmin } from '../../../../lib/user-roles';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

type OrderRow = {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  grand_total: number;
  currency: string;
  payment_method: string | null;
  idempotency_key: string | null;
  shipping_address: Record<string, unknown> | null;
  billing_info: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  cancelled_at: string | null;
};

type OrderItemRow = {
  id: number;
  order_id: number;
  product_id: number;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
  created_at: string;
};

function toOrderId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getOrderById(orderId: number): Promise<(OrderRow & { items: OrderItemRow[] }) | null> {
  const orderResult = await query<OrderRow>(
    `SELECT id, order_number, user_id, status,
            subtotal, shipping_total, discount_total, grand_total,
            currency, payment_method, idempotency_key,
            shipping_address, billing_info,
            created_at, updated_at, cancelled_at
     FROM orders
     WHERE id = $1`,
    [orderId]
  );

  if (!orderResult.rows.length) {
    return null;
  }

  const itemsResult = await query<OrderItemRow>(
    `SELECT id, order_id, product_id,
            product_name_snapshot, unit_price_snapshot,
            quantity, line_total, created_at
     FROM order_items
     WHERE order_id = $1
     ORDER BY id ASC`,
    [orderId]
  );

  return {
    ...orderResult.rows[0],
    items: itemsResult.rows,
  };
}

function canTransitionStatus(currentStatus: string, nextStatus: string): boolean {
  const normalizedCurrent = String(currentStatus || '').toLowerCase();
  const normalizedNext = String(nextStatus || '').toLowerCase();

  if (!normalizedCurrent || !normalizedNext) return false;
  if (normalizedCurrent === normalizedNext) return true;

  const transitions: Record<string, string[]> = {
    created: ['pending_payment', 'paid', 'cancelled'],
    pending_payment: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  return (transitions[normalizedCurrent] || []).includes(normalizedNext);
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

    const orderId = toOrderId(routeParams);
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && authUserId !== order.user_id) {
      return NextResponse.json({ error: 'Access denied for this order' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    console.error('[GET /api/orders/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const orderId = toOrderId(routeParams);
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const existing = await getOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && authUserId !== existing.user_id) {
      return NextResponse.json({ error: 'Access denied for this order' }, { status: 403 });
    }

    const body = (await request.json()) as { status?: string; paymentMethod?: string | null };
    const updates: string[] = [];
    const values: unknown[] = [];

    if (Object.prototype.hasOwnProperty.call(body, 'status')) {
      const nextStatus = String(body.status).toLowerCase();
      if (!canTransitionStatus(existing.status, nextStatus)) {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
      }
      values.push(nextStatus);
      updates.push(`status = $${values.length}`);

      if (nextStatus === 'cancelled') {
        updates.push('cancelled_at = NOW()');
      }
    }

    if (admin && Object.prototype.hasOwnProperty.call(body, 'paymentMethod')) {
      values.push(body.paymentMethod ?? null);
      updates.push(`payment_method = $${values.length}`);
    }

    if (!updates.length) {
      return NextResponse.json({ error: 'No allowed fields to update' }, { status: 400 });
    }

    values.push(orderId);

    await query(
      `UPDATE orders
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}`,
      values
    );

    const updated = await getOrderById(orderId);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('[PUT /api/orders/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const orderId = toOrderId(routeParams);
    if (!orderId) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const existing = await getOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);
    if (!admin && authUserId !== existing.user_id) {
      return NextResponse.json({ error: 'Access denied for this order' }, { status: 403 });
    }

    if (String(existing.status).toLowerCase() === 'delivered') {
      return NextResponse.json({ error: 'Delivered order cannot be canceled' }, { status: 400 });
    }

    await query(
      `UPDATE orders
       SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    );

    const cancelled = await getOrderById(orderId);
    return NextResponse.json({ message: 'Order canceled', order: cancelled });
  } catch (error: unknown) {
    console.error('[DELETE /api/orders/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 });
  }
}
