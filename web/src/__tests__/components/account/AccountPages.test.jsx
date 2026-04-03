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
