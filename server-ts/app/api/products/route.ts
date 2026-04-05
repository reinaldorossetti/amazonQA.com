import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { authenticateRequest } from '../../../lib/auth';
import { isUserAdmin } from '../../../lib/user-roles';

type ProductBody = {
  name?: string;
  price?: number;
  description?: string | null;
  category?: string | null;
  image?: string | null;
  manufacturer?: string | null;
  line?: string | null;
  model?: string | null;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let sql = 'SELECT * FROM products ORDER BY name ASC';
    const params: unknown[] = [];

    if (category) {
      sql = 'SELECT * FROM products WHERE category = $1 ORDER BY name ASC';
      params.push(category);
    }

    const { rows } = await query(sql, params);
    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error('[GET /api/products]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const admin = await isUserAdmin(authResult.auth.userId);
    if (!admin) {
      return NextResponse.json({ error: 'Only admin can create products' }, { status: 403 });
    }

    const body = (await request.json()) as ProductBody;
    const { name, price, description, category, image, manufacturer, line, model } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: 'name and price are required' }, { status: 400 });
    }

    const { rows } = await query(
      `INSERT INTO products (name, price, description, category, image, manufacturer, line, model)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        name,
        price,
        description ?? null,
        category ?? null,
        image ?? null,
        manufacturer ?? null,
        line ?? null,
        model ?? null,
      ]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/products]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
