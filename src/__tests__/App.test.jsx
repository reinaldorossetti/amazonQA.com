import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { toast } from 'react-toastify';

vi.mock('react-toastify', async () => {
  const actual = await vi.importActual('react-toastify');
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('../components/Catalog', () => ({
  default: ({ onAddToCart, search, setSearch }) => (
    <div>
      <div data-testid="catalog-mock">Catalog Mock: {search}</div>
      <button onClick={() => setSearch('notebook')}>set-search</button>
      <button
        onClick={() =>
          onAddToCart(
            { id: 1, name: 'Produto A', price: 10, image: '', category: 'cat', description: 'desc' },
            1
          )
        }
      >
        add-product-a
      </button>
      <button
        onClick={() =>
          onAddToCart(
            { id: 1, name: 'Produto A', price: 10, image: '', category: 'cat', description: 'desc' },
            2
          )
        }
      >
        add-product-a-again
      </button>
      <button
        onClick={() =>
          onAddToCart(
            { id: 2, name: 'Produto B', price: 20, image: '', category: 'cat', description: 'desc' },
            1
          )
        }
      >
        add-product-b
      </button>
    </div>
  ),
}));

vi.mock('../components/ProductDetails', () => ({
  default: ({ onAddToCart }) => (
    <button onClick={() => onAddToCart({ id: 2, name: 'Produto B', price: 20, image: '', category: 'cat', description: 'desc' }, 1)}>
      product-details-add
    </button>
  ),
}));

vi.mock('../components/Cart', () => ({
  default: ({ cartItems, onUpdateCart, onRemoveFromCart, setCartItems }) => (
    <div>
      <div data-testid="cart-items-count">{cartItems.length}</div>
      <button onClick={() => onUpdateCart({ id: 1, name: 'Produto A' }, 5)}>update-item</button>
      <button onClick={() => onRemoveFromCart({ id: 1, name: 'Produto A' })}>remove-item</button>
      <button onClick={() => setCartItems([])}>clear-cart</button>
    </div>
  ),
}));

vi.mock('../components/Register', () => ({ default: () => <div>Register Mock</div> }));
vi.mock('../components/Login', () => ({ default: () => <div>Login Mock</div> }));
vi.mock('../components/ThankYouPage', () => ({ default: () => <div>ThankYou Mock</div> }));

describe('App Component - Integration Behaviors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  it('renderiza navbar, rota inicial e atualiza search', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId('catalog-mock')).toBeInTheDocument();
    expect(screen.getByText('nav.catalog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'set-search' }));
    expect(screen.getByText(/Catalog Mock: notebook/)).toBeInTheDocument();
  });

  it('adiciona item no carrinho e incrementa badge', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'add-product-a' }));
    expect(toast.success).toHaveBeenCalled();
    expect(document.querySelector('#nav-cart-count-badge')?.textContent).toBe('1');
  });

  it('adiciona item existente e dispara toast de atualização de quantidade', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'add-product-a' }));
    await user.click(screen.getByRole('button', { name: 'add-product-a-again' }));

    expect(toast.info).toHaveBeenCalled();
    expect(document.querySelector('#nav-cart-count-badge')?.textContent).toBe('3');
  });

  it('suporta carrinho com vários produtos distintos', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'add-product-a' }));
    await user.click(screen.getByRole('button', { name: 'add-product-b' }));

    expect(document.querySelector('#nav-cart-count-badge')?.textContent).toBe('2');
    expect(toast.success).toHaveBeenCalledTimes(2);
  });

  it('na rota /cart, atualiza e remove item via callbacks', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/cart');
    render(<App />);

    expect(screen.getByTestId('cart-items-count')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'update-item' }));
    expect(toast.info).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'remove-item' }));
    expect(toast.error).toHaveBeenCalled();
  });

  it('protege rota /thank-you e redireciona para login quando não autenticado', () => {
    window.history.pushState({}, '', '/thank-you');
    render(<App />);
    expect(screen.getByText('Login Mock')).toBeInTheDocument();
  });
});
