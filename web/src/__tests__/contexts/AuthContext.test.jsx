import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.unmock('../../contexts/AuthContext');
vi.unmock('../../contexts/AuthContext.jsx');

import { AuthProvider, useAuth } from '../../contexts/AuthContext';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('TC_AUTH_001: lança erro quando useAuth é usado fora do provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('use Auth must be used within an AuthProvider');
  });

  it('TC_AUTH_002: inicia deslogado sem dados persistidos', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('TC_AUTH_003: restaura sessão válida do localStorage no mount', async () => {
    const savedUser = { id: 9, name: 'Reinaldo', lastName: 'Rossetti', email: 'reinaldo@test.com', personType: 'PF' };
    localStorage.setItem('auth_user', JSON.stringify(savedUser));
    localStorage.setItem('auth_token', 'token-ok');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toMatchObject(savedUser);
      expect(result.current.user).toMatchObject({ roles: [], isAdmin: false });
      expect(result.current.accessToken).toBe('token-ok');
      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  it('TC_AUTH_004: limpa storage quando auth_user está corrompido', async () => {
    localStorage.setItem('auth_user', '{invalid-json');
    localStorage.setItem('auth_token', 'token-ok');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
    });
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('TC_AUTH_005: login persiste usuário/token e atualiza estado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const authData = {
      user: { id: 1, name: 'Ana', lastName: 'QA', email: 'ana@test.com', personType: 'PF' },
      accessToken: 'abc123',
    };

    act(() => {
      result.current.login(authData);
    });

    expect(result.current.user).toMatchObject(authData.user);
    expect(result.current.user).toMatchObject({ roles: [], isAdmin: false });
    expect(result.current.accessToken).toBe('abc123');
    expect(result.current.isLoggedIn).toBe(true);
    expect(JSON.parse(localStorage.getItem('auth_user'))).toMatchObject({
      ...authData.user,
      roles: [],
      isAdmin: false,
    });
    expect(localStorage.getItem('auth_token')).toBe('abc123');
  });

  it('TC_AUTH_006: logout remove sessão de estado e storage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({
        user: { id: 2, name: 'User', lastName: 'Two', email: 'u2@test.com', personType: 'PJ' },
        accessToken: 'tok-2',
      });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
