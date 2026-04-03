import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock os contextos
vi.mock('../contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => {
    const override = globalThis.__TEST_AUTH_CONTEXT__;
    if (override) {
      return override;
    }

    return {
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      isLoggedIn: false,
      isLoading: false,
    };
  },
  AuthContext: vi.fn(),
}));

vi.mock('../contexts/LanguageContext.jsx', () => ({
  LanguageProvider: ({ children }) => children,
  useLanguage: () => ({
    language: 'pt',
    setLanguage: vi.fn(),
    t: (key) => key,
    formatCurrency: (value) => `R$ ${value.toFixed(2)}`,
    formatDate: (date) => new Date(date).toLocaleDateString('pt-BR'),
  }),
  LanguageContext: vi.fn(),
}));

vi.mock('../contexts/DatabaseContext.jsx', () => ({
  DatabaseProvider: ({ children }) => children,
  useDatabase: () => ({
    createCollection: vi.fn(),
    addDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn(),
    getDocument: vi.fn(),
    query: vi.fn(),
  }),
  DatabaseContext: vi.fn(),
}));

// Setup global mocks
setupGlobalMocks();

function setupGlobalMocks() {
  // Mock localStorage com implementação real
  if (!global.localStorage || typeof global.localStorage.getItem !== 'function') {
    const localStorageMock = (() => {
      let store = {};
      
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        removeItem: (key) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        key: (index) => {
          const keys = Object.keys(store);
          return keys[index] || null;
        },
        get length() {
          return Object.keys(store).length;
        },
      };
    })();
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  }

  // Mock sessionStorage com implementação real
  if (!global.sessionStorage || typeof global.sessionStorage.getItem !== 'function') {
    const sessionStorageMock = (() => {
      let store = {};
      
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        removeItem: (key) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        key: (index) => {
          const keys = Object.keys(store);
          return keys[index] || null;
        },
        get length() {
          return Object.keys(store).length;
        },
      };
    })();
    Object.defineProperty(global, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true,
    });
  }

  // Mock window.matchMedia
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  // Mock IntersectionObserver
  if (!global.IntersectionObserver) {
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    };
  }

  // Mock window.scrollTo
  if (!window.scrollTo) {
    window.scrollTo = vi.fn();
  }

  // Mock global fetch (sempre) para suportar rotas relativas /api/* no ambiente de teste
  global.fetch = vi.fn().mockImplementation((url) => {
    const requestUrl = String(url ?? '');

    let payload = { success: true };
    if (requestUrl.includes('/api/products')) {
      payload = [];
    } else if (requestUrl.includes('/api/users/login')) {
      payload = {
        accessToken: 'test-token',
        user: {
          id: 1,
          first_name: 'Teste',
          last_name: 'Usuário',
          email: 'teste@exemplo.com',
          person_type: 'PF',
        },
      };
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'content-type': 'application/json',
      }),
      json: () => Promise.resolve(payload),
      text: () => Promise.resolve(typeof payload === 'string' ? payload : JSON.stringify(payload)),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      clone: function() {
        return this;
      },
    });
  });

  // Suppress console warnings (non-intrusive)
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('Warning:') ||
      message.includes('esbuild') ||
      message.includes('oxc') ||
      message.includes('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
}
