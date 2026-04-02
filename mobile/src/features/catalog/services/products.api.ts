import { api } from '@/shared/api/client';
import type { Product } from '@/shared/types/models';

export async function getProducts(category?: string): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products', {
    params: category ? { category } : undefined,
  });
  return data;
}

export async function getProductById(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}
