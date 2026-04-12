import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Product from '../../components/Product';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => {
      const dict = {
        'product.add_to_cart': 'Adicionar ao Carrinho',
        'cart_item.qty': 'Qtd:',
      };
      return dict[key] ?? key;
    },
  }),
}));

describe('Product Component (Card)', () => {
  const baseProduct = {
    id: 55,
    name: 'Headset Pro',
    image: 'https://img.local/headset.png',
    description: 'Áudio imersivo',
    category: 'Games',
    price: 199.9,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC_PROD_001: renderiza dados básicos do produto', () => {
    render(<Product product={baseProduct} />);

    expect(screen.getByText('Headset Pro')).toBeInTheDocument();
    expect(screen.getByAltText('Headset Pro')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar ao carrinho/i })).toBeInTheDocument();
  });

  it('TC_PROD_002: aplica fallback seguro para produto inválido', () => {
    render(<Product product={{ id: null, price: NaN }} />);

    expect(screen.getByText('Produto')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Produto' })).toBeInTheDocument();
  });

  it('TC_PROD_003: exibe preço original e badge quando há desconto', () => {
    render(
      <Product
        product={{
          ...baseProduct,
          price: 90,
          originalPrice: 100,
          discountPercentage: 10,
        }}
      />
    );

    expect(screen.getByText('R$ 100.00')).toBeInTheDocument();
    expect(screen.getByText('-10%')).toBeInTheDocument();
  });

  it('TC_PROD_004: não exibe badge de desconto quando preço original é inválido', () => {
    render(
      <Product
        product={{
          ...baseProduct,
          originalPrice: null,
          discountPercentage: null,
        }}
      />
    );

    expect(screen.queryByText(/-%/)).not.toBeInTheDocument();
  });

  it('TC_PROD_005: altera quantidade e envia no add to cart', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();

    render(<Product product={baseProduct} onAddToCart={onAddToCart} />);

    await user.click(screen.getByLabelText('Qtd'));
    await user.click(screen.getByRole('option', { name: '3' }));
    await user.click(screen.getByRole('button', { name: /adicionar ao carrinho/i }));

    expect(onAddToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 55, name: 'Headset Pro' }), 3);
  });

  it('TC_PROD_006: navega para detalhe ao clicar na imagem e no título', async () => {
    const user = userEvent.setup();
    render(<Product product={baseProduct} />);

    await user.click(screen.getByAltText('Headset Pro'));
    await user.click(screen.getByText('Headset Pro'));

    expect(navigateMock).toHaveBeenCalledWith('/product/55');
    expect(navigateMock).toHaveBeenCalledTimes(2);
  });
});
