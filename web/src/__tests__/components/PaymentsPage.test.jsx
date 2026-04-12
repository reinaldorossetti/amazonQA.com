import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import PaymentsPage from '../../components/PaymentsPage';
import { createOrderPayment } from '../../db/api';

const navigateMock = vi.fn();
let locationState = {
  state: {
    order: { id: 10, grand_total: 199.9 },
    cartItems: [{ id: 1, name: 'Produto', quantity: 1, price: 199.9 }],
  },
};

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

vi.mock('../../db/api', () => ({
  createOrderPayment: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationState,
  };
});

describe('PaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationState = {
      state: {
        order: { id: 10, grand_total: 199.9 },
        cartItems: [{ id: 1, name: 'Produto', quantity: 1, price: 199.9 }],
      },
    };

    createOrderPayment.mockResolvedValue({
      id: 1,
      order_id: 10,
      method: 'credit',
      amount: 199.9,
      status: 'authorized',
    });
  });

  it('renderiza tela de pagamentos com resumo e métodos', () => {
    render(<PaymentsPage />);

    expect(screen.getByText('payments.title')).toBeInTheDocument();
    expect(screen.getByText('payments.summary')).toBeInTheDocument();
    expect(screen.getByText('#10')).toBeInTheDocument();
  });

  it('habilita split payment e exibe campos adicionais', async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByLabelText('payments.split.enable'));

    expect(screen.getAllByText('payments.split.second_method').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('payments.split.first_amount')).toBeInTheDocument();
  });

  it('envia pagamento simples e navega para thank-you', async () => {
    const user = userEvent.setup();
    const clearCart = vi.fn();

    render(<PaymentsPage clearCart={clearCart} />);
    await user.click(screen.getByRole('button', { name: /payments.cta.pay_now/i }));

    expect(createOrderPayment).toHaveBeenCalledTimes(1);
    expect(clearCart).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith('/thank-you', expect.anything());
    expect(toast.success).toHaveBeenCalledWith('payments.success');
  });

  it('mostra erro e não navega quando pagamento falha', async () => {
    const user = userEvent.setup();
    createOrderPayment.mockResolvedValueOnce({
      id: 2,
      status: 'failed',
      method: 'credit',
      amount: 199.9,
    });

    render(<PaymentsPage />);
    await user.click(screen.getByRole('button', { name: /payments.cta.pay_now/i }));

    expect(toast.error).toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalledWith('/thank-you', expect.anything());
  });

  it('gera boleto mockado e navega com dados do boleto', async () => {
    const user = userEvent.setup();
    createOrderPayment.mockResolvedValueOnce({
      id: 9,
      order_id: 10,
      method: 'boleto',
      amount: 199.9,
      status: 'pending',
      metadata: {
        beneficiaryName: 'Empresa Mock de Cobranças LTDA',
        beneficiaryDocument: '12.345.678/0001-95',
        line: '34191.79001 01043.510047 91020.150008 8 9727002600010000',
      },
    });

    render(<PaymentsPage />);
    await user.click(screen.getByText('Boleto'));
    await user.click(screen.getByRole('button', { name: /payments.cta.generate_boleto/i }));

    expect(createOrderPayment).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ method: 'boleto' })
    );
    expect(toast.info).toHaveBeenCalledWith('payments.pending');
    expect(navigateMock).toHaveBeenCalledWith('/thank-you', {
      state: expect.objectContaining({
        order: expect.objectContaining({
          payments: expect.arrayContaining([
            expect.objectContaining({
              method: 'boleto',
              metadata: expect.objectContaining({ beneficiaryDocument: '12.345.678/0001-95' }),
            }),
          ]),
        }),
      }),
    });
  });

  it('redireciona para carrinho quando não há pedido na navegação', async () => {
    locationState = { state: { cartItems: [] } };

    render(<PaymentsPage />);

    expect(screen.getByText('payments.error.no_order')).toBeInTheDocument();
  });

  it('valida split com valor inválido e bloqueia envio', async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByLabelText('payments.split.enable'));
    const firstAmountInput = screen.getByLabelText('payments.split.first_amount');
    await user.clear(firstAmountInput);
    await user.type(firstAmountInput, '0');
    await user.click(screen.getByRole('button', { name: /payments.cta.pay_now/i }));

    expect(toast.error).toHaveBeenCalledWith('payments.error.invalid_split');
    expect(createOrderPayment).not.toHaveBeenCalled();
  });

  it('valida split com métodos iguais e bloqueia envio', async () => {
    const user = userEvent.setup();
    render(<PaymentsPage />);

    await user.click(screen.getByLabelText('payments.split.enable'));
    await user.click(screen.getByRole('button', { name: /pix aprovação rápida/i }));
    await user.click(screen.getByRole('button', { name: /payments.cta.generate_pix/i }));

    expect(toast.error).toHaveBeenCalledWith('payments.error.same_method');
    expect(createOrderPayment).not.toHaveBeenCalled();
  });

  it('interrompe fluxo quando segundo pagamento do split falha', async () => {
    const user = userEvent.setup();
    createOrderPayment
      .mockResolvedValueOnce({ id: 1, status: 'authorized', method: 'credit', amount: 100 })
      .mockResolvedValueOnce({ id: 2, status: 'failed', method: 'pix', amount: 99.9 });

    render(<PaymentsPage />);

    await user.click(screen.getByLabelText('payments.split.enable'));
    await user.click(screen.getByRole('button', { name: /payments.cta.pay_now/i }));

    expect(toast.error).toHaveBeenCalledWith('Segundo pagamento negado. Ajuste os métodos e tente novamente.');
    expect(navigateMock).not.toHaveBeenCalledWith('/thank-you', expect.anything());
  });

  it('captura exceção do backend e mostra fallback de erro', async () => {
    const user = userEvent.setup();
    createOrderPayment.mockRejectedValueOnce(new Error('Falha inesperada no gateway'));

    render(<PaymentsPage />);
    await user.click(screen.getByRole('button', { name: /payments.cta.pay_now/i }));

    expect(toast.error).toHaveBeenCalledWith('Falha inesperada no gateway');
  });
});
