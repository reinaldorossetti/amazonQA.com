/**
 * app/api/cart/route.js
 * GET    /api/cart?userId=<id>  — list cart items for a user
 * POST   /api/cart              — add / increment cart items in batch
 * DELETE /api/cart              — remove a cart item  { cartItemId }
 */
import { NextResponse } from 'next/server';
import { query, getPool } from '../../../lib/db.js';
import { authenticateRequest } from '../../../lib/auth.js';

const AUTH_ERROR_MESSAGE = 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais';

export async function GET(request) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const { userId: authUserId } = authResult.auth;
        const { searchParams } = new URL(request.url);
        const userIdParam = searchParams.get('userId');
        const userId = userIdParam ? Number(userIdParam) : authUserId;

        if (!userId || Number.isNaN(userId)) {
            return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
        }

        if (userId !== authUserId) {
            return NextResponse.json({ error: 'Acesso negado para este usuário' }, { status: 403 });
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
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
        }

        const { userId: authUserId } = authResult.auth;
        const { rows: activeUserRows } = await query(
            'SELECT id FROM users WHERE id = $1 AND COALESCE(is_active, true) = true AND account_closed_at IS NULL LIMIT 1',
            [authUserId]
        );

        if (!activeUserRows.length) {
            return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
        }

        const body = await request.json();
        const products = body?.products;

        if (!Array.isArray(products) || !products.length) {
            return NextResponse.json({ error: 'products deve ser um array não vazio' }, { status: 400 });
        }

        const normalizedProducts = [];
        const productIds = new Set();

        for (const product of products) {
            const productId = Number(product?.productId);
            const quantity = Number(product?.quantity ?? 1);

            if (!Number.isInteger(productId) || productId <= 0) {
                return NextResponse.json({ error: 'productId inválido' }, { status: 400 });
            }

            if (!Number.isInteger(quantity) || quantity < 1) {
                return NextResponse.json({ error: 'quantity deve ser um inteiro maior ou igual a 1' }, { status: 400 });
            }

            if (quantity > 99) {
                return NextResponse.json({ error: 'Produto não possui quantidade suficiente' }, { status: 400 });
            }

            if (productIds.has(productId)) {
                return NextResponse.json({ error: 'Não é permitido possuir produto duplicado' }, { status: 400 });
            }

            productIds.add(productId);
            normalizedProducts.push({ productId, quantity });
        }

        const productIdList = [...productIds];
        const { rows: existingProducts } = await query(
            'SELECT id FROM products WHERE id = ANY($1::int[])',
            [productIdList]
        );
        const existingProductIds = new Set(existingProducts.map((row) => row.id));

        const hasMissingProduct = productIdList.some((id) => !existingProductIds.has(id));
        if (hasMissingProduct) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 400 });
        }

        const client = await getPool().connect();

        try {
            await client.query('BEGIN');

            const affectedItems = [];
            for (const item of normalizedProducts) {
                const { rows } = await client.query(
                    `INSERT INTO cart_items (user_id, product_id, quantity)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (user_id, product_id)
                     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
                     RETURNING *`,
                    [authUserId, item.productId, item.quantity]
                );

                affectedItems.push(rows[0]);
            }

            await client.query('COMMIT');

            return NextResponse.json(
                {
                    items: affectedItems,
                    processed: affectedItems.length,
                },
                { status: 201 }
            );
        } catch (transactionErr) {
            await client.query('ROLLBACK');
            throw transactionErr;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[POST /api/cart]', err.message);

        if (err?.code === '23503') {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Erro ao adicionar ao carrinho' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const { userId: authUserId } = authResult.auth;
        const { cartItemId } = await request.json();

        if (!cartItemId) {
            return NextResponse.json({ error: 'cartItemId é obrigatório' }, { status: 400 });
        }

        const { rowCount } = await query(
            'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
            [cartItemId, authUserId]
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
