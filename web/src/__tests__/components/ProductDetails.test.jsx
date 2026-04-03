import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductDetails from '../../components/ProductDetails';
import { getProductById } from '../../db/api';
import { createMockProduct } from '../fixtures';

const navigateMock = vi.fn();
const paramsMock = { id: '1' };

vi.mock('../../db/api', () => ({
  getProductById: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => paramsMock,
  };
});

const renderWithRouter = (component) => render(<MemoryRouter>{component}</MemoryRouter>);

describe('ProductDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paramsMock.id = '1';
  });

  it('TC_PD_001: mostra estado de carregamento enquanto busca o produto', () => {
    getProductById.mockReturnValue(new Promise(() => {}));

    renderWithRouter(<ProductDetails onAddToCart={vi.fn()} />);

    expect(screen.getByText('Carregando detalhes...')).toBeInTheDocument();
    expect(getProductById).toHaveBeenCalledWith('1');
  });

  it('TC_PD_002: renderiza fallback de produto não encontrado e permite voltar', async () => {
    getProductById.mockResolvedValue(null);

    renderWithRouter(<ProductDetails onAddToCart={vi.fn()} />);

    expect(await screen.findByText('product_details.not_found')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'product_details.back' }));
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('TC_PD_003: em erro de API, registra console.error e exibe tela de não encontrado', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getProductById.mockRejectedValue(new Error('boom'));

    renderWithRouter(<ProductDetails onAddToCart={vi.fn()} />);

    expect(await screen.findByText('product_details.not_found')).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('TC_PD_004: renderiza detalhes completos e chama addToCart com quantidade alterada', async () => {
    const onAddToCart = vi.fn();
    const product = createMockProduct({
      id: 1,
      name: 'Notebook QA',
      description: 'Descrição detalhada',
      image: 'https://img.local/notebook.png',
      price: 1999.9,
      manufacturer: 'QA Corp',
      line: 'Pro Line',
      model: 'QAX-2026',
    });
    getProductById.mockResolvedValue(product);

    renderWithRouter(<ProductDetails onAddToCart={onAddToCart} />);

    expect(await screen.findByRole('heading', { name: 'Notebook QA' })).toBeInTheDocument();
    expect(screen.getByText('R$ 1999.90')).toBeInTheDocument();
    expect(screen.getByText('Descrição detalhada')).toBeInTheDocument();
    expect(screen.getByText('QA Corp')).toBeInTheDocument();
    expect(screen.getByText('Pro Line')).toBeInTheDocument();
    expect(screen.getByText('QAX-2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'product_details.back' }));
    expect(navigateMock).toHaveBeenCalledWith('/');

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: '3' }));

    fireEvent.click(screen.getByRole('button', { name: 'product.add_to_cart' }));

    expect(onAddToCart).toHaveBeenCalledWith(product, 3);
  });

  it('TC_PD_005: não renderiza linhas opcionais quando manufacturer/line/model não existem', async () => {
    const product = createMockProduct({
      id: 2,
      name: 'Mouse',
      description: 'Sem metadados opcionais',
      image: 'https://img.local/mouse.png',
      price: 99.99,
      manufacturer: undefined,
      line: undefined,
      model: undefined,
    });
    getProductById.mockResolvedValue(product);

    renderWithRouter(<ProductDetails onAddToCart={vi.fn()} />);

    await screen.findByRole('heading', { name: 'Mouse' });

    expect(screen.queryByText('product_details.manufacturer:')).not.toBeInTheDocument();
    expect(screen.queryByText('product_details.line:')).not.toBeInTheDocument();
    expect(screen.queryByText('product_details.model:')).not.toBeInTheDocument();
  });

  it('TC_PD_006: busca novamente quando o id da rota muda', async () => {
    getProductById.mockResolvedValue(createMockProduct({ id: 1, name: 'Produto 1', image: 'img-1', price: 10 }));

    const { rerender } = renderWithRouter(<ProductDetails onAddToCart={vi.fn()} />);
    await screen.findByRole('heading', { name: 'Produto 1' });

    paramsMock.id = '2';
    getProductById.mockResolvedValue(createMockProduct({ id: 2, name: 'Produto 2', image: 'img-2', price: 20 }));

    rerender(
      <MemoryRouter>
        <ProductDetails onAddToCart={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getProductById).toHaveBeenCalledWith('2');
    });
    expect(await screen.findByRole('heading', { name: 'Produto 2' })).toBeInTheDocument();
  });
});
