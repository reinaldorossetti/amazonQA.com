import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import AdminUsersPage from '../../../components/admin/AdminUsersPage';
import { deleteUserByIdAdmin, getUsersAdmin } from '../../../db/api';

const authState = {
  user: { id: 1 },
};

vi.mock('../../../db/api', () => ({
  getUsersAdmin: vi.fn(),
  deleteUserByIdAdmin: vi.fn(),
}));

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { id: 1 };
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('carrega usuários com paginação e ordena por id', async () => {
    getUsersAdmin
      .mockResolvedValueOnce({ total: 101, pageSize: 100, items: [{ id: 100, first_name: 'A', last_name: 'A', email: 'a@test.com' }] })
      .mockResolvedValueOnce({ items: [{ id: 3, first_name: 'Carol', last_name: 'QA', email: 'carol@test.com' }, { id: 2, first_name: 'Bob', last_name: 'QA', email: 'bob@test.com' }] });

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(getUsersAdmin).toHaveBeenNthCalledWith(1, { page: 1, pageSize: 100, status: 'all' });
      expect(getUsersAdmin).toHaveBeenNthCalledWith(2, { page: 2, pageSize: 100, status: 'all' });
      expect(screen.getByText('Bob QA')).toBeInTheDocument();
      expect(screen.getByText('Carol QA')).toBeInTheDocument();
    });
  });

  it('marca usuário logado como não removível', async () => {
    authState.user = { id: 2 };
    getUsersAdmin.mockResolvedValueOnce({ total: 1, pageSize: 100, items: [{ id: 2, first_name: 'Admin', last_name: 'Atual', email: 'admin@test.com' }] });

    render(<AdminUsersPage />);

    const button = await screen.findByRole('button', { name: /usuário atual/i });
    expect(button).toBeDisabled();
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it('exclui usuário com sucesso após confirmação', async () => {
    const user = userEvent.setup();
    getUsersAdmin.mockResolvedValueOnce({ total: 1, pageSize: 100, items: [{ id: 2, first_name: 'Bob', last_name: 'QA', email: 'bob@test.com' }] });
    deleteUserByIdAdmin.mockResolvedValueOnce({ ok: true });

    render(<AdminUsersPage />);

    await waitFor(() => expect(screen.getByText('Bob QA')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /excluir usuário/i }));

    await waitFor(() => {
      expect(deleteUserByIdAdmin).toHaveBeenCalledWith(2);
      expect(toast.success).toHaveBeenCalledWith('Usuário excluído com sucesso.');
      expect(screen.queryByText('Bob QA')).not.toBeInTheDocument();
    });
  });

  it('não exclui usuário quando confirmação é negada', async () => {
    const user = userEvent.setup();
    global.confirm.mockReturnValueOnce(false);
    getUsersAdmin.mockResolvedValueOnce({ total: 1, pageSize: 100, items: [{ id: 2, first_name: 'Bob', last_name: 'QA', email: 'bob@test.com' }] });

    render(<AdminUsersPage />);

    await waitFor(() => expect(screen.getByText('Bob QA')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /excluir usuário/i }));

    expect(deleteUserByIdAdmin).not.toHaveBeenCalled();
  });

  it('exibe erro quando carregamento inicial falha', async () => {
    getUsersAdmin.mockRejectedValueOnce(new Error('Falha ao carregar usuários'));

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(screen.getByText('Falha ao carregar usuários')).toBeInTheDocument();
    });
  });
});
