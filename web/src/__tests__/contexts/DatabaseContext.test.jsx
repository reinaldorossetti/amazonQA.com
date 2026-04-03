import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, renderHook } from '@testing-library/react';

vi.unmock('../../contexts/DatabaseContext');
vi.unmock('../../contexts/DatabaseContext.jsx');

vi.mock('../../db/api', () => ({
  getProducts: vi.fn(),
}));

import { DatabaseProvider, useDatabase } from '../../contexts/DatabaseContext';
import { getProducts } from '../../db/api';

describe('DatabaseContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC_DB_001: useDatabase fora do provider retorna contexto padrão', () => {
    const { result } = renderHook(() => useDatabase());
    expect(result.current.ready).toBe(false);
  });

  it('TC_DB_002: exibe loading enquanto inicialização não conclui', () => {
    getProducts.mockReturnValue(new Promise(() => {}));

    render(
      <DatabaseProvider>
        <div>child</div>
      </DatabaseProvider>
    );

    expect(screen.getByText('Carregando banco de dados...')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledTimes(1);
  });

  it('TC_DB_003: em sucesso, renderiza children e ready=true no contexto', async () => {
    getProducts.mockResolvedValue([{ id: 1 }]);

    const ContextProbe = () => {
      const { ready } = useDatabase();
      return <span data-testid="db-ready">{String(ready)}</span>;
    };

    render(
      <DatabaseProvider>
        <ContextProbe />
        <div>conteudo-ok</div>
      </DatabaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('conteudo-ok')).toBeInTheDocument();
    });
    expect(screen.getByTestId('db-ready')).toHaveTextContent('true');
  });

  it('TC_DB_004: em falha, mostra fallback de erro e registra console.error', async () => {
    const err = new Error('network down');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getProducts.mockRejectedValue(err);

    render(
      <DatabaseProvider>
        <div>conteudo</div>
      </DatabaseProvider>
    );

    expect(await screen.findByText('Erro ao carregar o banco de dados. Verifique o console.')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize DB', err);

    consoleSpy.mockRestore();
  });
});
