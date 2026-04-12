import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import AdminProductsPage from '../../../components/admin/AdminProductsPage';
import { deleteProductByIdAdmin, getProducts } from '../../../db/api';

vi.mock('../../../db/api', () => ({
  getProducts: vi.fn(),
  deleteProductByIdAdmin: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('carrega e renderiza produtos em ordem alfabética', async () => {
    getProducts.mockResolvedValueOnce([
      { id: 20, name: 'Zeta', category: 'Outros' },
      { id: 10, name: 'Alpha', category: 'Eletrônicos' },
    ]);

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Zeta')).toBeInTheDocument();
    });

    const cards = screen.getAllByRole('button', { name: /excluir produto/i });
    expect(cards).toHaveLength(2);
  });

  it('não exclui produto quando confirmação é cancelada', async () => {
    const user = userEvent.setup();
    global.confirm.mockReturnValueOnce(false);
    getProducts.mockResolvedValueOnce([{ id: 10, name: 'Alpha', category: 'Eletrônicos' }]);

    render(<AdminProductsPage />);

    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /excluir produto/i }));

    expect(deleteProductByIdAdmin).not.toHaveBeenCalled();
  });

  it('exclui produto com sucesso e remove da lista', async () => {
    const user = userEvent.setup();
    getProducts.mockResolvedValueOnce([{ id: 10, name: 'Alpha', category: 'Eletrônicos' }]);
    deleteProductByIdAdmin.mockResolvedValueOnce({ ok: true });

    render(<AdminProductsPage />);

    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /excluir produto/i }));

    await waitFor(() => {
      expect(deleteProductByIdAdmin).toHaveBeenCalledWith(10);
      expect(toast.success).toHaveBeenCalledWith('Produto excluído com sucesso.');
      expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    });
  });

  it('exibe toast de erro quando exclusão falha', async () => {
    const user = userEvent.setup();
    getProducts.mockResolvedValueOnce([{ id: 10, name: 'Alpha', category: 'Eletrônicos' }]);
    deleteProductByIdAdmin.mockRejectedValueOnce(new Error('Falha ao excluir no backend'));

    render(<AdminProductsPage />);

    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /excluir produto/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Falha ao excluir no backend');
      expect(screen.getByRole('button', { name: /excluir produto/i })).toBeEnabled();
    });
  });

  it('exibe alerta quando falha ao carregar produtos', async () => {
    getProducts.mockRejectedValueOnce(new Error('Erro ao carregar produtos admin'));

    render(<AdminProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar produtos admin')).toBeInTheDocument();
    });
  });
});
