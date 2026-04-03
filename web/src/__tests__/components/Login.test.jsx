import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../components/Login';
import { loginUser } from '../../db/api';
import { toast } from 'react-toastify';

const navigateMock = vi.fn();
const authLoginMock = vi.fn();
const locationMock = { search: '' };

vi.mock('../../db/api', () => ({
  loginUser: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: authLoginMock,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationMock,
  };
});

const renderWithRouter = () => render(<MemoryRouter><Login /></MemoryRouter>);

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    locationMock.search = '';
  });

  it('TC_LOGIN_001: renderiza campos, botão de submit e link de registro', () => {
    renderWithRouter();

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Criar sua conta' })).toHaveAttribute('href', '/register');
  });

  it('TC_LOGIN_002: valida campos obrigatórios e exibe alerta de erro', async () => {
    renderWithRouter();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Preencha e-mail e senha.')).toBeInTheDocument();
    expect(loginUser).not.toHaveBeenCalled();
  });

  it('TC_LOGIN_003: alterna visibilidade da senha', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const passwordInput = screen.getByLabelText('Senha');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getAllByRole('button').find((btn) => btn.querySelector('svg'));
    await user.click(toggleBtn);
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');

    await user.click(toggleBtn);
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('TC_LOGIN_004: realiza login com sucesso, normaliza email e navega para ?next', async () => {
    const user = userEvent.setup();
    locationMock.search = '?next=%2Fcart';
    loginUser.mockResolvedValue({
      accessToken: 'token-123',
      user: {
        id: 7,
        first_name: 'Reinaldo',
        last_name: 'Rossetti',
        email: 'rei@test.com',
        person_type: 'PF',
      },
    });

    renderWithRouter();

    await user.type(screen.getByLabelText('E-mail'), '  REI@TEST.COM  ');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({ email: 'rei@test.com', password: '123456' });
    });
    expect(authLoginMock).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({
        id: 7,
        name: 'Reinaldo',
        lastName: 'Rossetti',
        email: 'rei@test.com',
        personType: 'PF',
        roles: [],
        isAdmin: false,
      }),
      accessToken: 'token-123',
    }));
    expect(toast.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/cart');
  });

  it('TC_LOGIN_005: usa fallback de rota "/minha-conta" quando ?next não existe', async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValue({
      accessToken: 'token-xyz',
      user: {
        id: 1,
        first_name: 'Ana',
        last_name: 'QA',
        email: 'ana@test.com',
        person_type: 'PJ',
      },
    });

    renderWithRouter();

    await user.type(screen.getByLabelText('E-mail'), 'ana@test.com');
    await user.type(screen.getByLabelText('Senha'), 'abc123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/minha-conta');
    });
  });

  it('TC_LOGIN_006: trata resposta sem token como erro de autenticação inválida', async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValue({
      user: {
        id: 9,
        first_name: 'NoToken',
        last_name: 'User',
        email: 'nt@test.com',
        person_type: 'PF',
      },
    });

    renderWithRouter();

    await user.type(screen.getByLabelText('E-mail'), 'nt@test.com');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Resposta de autenticação inválida: token não recebido.')).toBeInTheDocument();
    expect(authLoginMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('TC_LOGIN_007: usa mensagem fallback quando erro não possui message', async () => {
    const user = userEvent.setup();
    loginUser.mockRejectedValue({});

    renderWithRouter();

    await user.type(screen.getByLabelText('E-mail'), 'fallback@test.com');
    await user.type(screen.getByLabelText('Senha'), '123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Credenciais inválidas. Tente novamente.')).toBeInTheDocument();
  });

  it('TC_LOGIN_008: exibe estado de loading durante requisição e limpa no finally', async () => {
    const user = userEvent.setup();
    let resolveRequest;
    loginUser.mockReturnValue(new Promise((resolve) => {
      resolveRequest = resolve;
    }));

    renderWithRouter();

    await user.type(screen.getByLabelText('E-mail'), 'load@test.com');
    await user.type(screen.getByLabelText('Senha'), '123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    const loadingButton = screen.getByRole('button', { name: 'Entrando...' });
    expect(loadingButton).toBeDisabled();

    resolveRequest({
      accessToken: 'done',
      user: {
        id: 1,
        first_name: 'Load',
        last_name: 'Done',
        email: 'load@test.com',
        person_type: 'PF',
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
    });
  });

  it('TC_LOGIN_009: fecha alerta de erro pelo onClose do Alert', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('Preencha e-mail e senha.')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Preencha e-mail e senha.')).not.toBeInTheDocument();
    });
  });

  it('TC_LOGIN_010: aceita payload de login sem campo user (fallback para objeto raiz)', async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValue({
      accessToken: 'root-token',
      id: 11,
      first_name: 'Root',
      last_name: 'Payload',
      email: 'root@test.com',
      person_type: 'PF',
    });

    renderWithRouter();

    await user.type(screen.getByLabelText('E-mail'), 'root@test.com');
    await user.type(screen.getByLabelText('Senha'), '123456');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(authLoginMock).toHaveBeenCalledWith(expect.objectContaining({
        user: expect.objectContaining({
          id: 11,
          name: 'Root',
          lastName: 'Payload',
          email: 'root@test.com',
          personType: 'PF',
          roles: [],
          isAdmin: false,
        }),
        accessToken: 'root-token',
      }));
    });
  });
});
