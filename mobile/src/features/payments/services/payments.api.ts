import { api } from '@/shared/api/client';
import type { Payment } from '@/shared/types/models';

interface PayPayload {
  method: 'credit' | 'debit' | 'pix' | 'boleto';
  amount: number;
  holderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  installments?: number;
}

export async function payOrder(orderId: number, payload: PayPayload): Promise<Payment> {
  const { data } = await api.post<Payment>(`/orders/${orderId}/payments`, payload);
  return data;
}

export async function getPayment(orderId: number, paymentId: number): Promise<Payment> {
  const { data } = await api.get<Payment>(`/orders/${orderId}/payments/${paymentId}`);
  return data;
}
