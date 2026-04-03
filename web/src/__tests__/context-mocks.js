import { vi } from 'vitest';

export const createMockAuthContext = () => ({
  user: null,
  token: null,
  login: vi.fn().mockResolvedValue({}),
  logout: vi.fn(),
  isAuthenticated: false,
  isLoading: false,
  refreshToken: vi.fn(),
  updateProfile: vi.fn(),
});

export const createMockLanguageContext = () => ({
  language: 'pt',
  setLanguage: vi.fn(),
  t: (key) => key,
  formatCurrency: (value) => `R$ ${value.toFixed(2)}`,
  formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
});

export const createMockDatabaseContext = () => ({
  createCollection: vi.fn(),
  addDocument: vi.fn().mockResolvedValue({}),
  updateDocument: vi.fn().mockResolvedValue({}),
  deleteDocument: vi.fn().mockResolvedValue({}),
  getDocument: vi.fn().mockResolvedValue(null),
  query: vi.fn().mockResolvedValue([]),
  sync: vi.fn(),
});

export const mockUseAuth = (overrides = {}) => {
  return {
    ...createMockAuthContext(),
    ...overrides,
  };
};

export const mockUseLanguage = (overrides = {}) => {
  return {
    ...createMockLanguageContext(),
    ...overrides,
  };
};

export const mockUseDatabase = (overrides = {}) => {
  return {
    ...createMockDatabaseContext(),
    ...overrides,
  };
};
