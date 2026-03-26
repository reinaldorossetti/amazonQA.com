import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { authenticateRequest } from '../../../../lib/auth.js';

function toCartItemId(params) {
    const id = Number(params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const cartItemId = toCartItemId(params);
        if (!cartItemId) {
            return NextResponse.json({ error: 'ID de carrinho inválido' }, { status: 400 });
        }

        const { userId: authUserId } = authResult.auth;
        const { rows } = await query(
            `SELECT ci.id, ci.quantity, ci.added_at,
                    p.id AS product_id, p.name, p.price, p.image, p.category
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.id = $1 AND ci.user_id = $2
             LIMIT 1`,
            [cartItemId, authUserId]
        );

        if (!rows.length) {
            return NextResponse.json({ message: 'Carrinho não encontrado' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error('[GET /api/cart/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar carrinho por ID' }, { status: 500 });
    }
}
