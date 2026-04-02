import { getProducts } from '@/features/catalog/services/products.api';
import { api } from '@/shared/api/client';

jest.mock('@/shared/api/client', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('products api', () => {
  it('requests products list from backend endpoint', async () => {
    const mockedData = [{ id: 1, name: 'Produto X', price: 10 }];
    (api.get as jest.Mock).mockResolvedValue({ data: mockedData });

    const result = await getProducts();

    expect(api.get).toHaveBeenCalledWith('/products', { params: undefined });
    expect(result).toEqual(mockedData);
  });
});
