import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import AccountLayout from '../../../components/account/AccountLayout';
import AccountHome from '../../../components/account/AccountHome';
import UserProfilePage from '../../../components/account/UserProfilePage';
import UserAddressPage from '../../../components/account/UserAddressPage';
import OrdersPage from '../../../components/account/OrdersPage';
import OrderDetailsPage from '../../../components/account/OrderDetailsPage';

import {
  getMe,
  updateMyAddress,
  getMyOrders,
  getMyOrderById,
} from '../../../db/api';
import { toast } from 'react-toastify';

vi.mock('../../../db/api', () => ({
  getMe: vi.fn(),
  updateMyAddress: vi.fn(),
  getMyOrders: vi.fn(),
  getMyOrderById: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Account pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza cards principais no AccountHome', () => {
    render(
      <MemoryRouter>
        <AccountHome />
      </MemoryRouter>
    );

    expect(screen.getByText('Meus pedidos')).toBeInTheDocument();
    expect(screen.getByText('Meu perfil')).toBeInTheDocument();
  });

  it('carrega perfil do usuário na tela de dados', async () => {
    getMe.mockResolvedValueOnce({
      first_name: 'Reinaldo',
      last_name: 'Rossetti',
      email: 'reinaldo@test.com',
      person_type: 'PF',
      phone: '11999999999',
    });

    render(
      <MemoryRouter>
        <UserProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Reinaldo Rossetti/)).toBeInTheDocument();
    });
  });

  it('edita endereço e envia atualização', async () => {
    const user = userEvent.setup();

    getMe.mockResolvedValueOnce({
      address_zip: '01001000',
      address_street: 'Rua Teste',
      address_number: '10',
      address_complement: '',
      address_neighborhood: 'Centro',
      address_city: 'São Paulo',
      address_state: 'SP',
    });
    updateMyAddress.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <UserAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo');
    });

    await user.clear(screen.getByLabelText('Cidade'));
    await user.type(screen.getByLabelText('Cidade'), 'Campinas');
    await user.click(screen.getByRole('button', { name: 'Salvar endereço' }));

    await waitFor(() => {
      expect(updateMyAddress).toHaveBeenCalledWith(expect.objectContaining({ address_city: 'Campinas' }));
    });
  });

  it('exibe erro quando falha ao salvar endereço', async () => {
    const user = userEvent.setup();

    getMe.mockResolvedValueOnce({
      address_zip: '01001000',
      address_street: 'Rua Teste',
      address_number: '10',
      address_complement: '',
      address_neighborhood: 'Centro',
      address_city: 'São Paulo',
      address_state: 'SP',
    });
    updateMyAddress.mockRejectedValueOnce(new Error('Falha ao salvar endereço'));

    render(
      <MemoryRouter>
        <UserAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo');
    });

    await user.click(screen.getByRole('button', { name: 'Salvar endereço' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Falha ao salvar endereço');
    });
  });

  it('aplica fallback para campos vazios quando dados de endereço não existem', async () => {
    getMe.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <UserAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Cidade')).toHaveValue('');
      expect(screen.getByLabelText('CEP')).toHaveValue('');
      expect(screen.getByLabelText('Rua')).toHaveValue('');
    });
  });

  it('usa mensagem fallback ao falhar carregamento de endereço sem message', async () => {
    getMe.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <UserAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar endereço')).toBeInTheDocument();
    });
  });

  it('usa mensagem fallback ao falhar atualização sem message', async () => {
    const user = userEvent.setup();

    getMe.mockResolvedValueOnce({ address_city: 'São Paulo' });
    updateMyAddress.mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <UserAddressPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Cidade')).toHaveValue('São Paulo');
    });

    await user.click(screen.getByRole('button', { name: 'Salvar endereço' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar endereço');
    });
  });

  it('lista pedidos na tela de pedidos', async () => {
    getMyOrders.mockResolvedValueOnce({
      items: [
        {
          id: 101,
          order_number: 'ORD-20260330-000101',
          status: 'created',
          grand_total: 199.9,
        },
      ],
    });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ORD-20260330-000101/)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando usuário não possui pedidos', async () => {
    getMyOrders.mockResolvedValueOnce({ items: [] });

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Você ainda não possui pedidos.')).toBeInTheDocument();
    });
  });

  it('exibe erro ao falhar carregamento de pedidos', async () => {
    getMyOrders.mockRejectedValueOnce(new Error('Falha ao buscar pedidos'));

    render(
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Falha ao buscar pedidos')).toBeInTheDocument();
    });
  });

  it('exibe detalhe do pedido e itens', async () => {
    getMyOrderById.mockResolvedValueOnce({
      id: 101,
      order_number: 'ORD-20260330-000101',
      status: 'created',
      grand_total: 299.9,
      items: [
        { id: 1, product_id: 5, product_name_snapshot: 'Notebook', quantity: 1, line_total: 299.9 },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/minha-conta/pedidos/101']}>
        <Routes>
          <Route path="/minha-conta/pedidos/:id" element={<OrderDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Notebook/)).toBeInTheDocument();
    });
  });

  it('exibe alerta quando detalhe do pedido retorna nulo', async () => {
    getMyOrderById.mockResolvedValueOnce(null);

    render(
      <MemoryRouter initialEntries={['/minha-conta/pedidos/999']}>
        <Routes>
          <Route path="/minha-conta/pedidos/:id" element={<OrderDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pedido não encontrado.')).toBeInTheDocument();
    });
  });

  it('exibe erro ao falhar carregamento do detalhe do pedido', async () => {
    getMyOrderById.mockRejectedValueOnce(new Error('Erro detalhe'));

    render(
      <MemoryRouter initialEntries={['/minha-conta/pedidos/555']}>
        <Routes>
          <Route path="/minha-conta/pedidos/:id" element={<OrderDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Erro detalhe')).toBeInTheDocument();
    });
  });

  it('exibe erro quando falha ao carregar perfil do usuário', async () => {
    getMe.mockRejectedValueOnce(new Error('Erro de perfil'));

    render(
      <MemoryRouter>
        <UserProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Erro de perfil')).toBeInTheDocument();
    });
  });

  it('renderiza layout com menu da conta', () => {
    render(
      <MemoryRouter initialEntries={['/minha-conta']}>
        <Routes>
          <Route path="/minha-conta" element={<AccountLayout />}>
            <Route index element={<div>Conteúdo</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Minha conta')).toBeInTheDocument();
    expect(screen.getByText('Resumo da conta')).toBeInTheDocument();
  });
});
