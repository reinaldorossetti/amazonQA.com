import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../../App';

describe('Admin routes access control', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    globalThis.__TEST_AUTH_CONTEXT__ = null;
  });

  afterEach(() => {
    globalThis.__TEST_AUTH_CONTEXT__ = null;
  });

  it('redireciona usuário não-admin de /minha-conta/admin para home da conta', async () => {
    globalThis.__TEST_AUTH_CONTEXT__ = {
      user: { id: 10, name: 'User', isAdmin: false },
      token: 'token-user',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      isLoggedIn: true,
      isLoading: false,
    };

    window.history.pushState({}, '', '/minha-conta/admin');
    render(<App />);

    expect(await screen.findByText('Bem-vindo à sua área logada')).toBeInTheDocument();
    expect(screen.queryByText('Área administrativa')).not.toBeInTheDocument();
  });

  it('permite acesso admin em /minha-conta/admin', async () => {
    globalThis.__TEST_AUTH_CONTEXT__ = {
      user: { id: 1, name: 'Admin', isAdmin: true },
      token: 'token-admin',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
      isLoggedIn: true,
      isLoading: false,
    };

    window.history.pushState({}, '', '/minha-conta/admin');
    render(<App />);

    expect(await screen.findByText('Área administrativa')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar produtos')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar usuários')).toBeInTheDocument();
  });
});