import { NextResponse } from 'next/server';
import { getPool, query } from '../../../lib/db';
import { authenticateRequest } from '../../../lib/auth';
import { isUserAdmin } from '../../../lib/user-roles';

type OrderBody = {
  shippingTotal?: number;
  discountTotal?: number;
  paymentMethod?: string;
  shippingAddress?: Record<string, unknown> | null;
  billingInfo?: Record<string, unknown> | null;
  items?: Array<{ productId?: number; product_id?: number; id?: number; quantity?: number }>;
};

type ProvidedItem = { productId: number; quantity: number };

type ProductRow = {
  id: number;
  name: string;
  price: number;
};

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

type OrderInputRow = {
  product_id: number;
  quantity: number;
  product_name: string;
  unit_price: number;
};

function getIdempotencyKey(request: Request): string | null {
  const raw = request.headers.get('idempotency-key') ?? request.headers.get('Idempotency-Key');
  const value = String(raw ?? '').trim();
  return value || null;
}

function normalizeTotals(body: OrderBody = {}):
  | {
      ok: true;
      shippingTotal: number;
      discountTotal: number;
      paymentMethod: string | null;
      shippingAddress: Record<string, unknown> | null;
      billingInfo: Record<string, unknown> | null;
    }
  | { ok: false; error: string } {
  const shippingTotal = Number(body.shippingTotal ?? 0);
  const discountTotal = Number(body.discountTotal ?? 0);

  if (Number.isNaN(shippingTotal) || shippingTotal < 0) {
    return { ok: false, error: 'Invalid shippingTotal' };
  }

  if (Number.isNaN(discountTotal) || discountTotal < 0) {
    return { ok: false, error: 'Invalid discountTotal' };
  }

  const allowedMethods = ['credit', 'debit', 'pix', 'boleto'];
  const paymentMethod = body.paymentMethod ?? null;

  if (paymentMethod && !allowedMethods.includes(paymentMethod.toLowerCase())) {
    return { ok: false, error: 'Invalid payment method' };
  }

  return {
    ok: true,
    shippingTotal,
    discountTotal,
    paymentMethod,
    shippingAddress: body.shippingAddress ?? null,
    billingInfo: body.billingInfo ?? null,
  };
}

function normalizeBodyItems(body: OrderBody = {}):
  | { ok: true; hasItems: boolean; items: ProvidedItem[] }
  | { ok: false; error: string } {
  const rawItems = body.items;

  if (rawItems == null) {
    return { ok: true, hasItems: false, items: [] };
  }

  if (!Array.isArray(rawItems) || !rawItems.length) {
    return { ok: false, error: 'items must be a non-empty array when provided' };
  }

  const seen = new Set<number>();
  const normalized: ProvidedItem[] = [];

  for (const raw of rawItems) {
    const productId = Number(raw?.productId ?? raw?.product_id ?? raw?.id);
    const quantity = Number(raw?.quantity ?? 1);

    if (!Number.isInteger(productId) || productId <= 0) {
      return { ok: false, error: 'items contains invalid productId' };
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return { ok: false, error: 'items contains invalid quantity' };
    }

    if (seen.has(productId)) {
      return { ok: false, error: 'items cannot contain duplicate products' };
    }

    seen.add(productId);
    normalized.push({ productId, quantity });
  }

  return { ok: true, hasItems: true, items: normalized };
}

async function loadRowsFromProvidedItems(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: ProductRow[] }> },
  providedItems: ProvidedItem[]
): Promise<{ ok: true; rows: OrderInputRow[] } | { ok: false; error: string }> {
  const ids = providedItems.map((item) => item.productId);
  const productResult = await client.query(
    `SELECT id, name, price
     FROM products
     WHERE id = ANY($1::int[])`,
    [ids]
  );

  const byId = new Map<number, ProductRow>(productResult.rows.map((row) => [Number(row.id), row]));
  const rows: OrderInputRow[] = [];

  for (const item of providedItems) {
    const product = byId.get(item.productId);
    if (!product) {
      return { ok: false, error: 'Product not found at checkout' };
    }

    rows.push({
      product_id: product.id,
      quantity: item.quantity,
      product_name: product.name,
      unit_price: product.price,
    });
  }

  return { ok: true, rows };
}

async function buildOrderDetails(orderId: number): Promise<(OrderRow & { items: OrderItemRow[] }) | null> {
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

  const itemResult = await query<OrderItemRow>(
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
    items: itemResult.rows,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId: authUserId } = authResult.auth;
    const body = (await request.json().catch(() => ({}))) as OrderBody;
    const totals = normalizeTotals(body);
    const normalizedItems = normalizeBodyItems(body);

    if (!totals.ok) {
      return NextResponse.json({ error: totals.error }, { status: 400 });
    }

    if (!normalizedItems.ok) {
      return NextResponse.json({ error: normalizedItems.error }, { status: 400 });
    }

    const idempotencyKey = getIdempotencyKey(request);
    if (idempotencyKey) {
      const existingResult = await query<{ id: number }>(
        'SELECT id FROM orders WHERE user_id = $1 AND idempotency_key = $2 LIMIT 1',
        [authUserId, idempotencyKey]
      );

      if (existingResult.rows.length) {
        const existing = await buildOrderDetails(existingResult.rows[0].id);
        return NextResponse.json(existing, { status: 200 });
      }
    }

    const client = await getPool().connect();

    try {
      await client.query('BEGIN');

      const cartResult = await client.query(
        `SELECT ci.product_id, ci.quantity,
                p.name AS product_name,
                p.price AS unit_price
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.user_id = $1
         ORDER BY ci.id ASC`,
        [authUserId]
      );

      let orderRows = cartResult.rows as OrderInputRow[];

      if (!orderRows.length && normalizedItems.hasItems) {
        const rowsFromBody = await loadRowsFromProvidedItems(client, normalizedItems.items);
        if (!rowsFromBody.ok) {
          await client.query('ROLLBACK');
          return NextResponse.json({ error: rowsFromBody.error }, { status: 400 });
        }

        orderRows = rowsFromBody.rows;
      }

      if (!orderRows.length) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Empty cart' }, { status: 400 });
      }

      const subtotal = orderRows.reduce(
        (accumulator, row) => accumulator + Number(row.unit_price) * Number(row.quantity),
        0
      );
      const grandTotal = subtotal + totals.shippingTotal - totals.discountTotal;

      if (grandTotal < 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
      }

      const orderInsertResult = await client.query(
        `INSERT INTO orders (
            user_id, status, subtotal, shipping_total, discount_total,
            grand_total, currency, payment_method, idempotency_key,
            shipping_address, billing_info, updated_at
         ) VALUES ($1, 'created', $2, $3, $4, $5, 'BRL', $6, $7, $8, $9, NOW())
         RETURNING id`,
        [
          authUserId,
          subtotal,
          totals.shippingTotal,
          totals.discountTotal,
          grandTotal,
          totals.paymentMethod,
          idempotencyKey,
          totals.shippingAddress,
          totals.billingInfo,
        ]
      );

      const orderId = Number(orderInsertResult.rows[0].id);
      const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderId).padStart(6, '0')}`;

      await client.query('UPDATE orders SET order_number = $1, updated_at = NOW() WHERE id = $2', [
        orderNumber,
        orderId,
      ]);

      for (const row of orderRows) {
        const lineTotal = Number(row.unit_price) * Number(row.quantity);
        await client.query(
          `INSERT INTO order_items (
              order_id, product_id, product_name_snapshot,
              unit_price_snapshot, quantity, line_total
           ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, row.product_id, row.product_name, row.unit_price, row.quantity, lineTotal]
        );
      }

      if (cartResult.rows.length) {
        await client.query('DELETE FROM cart_items WHERE user_id = $1', [authUserId]);
      }

      await client.query('COMMIT');

      const createdOrder = await buildOrderDetails(orderId);
      return NextResponse.json(createdOrder, { status: 201 });
    } catch (transactionError: unknown) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('[POST /api/orders]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId: authUserId } = authResult.auth;
    const admin = await isUserAdmin(authUserId);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? 20)));
    const offset = (page - 1) * pageSize;

    const status = String(searchParams.get('status') || '').trim().toLowerCase();
    const userIdParam = Number(searchParams.get('userId'));

    const filters: string[] = [];
    const values: unknown[] = [];

    if (admin) {
      if (Number.isInteger(userIdParam) && userIdParam > 0) {
        values.push(userIdParam);
        filters.push(`user_id = $${values.length}`);
      }
    } else {
      values.push(authUserId);
      filters.push(`user_id = $${values.length}`);
    }

    if (status) {
      values.push(status);
      filters.push(`LOWER(status) = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const totalResult = await query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM orders ${whereClause}`,
      values
    );

    const listValues = [...values, pageSize, offset];
    const rowsResult = await query(
      `SELECT id, order_number, user_id, status,
              subtotal, shipping_total, discount_total, grand_total,
              currency, payment_method,
              created_at, updated_at, cancelled_at
       FROM orders
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
      listValues
    );

    return NextResponse.json({
      page,
      pageSize,
      total: totalResult.rows[0]?.total ?? 0,
      items: rowsResult.rows,
    });
  } catch (error: unknown) {
    console.error('[GET /api/orders]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 });
  }
}
