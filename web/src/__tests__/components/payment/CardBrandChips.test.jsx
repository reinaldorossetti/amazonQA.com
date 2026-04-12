import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CardBrandChips from '../../../components/payment/CardBrandChips';

describe('CardBrandChips', () => {
  it('não renderiza quando visible=false', () => {
    const { container } = render(<CardBrandChips visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza lista de bandeiras e marca ativa', () => {
    render(<CardBrandChips visible activeBrand="visa" />);

    expect(screen.getByText('Bandeiras aceitas')).toBeInTheDocument();
    expect(screen.getByLabelText('VISA')).toHaveAttribute('data-active', 'true');
    expect(screen.getByLabelText('MASTERCARD')).toHaveAttribute('data-active', 'false');
  });

  it('exibe fallback textual quando logo falha ao carregar', () => {
    render(<CardBrandChips visible activeBrand={null} />);

    const visaLogo = screen.getByAltText('Bandeira VISA');
    fireEvent.error(visaLogo);

    expect(screen.getByText('VISA')).toBeInTheDocument();
  });
});
