import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));

describe('Footer', () => {
  it('renderiza links principais e bloco legal', () => {
    render(<Footer />);

    expect(screen.getByText('Conheça-nos')).toBeInTheDocument();
    expect(screen.getByText('Ganhe dinheiro conosco')).toBeInTheDocument();
    expect(screen.getByText('Pagamento')).toBeInTheDocument();
    expect(screen.getByText(/Condições de Uso/i)).toBeInTheDocument();
  });

  it('aciona scroll para o topo ao clicar em "Voltar ao início"', () => {
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<Footer />);

    fireEvent.click(screen.getByText('Voltar ao início'));

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    scrollSpy.mockRestore();
  });
});
