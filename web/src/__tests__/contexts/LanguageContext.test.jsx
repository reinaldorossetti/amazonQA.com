import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.unmock('../../contexts/LanguageContext');
vi.unmock('../../contexts/LanguageContext.jsx');

import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext';

const wrapper = ({ children }) => <LanguageProvider>{children}</LanguageProvider>;

describe('LanguageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('TC_LANG_001: lança erro quando useLanguage é chamado fora do provider', () => {
    expect(() => renderHook(() => useLanguage())).toThrow('useLanguage must be used within a LanguageProvider');
  });

  it('TC_LANG_002: inicia em pt por padrão e traduz chave conhecida', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('pt');
    expect(result.current.t('product_details.back')).toBe('Voltar');
  });

  it('TC_LANG_003: restaura idioma salvo no localStorage ao montar', async () => {
    localStorage.setItem('app_language', 'en');

    const { result } = renderHook(() => useLanguage(), { wrapper });

    await waitFor(() => {
      expect(result.current.language).toBe('en');
    });
    expect(result.current.t('product_details.back')).toBe('Back');
  });

  it('TC_LANG_004: toggleLanguage alterna idioma e persiste em localStorage', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe('en');
    expect(localStorage.getItem('app_language')).toBe('en');

    act(() => {
      result.current.toggleLanguage();
    });

    expect(result.current.language).toBe('pt');
    expect(localStorage.getItem('app_language')).toBe('pt');
  });

  it('TC_LANG_005: setAppLanguage troca para idioma válido e ignora inválido', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    act(() => {
      result.current.setAppLanguage('en');
    });

    expect(result.current.language).toBe('en');
    expect(localStorage.getItem('app_language')).toBe('en');

    act(() => {
      result.current.setAppLanguage('de');
    });

    expect(result.current.language).toBe('en');
    expect(localStorage.getItem('app_language')).toBe('en');
  });

  it('TC_LANG_006: t faz interpolação e fallback para a própria chave', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    const interpolated = result.current.t('catalog.products_found', { count: 2, plural: 's' });
    expect(interpolated).toContain('2 produtos encontrados');

    expect(result.current.t('missing.key')).toBe('missing.key');
  });
});
