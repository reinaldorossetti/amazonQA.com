import { buildIdempotencyKey, formatCurrency } from '@/shared/utils/format';

describe('format utils', () => {
  it('formats BRL currency', () => {
    expect(formatCurrency(1234.5)).toContain('1.234');
    expect(formatCurrency(1234.5)).toContain('R$');
  });

  it('creates idempotency key with mobile prefix and user id', () => {
    const key = buildIdempotencyKey(42);
    expect(key.startsWith('mobile-42-')).toBe(true);
    expect(key.length).toBeGreaterThan(16);
  });
});
