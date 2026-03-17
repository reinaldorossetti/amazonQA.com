/**
 * app/api/cart/route.js
 * GET    /api/cart?userId=<id>  — list cart items for a user
 * POST   /api/cart              — add / increment a cart item
 * DELETE /api/cart              — remove a cart item  { cartItemId }
 */
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
        }

        const { rows } = await query(
            `SELECT ci.id, ci.quantity, ci.added_at,
                    p.id AS product_id, p.name, p.price, p.image, p.category
             FROM   cart_items ci
             JOIN   products   p ON p.id = ci.product_id
             WHERE  ci.user_id = $1
             ORDER  BY ci.added_at ASC`,
            [userId]
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error('[GET /api/cart]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar carrinho' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId, productId, quantity = 1 } = await request.json();

        if (!userId || !productId) {
            return NextResponse.json({ error: 'userId e productId são obrigatórios' }, { status: 400 });
        }

        const { rows } = await query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
             RETURNING *`,
            [userId, productId, quantity]
        );
        return NextResponse.json(rows[0], { status: 201 });
    } catch (err) {
        console.error('[POST /api/cart]', err.message);
        return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { cartItemId } = await request.json();

        if (!cartItemId) {
            return NextResponse.json({ error: 'cartItemId é obrigatório' }, { status: 400 });
        }

        const { rowCount } = await query(
            'DELETE FROM cart_items WHERE id = $1',
            [cartItemId]
        );

        if (!rowCount) {
            return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item removido do carrinho' });
    } catch (err) {
        console.error('[DELETE /api/cart]', err.message);
        return NextResponse.json({ error: 'Erro ao remover item do carrinho' }, { status: 500 });
    }
}
