import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThankYouPage from '../../components/ThankYouPage';

const navigateMock = vi.fn();
let locationState = { state: {} };
let writeTextMock;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationState,
  };
});

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key, params = {}) => {
      if (params.total) return `Total: R$ ${params.total}`;
      if (params.method) return `Forma de pagamento: ${params.method}`;
      return key;
    },
  }),
}));

describe('ThankYouPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locationState = {
      state: {
        cartItems: [
          { id: 1, name: 'Mouse', quantity: 2, price: 50 },
          { id: 2, name: 'Teclado', quantity: 1, price: 100 },
        ],
        order: {
          id: 10,
          payments: [
            {
              method: 'pix',
              metadata: {
                qrCodeImage: 'https://img.local/pix.png',
                pixCode: 'PIX-CODE-123',
                readableText: 'Valor ao ler QR Code: R$ 200,00',
                expiresAt: '2026-04-12T10:00:00Z',
              },
            },
            {
              method: 'boleto',
              metadata: {
                beneficiaryName: 'Empresa QA',
                beneficiaryDocument: '12.345.678/0001-95',
                dueDate: '2026-04-30T00:00:00Z',
                line: '34191.79001 01043.510047 91020.150008 8 9727002600010000',
                barcode: '34199727000010000017900101043510049102015000',
                downloadUrl: 'https://example.com/boleto.pdf',
              },
            },
          ],
        },
      },
    };

    writeTextMock = vi.fn().mockResolvedValue(undefined);
    if (!globalThis.navigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        configurable: true,
      });
    }
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });
  });

  it('TC_TY_001: renderiza resumo de pedido e total calculado', () => {
    render(<ThankYouPage />);

    expect(screen.getByText('thank_you.title')).toBeInTheDocument();
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.getByText('Teclado')).toBeInTheDocument();
    expect(screen.getByText('Total: R$ 200.00')).toBeInTheDocument();
    expect(screen.getByText('Forma de pagamento: PIX + Boleto')).toBeInTheDocument();
  });

  it('TC_TY_002: renderiza blocos PIX e boleto com metadados', () => {
    render(<ThankYouPage />);

    expect(screen.getByText('thank_you.pix.title')).toBeInTheDocument();
    expect(screen.getByText('PIX-CODE-123')).toBeInTheDocument();
    expect(screen.getByText('thank_you.boleto.title')).toBeInTheDocument();
    expect(screen.getByText('Empresa QA')).toBeInTheDocument();
  });

  it('TC_TY_003: copia linha do boleto e código PIX', async () => {
    const user = userEvent.setup();
    render(<ThankYouPage />);

    const copyPix = screen.getByRole('button', { name: 'thank_you.pix.copy' });
    const copyBoleto = screen.getByRole('button', { name: 'thank_you.boleto.copy' });

    await user.click(copyPix);
    await user.click(copyBoleto);

    expect(screen.getByRole('button', { name: 'thank_you.pix.copy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'thank_you.boleto.copy' })).toBeInTheDocument();
  });

  it('TC_TY_004: botão voltar ao catálogo dispara navegação', async () => {
    const user = userEvent.setup();
    render(<ThankYouPage />);

    await user.click(screen.getByRole('button', { name: 'thank_you.back' }));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('TC_TY_005: funciona sem itens/pagamentos extras', () => {
    locationState = { state: { order: { id: 20, payments: [] }, cartItems: [] } };
    render(<ThankYouPage />);

    expect(screen.getByText('thank_you.title')).toBeInTheDocument();
    expect(screen.queryByText('thank_you.summary')).not.toBeInTheDocument();
    expect(screen.queryByText('thank_you.pix.title')).not.toBeInTheDocument();
    expect(screen.queryByText('thank_you.boleto.title')).not.toBeInTheDocument();
  });
});
