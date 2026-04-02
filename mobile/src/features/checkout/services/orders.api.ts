import { api } from '@/shared/api/client';
import type { Order } from '@/shared/types/models';

interface ListOrdersResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

interface CreateOrderPayload {
  shippingTotal?: number;
  discountTotal?: number;
  paymentMethod?: string | null;
  shippingAddress?: Record<string, unknown> | null;
  billingInfo?: Record<string, unknown> | null;
  items?: Array<{ productId: number; quantity: number }>;
}

export async function createOrder(payload: CreateOrderPayload, idempotencyKey: string): Promise<Order> {
  const { data } = await api.post<Order>('/orders', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
  return data;
}

export async function listOrders(): Promise<Order[]> {
  const { data } = await api.get<ListOrdersResponse>('/orders');
  return data.items;
}

export async function getOrderById(orderId: number): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${orderId}`);
  return data;
}
