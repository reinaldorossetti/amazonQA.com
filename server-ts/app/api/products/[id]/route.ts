import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { authenticateRequest } from '../../../../lib/auth';
import { isUserAdmin } from '../../../../lib/user-roles';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

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

function toProductId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;
    const productId = toProductId(routeParams);
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { rows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (!rows.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: unknown) {
    console.error('[GET /api/products/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const admin = await isUserAdmin(authResult.auth.userId);
    if (!admin) {
      return NextResponse.json({ error: 'Only admin can update products' }, { status: 403 });
    }

    const productId = toProductId(routeParams);
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const body = (await request.json()) as ProductBody;
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
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: unknown) {
    console.error('[PUT /api/products/:id]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext): Promise<Response> {
  try {
    const routeParams = await params;

    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const admin = await isUserAdmin(authResult.auth.userId);
    if (!admin) {
      return NextResponse.json({ error: 'Only admin can delete products' }, { status: 403 });
    }

    const productId = toProductId(routeParams);
    if (!productId) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [productId]);
    if (!rowCount) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product removed' });
  } catch (error: unknown) {
    const maybePgError = error as { code?: string };
    console.error('[DELETE /api/products/:id]', getErrorMessage(error));

    if (maybePgError?.code === '23503') {
      return NextResponse.json(
        { error: 'Product is linked to orders and cannot be removed' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Failed to remove product' }, { status: 500 });
  }
}
