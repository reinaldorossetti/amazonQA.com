import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutButton from '../../components/CheckoutButton';
import { toast } from 'react-toastify';
import { createOrder } from '../../db/api';

const navigateMock = vi.fn();
let authState = { isLoggedIn: false, isAuthenticated: false };
let locationState = { pathname: '/cart' };

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../db/api', () => ({
  createOrder: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationState,
  };
});

describe('Checkout/CheckoutButton Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState = { isLoggedIn: false, isAuthenticated: false };
    locationState = { pathname: '/cart' };
    createOrder.mockResolvedValue({
      id: 1,
      order_number: 'ORD-TEST-0001',
      status: 'created',
      items: [],
    });
  });

  it('TC_CHK_001: botão inicia desabilitado com carrinho vazio', () => {
    render(<CheckoutButton cartItems={[]} />);
    const button = screen.getByRole('button', { name: /Entrar para Finalizar/i });
    expect(button).toBeDisabled();
  });

  it('TC_CHK_002: usa LockIcon quando usuário não autenticado', () => {
    render(<CheckoutButton cartItems={[{ id: 1 }]} />);
    expect(screen.getByTestId('LockIcon')).toBeInTheDocument();
  });

  it('TC_CHK_003: usa ShoppingCartCheckoutIcon quando autenticado por isLoggedIn', () => {
    authState = { isLoggedIn: true };
    render(<CheckoutButton cartItems={[{ id: 1 }]} />);
    expect(screen.getByTestId('ShoppingCartCheckoutIcon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checkout.button/i })).toBeInTheDocument();
  });

  it('TC_CHK_004: usa fallback isAuthenticated quando isLoggedIn não existe', () => {
    authState = { isAuthenticated: true };
    render(<CheckoutButton cartItems={[{ id: 1 }]} />);
    expect(screen.getByRole('button', { name: /checkout.button/i })).toBeInTheDocument();
  });

  it('TC_CHK_005: com carrinho vazio não permite checkout (permanece desabilitado)', () => {
    render(<CheckoutButton cartItems={[]} />);
    const button = screen.getByRole('button', { name: /Entrar para Finalizar/i });
    expect(button).toBeDisabled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('TC_CHK_006: deslogado com itens redireciona para login com next', async () => {
    const user = userEvent.setup();
    locationState = { pathname: '/cart' };

    render(<CheckoutButton cartItems={[{ id: 1, quantity: 1 }]} />);
    await user.click(screen.getByRole('button', { name: /Entrar para Finalizar/i }));

    expect(toast.info).toHaveBeenCalledWith('Faça login para finalizar seu pedido.');
    expect(navigateMock).toHaveBeenCalledWith('/login?next=%2Fcart');
  });

  it('TC_CHK_007: logado com itens navega para /payments com state', async () => {
    const user = userEvent.setup();
    authState = { isLoggedIn: true };
    const cartItems = [{ id: 10, quantity: 2 }];

    render(<CheckoutButton cartItems={cartItems} />);
    await user.click(screen.getByRole('button', { name: /checkout.button/i }));

    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        idempotencyKey: expect.any(String),
        items: [{ productId: 10, quantity: 2 }],
      })
    );
    expect(toast.success).toHaveBeenCalledWith('checkout.processing');
    expect(navigateMock).toHaveBeenCalledWith('/payments', {
      state: {
        cartItems,
        order: expect.objectContaining({ id: 1, order_number: 'ORD-TEST-0001' }),
      },
    });
  });

  it('TC_CHK_008: normaliza cartItems inválido e mantém desabilitado', () => {
    render(<CheckoutButton cartItems={null} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('TC_CHK_009: codifica pathname especial no parâmetro next', async () => {
    const user = userEvent.setup();
    locationState = { pathname: '/checkout/resumo final' };

    render(<CheckoutButton cartItems={[{ id: 3 }]} />);
    await user.click(screen.getByRole('button', { name: /Entrar para Finalizar/i }));

    expect(navigateMock).toHaveBeenCalledWith('/login?next=%2Fcheckout%2Fresumo%20final');
  });

  it('TC_CHK_010: não limpa carrinho no checkout, pois pagamento ocorre na próxima etapa', async () => {
    const user = userEvent.setup();
    authState = { isLoggedIn: true };

    render(<CheckoutButton cartItems={[{ id: 9 }]} />);
    await user.click(screen.getByRole('button', { name: /checkout.button/i }));

    expect(navigateMock).toHaveBeenCalledWith('/payments', expect.anything());
  });

  it('TC_CHK_011: exibe erro e não navega quando API de orders falha', async () => {
    const user = userEvent.setup();
    authState = { isLoggedIn: true };
    createOrder.mockRejectedValueOnce(new Error('Falha ao criar pedido'));

    render(<CheckoutButton cartItems={[{ id: 1, quantity: 1 }]} />);
    await user.click(screen.getByRole('button', { name: /checkout.button/i }));

    expect(toast.error).toHaveBeenCalledWith('Falha ao criar pedido');
    expect(navigateMock).not.toHaveBeenCalledWith('/payments', expect.anything());
  });
});
