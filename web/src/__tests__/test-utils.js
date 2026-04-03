import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, createContext, useContext, useReducer } from 'vitest';
import React from 'react';

// Criar contextos vazios de teste
const TestAuthContext = React.createContext({
  user: null,
  token: null,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false,
  isLoading: false,
});

const TestLanguageContext = React.createContext({
  language: 'pt',
  setLanguage: vi.fn(),
  t: (key) => key,
  formatCurrency: (value) => `R$ ${value.toFixed(2)}`,
  formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
});

const TestDatabaseContext = React.createContext({
  createCollection: vi.fn(),
  addDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getDocument: vi.fn(),
  query: vi.fn(),
});

export function renderWithProviders(component, options = {}) {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <TestAuthContext.Provider value={{ user: null, token: null, login: vi.fn(), logout: vi.fn(), isAuthenticated: false, isLoading: false }}>
        <TestLanguageContext.Provider value={{ language: 'pt', setLanguage: vi.fn(), t: (key) => key, formatCurrency: (value) => `R$ ${value.toFixed(2)}`, formatDate: (date) => new Date(date).toLocaleDateString('pt-BR') }}>
          <TestDatabaseContext.Provider value={{ createCollection: vi.fn(), addDocument: vi.fn(), updateDocument: vi.fn(), deleteDocument: vi.fn(), getDocument: vi.fn(), query: vi.fn() }}>
            {children}
          </TestDatabaseContext.Provider>
        </TestLanguageContext.Provider>
      </TestAuthContext.Provider>
    </BrowserRouter>
  );

  return render(component, { wrapper: Wrapper, ...options });
}

export function renderWithRouter(component, options = {}) {
  const Wrapper = ({ children }) => <BrowserRouter>{children}</BrowserRouter>;
  return render(component, { wrapper: Wrapper, ...options });
}

export const mockUseNavigate = () => vi.fn();
export const mockUseParams = (params = {}) => params;
export const mockUseLocation = (state = {}) => ({
  pathname: '/',
  search: '',
  hash: '',
  state,
});
