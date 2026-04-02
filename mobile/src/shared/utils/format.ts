export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function buildIdempotencyKey(userId: number): string {
  return `mobile-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
