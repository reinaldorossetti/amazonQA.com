import { api } from '@/shared/api/client';
import type { CartItem } from '@/shared/types/models';

interface AddCartProductsPayload {
  products: Array<{ productId: number; quantity: number }>;
}

export async function getCart(userId: number): Promise<CartItem[]> {
  const { data } = await api.get<CartItem[]>('/cart', {
    params: { userId },
  });
  return data;
}

export async function addToCart(payload: AddCartProductsPayload): Promise<void> {
  await api.post('/cart', payload);
}

export async function deleteCartItem(cartItemId: number): Promise<void> {
  await api.delete('/cart', {
    data: { cartItemId },
  });
}
