import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { authenticateRequest } from '../../../../lib/auth.js';
import { isUserAdmin } from '../../../../lib/user-roles.js';

function toOrderId(params) {
    const id = Number(params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getOrderById(orderId) {
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

    const itemsResult = await query(
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

function canTransitionStatus(currentStatus, nextStatus) {
    const normalizedCurrent = String(currentStatus || '').toLowerCase();
    const normalizedNext = String(nextStatus || '').toLowerCase();

    if (!normalizedCurrent || !normalizedNext) return false;
    if (normalizedCurrent === normalizedNext) return true;

    const transitions = {
        created: ['paid', 'cancelled'],
        paid: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
    };

    return (transitions[normalizedCurrent] || []).includes(normalizedNext);
}

export async function GET(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const orderId = toOrderId(params);
        if (!orderId) {
            return NextResponse.json({ error: 'ID de pedido inválido' }, { status: 400 });
        }

        const order = await getOrderById(orderId);
        if (!order) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
        }

        const { userId: authUserId } = authResult.auth;
        const admin = await isUserAdmin(authUserId);
        if (!admin && authUserId !== order.user_id) {
            return NextResponse.json({ error: 'Acesso negado para este pedido' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (err) {
        console.error('[GET /api/orders/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const orderId = toOrderId(params);
        if (!orderId) {
            return NextResponse.json({ error: 'ID de pedido inválido' }, { status: 400 });
        }

        const existing = await getOrderById(orderId);
        if (!existing) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
        }

        const { userId: authUserId } = authResult.auth;
        const admin = await isUserAdmin(authUserId);
        if (!admin && authUserId !== existing.user_id) {
            return NextResponse.json({ error: 'Acesso negado para este pedido' }, { status: 403 });
        }

        const body = await request.json();
        const updates = [];
        const values = [];

        if (Object.prototype.hasOwnProperty.call(body, 'status')) {
            const nextStatus = String(body.status).toLowerCase();
            if (!canTransitionStatus(existing.status, nextStatus)) {
                return NextResponse.json({ error: 'Transição de status inválida' }, { status: 400 });
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
            return NextResponse.json({ error: 'Nenhum campo permitido para atualização' }, { status: 400 });
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
    } catch (err) {
        console.error('[PUT /api/orders/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const orderId = toOrderId(params);
        if (!orderId) {
            return NextResponse.json({ error: 'ID de pedido inválido' }, { status: 400 });
        }

        const existing = await getOrderById(orderId);
        if (!existing) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
        }

        const { userId: authUserId } = authResult.auth;
        const admin = await isUserAdmin(authUserId);
        if (!admin && authUserId !== existing.user_id) {
            return NextResponse.json({ error: 'Acesso negado para este pedido' }, { status: 403 });
        }

        if (String(existing.status).toLowerCase() === 'delivered') {
            return NextResponse.json({ error: 'Pedido entregue não pode ser cancelado' }, { status: 400 });
        }

        await query(
            `UPDATE orders
             SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
             WHERE id = $1`,
            [orderId]
        );

        const cancelled = await getOrderById(orderId);
        return NextResponse.json({ message: 'Pedido cancelado', order: cancelled });
    } catch (err) {
        console.error('[DELETE /api/orders/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao cancelar pedido' }, { status: 500 });
    }
}
