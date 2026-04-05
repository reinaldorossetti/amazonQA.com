import { NextResponse } from 'next/server';
import { query, getPool } from '../../../lib/db';
import { authenticateRequest } from '../../../lib/auth';

const AUTH_ERROR_MESSAGE =
  'Access token missing, invalid, expired, or token user no longer exists';

type CartProductInput = {
  productId?: number;
  quantity?: number;
};

type CartBody = {
  products?: CartProductInput[];
  cartItemId?: number;
};

type CartItem = {
  productId: number;
  quantity: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request): Promise<Response> {
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
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (userId !== authUserId) {
      return NextResponse.json({ error: 'Access denied for this user' }, { status: 403 });
    }

    const result = await query(
      `SELECT ci.id, ci.quantity, ci.added_at,
              p.id AS product_id, p.name, p.price, p.image, p.category
       FROM   cart_items ci
       JOIN   products   p ON p.id = ci.product_id
       WHERE  ci.user_id = $1
       ORDER  BY ci.added_at ASC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error: unknown) {
    console.error('[GET /api/cart]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
    }

    const { userId: authUserId } = authResult.auth;
    const activeUsers = await query(
      'SELECT id FROM users WHERE id = $1 AND COALESCE(is_active, true) = true AND account_closed_at IS NULL LIMIT 1',
      [authUserId]
    );

    if (!activeUsers.rows.length) {
      return NextResponse.json({ error: AUTH_ERROR_MESSAGE }, { status: 401 });
    }

    const body = (await request.json()) as CartBody;
    const products = body?.products;

    if (!Array.isArray(products) || !products.length) {
      return NextResponse.json({ error: 'products must be a non-empty array' }, { status: 400 });
    }

    const normalizedProducts: CartItem[] = [];
    const productIds = new Set<number>();

    for (const product of products) {
      const productId = Number(product?.productId);
      const quantity = Number(product?.quantity ?? 1);

      if (!Number.isInteger(productId) || productId <= 0) {
        return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          { error: 'quantity must be an integer greater than or equal to 1' },
          { status: 400 }
        );
      }

      if (quantity > 99) {
        return NextResponse.json(
          { error: 'Product does not have enough quantity' },
          { status: 400 }
        );
      }

      if (productIds.has(productId)) {
        return NextResponse.json({ error: 'Duplicate products are not allowed' }, { status: 400 });
      }

      productIds.add(productId);
      normalizedProducts.push({ productId, quantity });
    }

    const productIdList = [...productIds];
    const existingProducts = await query<{ id: number }>(
      'SELECT id FROM products WHERE id = ANY($1::int[])',
      [productIdList]
    );
    const existingProductIds = new Set<number>(existingProducts.rows.map((row) => Number(row.id)));

    const hasMissingProduct = productIdList.some((id) => !existingProductIds.has(id));
    if (hasMissingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 400 });
    }

    const client = await getPool().connect();

    try {
      await client.query('BEGIN');

      const affectedItems: unknown[] = [];
      for (const item of normalizedProducts) {
        const insertResult = await client.query(
          `INSERT INTO cart_items (user_id, product_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, product_id)
           DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
           RETURNING *`,
          [authUserId, item.productId, item.quantity]
        );

        affectedItems.push(insertResult.rows[0]);
      }

      await client.query('COMMIT');

      return NextResponse.json(
        {
          items: affectedItems,
          processed: affectedItems.length,
        },
        { status: 201 }
      );
    } catch (transactionError: unknown) {
      await client.query('ROLLBACK');
      throw transactionError;
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    const maybePgError = error as { code?: string };
    console.error('[POST /api/cart]', getErrorMessage(error));

    if (maybePgError?.code === '23503') {
      return NextResponse.json({ error: 'Product not found' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId: authUserId } = authResult.auth;
    const body = (await request.json()) as CartBody;
    const cartItemId = body.cartItemId;

    if (!cartItemId) {
      return NextResponse.json({ error: 'cartItemId is required' }, { status: 400 });
    }

    const deleteResult = await query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [
      cartItemId,
      authUserId,
    ]);

    if (!deleteResult.rowCount) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error: unknown) {
    console.error('[DELETE /api/cart]', getErrorMessage(error));
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}
