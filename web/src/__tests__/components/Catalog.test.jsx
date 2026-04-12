import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Catalog from '../../components/Catalog';

const productRenderSpy = vi.fn();

vi.mock('../../components/Product', () => ({
  default: ({ product }) => {
    productRenderSpy(product);
    return <div data-testid={`product-${product.id}`}>{product.name}</div>;
  },
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key, params = {}) => {
      const dict = {
        'catalog.title': 'Catálogo de Produtos',
        'catalog.search_placeholder': 'Pesquisar produtos...',
        'catalog.products_found': `${params.count ?? 0} produto${params.plural ?? ''} encontrado${params.plural ?? ''}`,
        'catalog.no_products': 'Nenhum produto encontrado.',
        'catalog.all_categories': 'Todos',
      };
      return dict[key] ?? key;
    },
  }),
}));

import { getProducts } from '../../db/api';
vi.mock('../../db/api', () => ({
  getProducts: vi.fn(),
}));

describe('Catalog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC_CAT_001: exibe loader e depois renderiza produtos', async () => {
    let resolveProducts;
    const delayedPromise = new Promise((resolve) => {
      resolveProducts = resolve;
    });
    getProducts.mockReturnValueOnce(delayedPromise);

    render(<Catalog />);
    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();

    resolveProducts([{ id: 1, name: 'Mouse Gamer', category: 'Games', price: 100 }]);

    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
    });
  });

  it('TC_CAT_002: trata retorno não-array da API como lista vazia', async () => {
    getProducts.mockResolvedValueOnce({ invalid: true });

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    });
  });

  it('TC_CAT_003: aplica filtro por busca textual', async () => {
    getProducts.mockResolvedValueOnce([
      { id: 1, name: 'Teclado Mecânico', category: 'Games', price: 400 },
      { id: 2, name: 'Livro de QA', category: 'Livros', price: 50 },
    ]);

    render(<Catalog search="Livro" />);

    await waitFor(() => {
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
      expect(screen.queryByTestId('product-1')).not.toBeInTheDocument();
    });
  });

  it('TC_CAT_004: altera categoria por clique de chip e mapeia subnav', async () => {
    const user = userEvent.setup();
    const onSubnavFilterChange = vi.fn();

    getProducts.mockResolvedValueOnce([
      { id: 1, name: 'Teclado', category: 'Games', price: 100 },
      { id: 2, name: 'Livro', category: 'Livros', price: 90 },
      { id: 3, name: 'Top', category: 'Mais Vendidos', price: 80 },
    ]);

    render(<Catalog onSubnavFilterChange={onSubnavFilterChange} />);

    await waitFor(() => expect(screen.getByText('Games')).toBeInTheDocument());

    await user.click(screen.getByText('Games'));
    await user.click(screen.getByText('Livros'));
    await user.click(screen.getByText('Mais Vendidos'));
    await user.click(screen.getByText('Todos'));

    expect(onSubnavFilterChange).toHaveBeenCalledWith('games');
    expect(onSubnavFilterChange).toHaveBeenCalledWith('livros');
    expect(onSubnavFilterChange).toHaveBeenCalledWith('mais-vendidos');
    expect(onSubnavFilterChange).toHaveBeenCalledWith('all');
  });

  it('TC_CAT_005: aplica filtro de subnav por categoria games/livros', async () => {
    getProducts.mockResolvedValue([
      { id: 1, name: 'Console', description: 'Game', category: 'Games', manufacturer: 'X', price: 3000 },
      { id: 2, name: 'Livro QA', description: 'Teste', category: 'Livros', manufacturer: 'Y', price: 60 },
    ]);

    const { rerender } = render(<Catalog selectedSubnavFilter="games" />);
    await waitFor(() => expect(screen.getByTestId('product-1')).toBeInTheDocument());
    expect(screen.queryByTestId('product-2')).not.toBeInTheDocument();

    rerender(<Catalog selectedSubnavFilter="livros" />);
    await waitFor(() => expect(screen.getByTestId('product-2')).toBeInTheDocument());
  });

  it('TC_CAT_006: aplica lógica de ofertas do dia com desconto', async () => {
    getProducts.mockResolvedValueOnce([
      { id: 1, name: 'Headset', description: 'oferta imperdível', category: 'Games', manufacturer: 'QA', price: 200 },
    ]);

    render(<Catalog selectedSubnavFilter="ofertas-dia" />);

    await waitFor(() => {
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
    });

    const renderedProduct = productRenderSpy.mock.calls.at(-1)?.[0];
    expect(renderedProduct.originalPrice).toBe(200);
    expect(renderedProduct.price).toBe(180);
    expect(renderedProduct.discountPercentage).toBe(10);
  });

  it('TC_CAT_007: suporta filtros subnav alternativos (venda-amazon e chega-15-min)', async () => {
    getProducts.mockResolvedValue([
      { id: 1, name: 'Produto Amazon Prime', description: 'entrega rapida', category: 'Venda na Amazon', manufacturer: 'Amazon', price: 100, deliveryMinutes: 10 },
      { id: 2, name: 'Produto Normal', description: 'sem oferta', category: 'Outros', manufacturer: 'Outra', price: 100, deliveryMinutes: 60 },
    ]);

    const { rerender } = render(<Catalog selectedSubnavFilter="venda-amazon" />);
    await waitFor(() => expect(screen.getByTestId('product-1')).toBeInTheDocument());
    expect(screen.queryByTestId('product-2')).not.toBeInTheDocument();

    rerender(<Catalog selectedSubnavFilter="chega-15-min" />);
    await waitFor(() => expect(screen.getByTestId('product-1')).toBeInTheDocument());
  });

  it('TC_CAT_008: quando API falha, exibe fallback vazio', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getProducts.mockRejectedValueOnce(new Error('db offline'));

    render(<Catalog />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    });

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('TC_CAT_009: atualiza busca via setSearch', async () => {
    const user = userEvent.setup();
    const setSearch = vi.fn();
    getProducts.mockResolvedValueOnce([]);

    render(<Catalog search="" setSearch={setSearch} />);

    await user.type(screen.getByPlaceholderText('Pesquisar produtos...'), 'mouse');
    expect(setSearch).toHaveBeenCalled();
  });
});
