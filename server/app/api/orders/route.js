import { NextResponse } from 'next/server';
import { getPool, query } from '../../../lib/db.js';
import { authenticateRequest } from '../../../lib/auth.js';
import { isUserAdmin } from '../../../lib/user-roles.js';

function getIdempotencyKey(request) {
    const raw = request.headers.get('idempotency-key') || request.headers.get('Idempotency-Key');
    const value = String(raw || '').trim();
    return value || null;
}

function normalizeTotals(body = {}) {
    const shippingTotal = Number(body.shippingTotal ?? 0);
    const discountTotal = Number(body.discountTotal ?? 0);

    if (Number.isNaN(shippingTotal) || shippingTotal < 0) {
        return { ok: false, error: 'shippingTotal inválido' };
    }

    if (Number.isNaN(discountTotal) || discountTotal < 0) {
        return { ok: false, error: 'discountTotal inválido' };
    }

    return {
        ok: true,
        shippingTotal,
        discountTotal,
        paymentMethod: body.paymentMethod ?? null,
        shippingAddress: body.shippingAddress ?? null,
        billingInfo: body.billingInfo ?? null,
    };
}

async function buildOrderDetails(orderId) {
    const orderResult = await query(
        `SELECT id, order_number, user_id, status,
                subtotal, shipping_total, discount_total, grand_total,
                currency, payment_method, idempotency_key,
                shipping_address, billing_info,
                created_at, updated_at, cancelled_at
         FROM orders
         WHERE id = $1`,
        [orderId]
    );

    if (!orderResult.rows.length) return null;

    const itemResult = await query(
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

export async function POST(request) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const { userId: authUserId } = authResult.auth;
        const body = await request.json().catch(() => ({}));
        const totals = normalizeTotals(body);

        if (!totals.ok) {
            return NextResponse.json({ error: totals.error }, { status: 400 });
        }

        const idempotencyKey = getIdempotencyKey(request);
        if (idempotencyKey) {
            const existingResult = await query(
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

            if (!cartResult.rows.length) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
            }

            const subtotal = cartResult.rows.reduce(
                (acc, row) => acc + Number(row.unit_price) * Number(row.quantity),
                0
            );
            const grandTotal = subtotal + totals.shippingTotal - totals.discountTotal;

            if (grandTotal < 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Total do pedido inválido' }, { status: 400 });
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

            const orderId = orderInsertResult.rows[0].id;
            const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(orderId).padStart(6, '0')}`;

            await client.query(
                'UPDATE orders SET order_number = $1, updated_at = NOW() WHERE id = $2',
                [orderNumber, orderId]
            );

            for (const row of cartResult.rows) {
                const lineTotal = Number(row.unit_price) * Number(row.quantity);
                await client.query(
                    `INSERT INTO order_items (
                        order_id, product_id, product_name_snapshot,
                        unit_price_snapshot, quantity, line_total
                     ) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        orderId,
                        row.product_id,
                        row.product_name,
                        row.unit_price,
                        row.quantity,
                        lineTotal,
                    ]
                );
            }

            await client.query('DELETE FROM cart_items WHERE user_id = $1', [authUserId]);

            await client.query('COMMIT');

            const createdOrder = await buildOrderDetails(orderId);
            return NextResponse.json(createdOrder, { status: 201 });
        } catch (transactionErr) {
            await client.query('ROLLBACK');
            throw transactionErr;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[POST /api/orders]', err.message);
        return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
    }
}

export async function GET(request) {
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

        const filters = [];
        const values = [];

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

        const totalResult = await query(
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
    } catch (err) {
        console.error('[GET /api/orders]', err.message);
        return NextResponse.json({ error: 'Erro ao listar pedidos' }, { status: 500 });
    }
}
