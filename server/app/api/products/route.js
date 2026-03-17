/**
 * app/api/products/route.js
 * GET  /api/products  — list all products (optional ?category=)
 * POST /api/products  — create a product
 */
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let sql = 'SELECT * FROM products ORDER BY name ASC';
        const params = [];

        if (category) {
            sql = 'SELECT * FROM products WHERE category = $1 ORDER BY name ASC';
            params.push(category);
        }

        const { rows } = await query(sql, params);
        return NextResponse.json(rows);
    } catch (err) {
        console.error('[GET /api/products]', err.message);
        return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, price, description, category, image, manufacturer, line, model } = body;

        if (!name || price == null) {
            return NextResponse.json({ error: 'name e price são obrigatórios' }, { status: 400 });
        }

        const { rows } = await query(
            `INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
             RETURNING *`,
            [name, price, description ?? null, category ?? null, image ?? null,
             manufacturer ?? null, line ?? null, model ?? null]
        );
        return NextResponse.json(rows[0], { status: 201 });
    } catch (err) {
        console.error('[POST /api/products]', err.message);
        return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
    }
}
