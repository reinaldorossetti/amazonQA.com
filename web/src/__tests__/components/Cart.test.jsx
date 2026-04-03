import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cart from '../../components/Cart';
import { BrowserRouter } from 'react-router-dom';

const updateSpy = vi.fn();
const removeSpy = vi.fn();
const checkoutSpy = vi.fn();

vi.mock('../../components/CartItem', () => ({
  default: ({ item, onUpdateCart, onRemoveFromCart }) => {
    updateSpy(item, onUpdateCart);
    removeSpy(item, onRemoveFromCart);
    return <li data-testid={`cart-item-${item.id}`}>{item.name}</li>;
  },
}));

vi.mock('../../components/CheckoutButton', () => ({
  default: ({ cartItems, setCartItems }) => {
    checkoutSpy(cartItems, setCartItems);
    return <button data-testid="checkout-mock">checkout</button>;
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Cart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const sampleItems = [
    { id: 1, name: 'Produto A', price: 10, quantity: 2 },
    { id: 2, name: 'Produto B', price: 5, quantity: 1 },
  ];

  it('TC_CART_001: renderiza estado vazio com CTA para catálogo', () => {
    renderWithRouter(<Cart cartItems={[]} />);
    expect(screen.getByText('cart.empty_title')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cart.go_to_catalog/i })).toHaveAttribute('href', '/');
  });

  it('TC_CART_002: renderiza lista de itens quando carrinho tem produtos', () => {
    renderWithRouter(<Cart cartItems={sampleItems} />);
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-2')).toBeInTheDocument();
    expect(document.querySelectorAll('hr').length).toBeGreaterThanOrEqual(1);
  });

  it('TC_CART_003: calcula subtotal e total corretamente', () => {
    renderWithRouter(<Cart cartItems={sampleItems} />);
    expect(screen.getAllByText('R$ 25.00').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('cart.free')).toBeInTheDocument();
  });

  it('TC_CART_004: passa callbacks de update/remove para CartItem', () => {
    const onUpdateCart = vi.fn();
    const onRemoveFromCart = vi.fn();

    renderWithRouter(
      <Cart
        cartItems={sampleItems}
        onUpdateCart={onUpdateCart}
        onRemoveFromCart={onRemoveFromCart}
      />
    );

    expect(updateSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(updateSpy.mock.calls[0][1]).toBe(onUpdateCart);
    expect(removeSpy.mock.calls[0][1]).toBe(onRemoveFromCart);
  });

  it('TC_CART_005: passa cartItems e setCartItems para CheckoutButton', () => {
    const setCartItems = vi.fn();
    renderWithRouter(<Cart cartItems={sampleItems} setCartItems={setCartItems} />);

    expect(screen.getByTestId('checkout-mock')).toBeInTheDocument();
    expect(checkoutSpy).toHaveBeenCalledWith(sampleItems, setCartItems);
  });

  it('TC_CART_006: botão continuar comprando aponta para home', () => {
    renderWithRouter(<Cart cartItems={sampleItems} />);
    expect(screen.getByRole('link', { name: /cart.continue_shopping/i })).toHaveAttribute('href', '/');
  });

  it('TC_CART_007: normaliza cartItems inválido para array vazio', () => {
    renderWithRouter(<Cart cartItems={null} />);
    expect(screen.getByText('cart.empty_title')).toBeInTheDocument();
  });

  it('TC_CART_008: renderiza título e resumo de pedido em carrinho preenchido', () => {
    renderWithRouter(<Cart cartItems={sampleItems} />);
    expect(screen.getByText('cart.title')).toBeInTheDocument();
    expect(screen.getByText('cart.order_summary')).toBeInTheDocument();
    expect(screen.getByText('cart.total')).toBeInTheDocument();
  });

  it('TC_CART_009: exibe contagem total de itens no resumo', () => {
    renderWithRouter(<Cart cartItems={sampleItems} />);
    expect(screen.getByText('cart.items')).toBeInTheDocument();
  });

  it('TC_CART_010: mantém render estável com interações básicas', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Cart cartItems={sampleItems} />);
    await user.click(screen.getByRole('link', { name: /cart.continue_shopping/i }));
    expect(screen.getByText('cart.order_summary')).toBeInTheDocument();
  });
});
