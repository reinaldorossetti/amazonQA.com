/**
 * app/api/products/[id]/route.js
 * GET    /api/products/:id  — get a single product
 * PUT    /api/products/:id  — update a product
 * DELETE /api/products/:id  — delete a product
 */
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { authenticateRequest } from '../../../../lib/auth.js';
import { isUserAdmin } from '../../../../lib/user-roles.js';

function toProductId(params) {
    const id = Number(params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request, { params }) {
    try {
        const productId = toProductId(params);
        if (!productId) {
            return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 });
        }

        const { rows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
        if (!rows.length) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error('[GET /api/products/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const admin = await isUserAdmin(authResult.auth.userId);
        if (!admin) {
            return NextResponse.json({ error: 'Apenas admin pode atualizar produtos' }, { status: 403 });
        }

        const productId = toProductId(params);
        if (!productId) {
            return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 });
        }

        const body = await request.json();
        const { name, price, description, category, image, manufacturer, line, model } = body;

        const { rows } = await query(
            `UPDATE products
             SET name=$1, price=$2, description=$3, category=$4, image=$5,
                 manufacturer=$6, line=$7, model=$8
             WHERE id=$9
             RETURNING *`,
            [name, price, description, category, image, manufacturer, line, model, productId]
        );
        if (!rows.length) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (err) {
        console.error('[PUT /api/products/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const authResult = authenticateRequest(request);
        if (!authResult.ok) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        const admin = await isUserAdmin(authResult.auth.userId);
        if (!admin) {
            return NextResponse.json({ error: 'Apenas admin pode excluir produtos' }, { status: 403 });
        }

        const productId = toProductId(params);
        if (!productId) {
            return NextResponse.json({ error: 'ID de produto inválido' }, { status: 400 });
        }

        const { rowCount } = await query('DELETE FROM products WHERE id = $1', [productId]);
        if (!rowCount) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Produto removido' });
    } catch (err) {
        console.error('[DELETE /api/products/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
    }
}
