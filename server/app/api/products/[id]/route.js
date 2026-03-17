/**
 * app/api/products/[id]/route.js
 * GET    /api/products/:id  — get a single product
 * PUT    /api/products/:id  — update a product
 * DELETE /api/products/:id  — delete a product
 */
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';

export async function GET(request, { params }) {
    try {
        const { rows } = await query('SELECT * FROM products WHERE id = $1', [params.id]);
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
        const body = await request.json();
        const { name, price, description, category, image, manufacturer, line, model } = body;

        const { rows } = await query(
            `UPDATE products
             SET name=$1, price=$2, description=$3, category=$4, image=$5,
                 manufacturer=$6, line=$7, model=$8
             WHERE id=$9
             RETURNING *`,
            [name, price, description, category, image, manufacturer, line, model, params.id]
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
        const { rowCount } = await query('DELETE FROM products WHERE id = $1', [params.id]);
        if (!rowCount) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Produto removido' });
    } catch (err) {
        console.error('[DELETE /api/products/:id]', err.message);
        return NextResponse.json({ error: 'Erro ao remover produto' }, { status: 500 });
    }
}
