import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../../components/CartItem';

describe('CartItem Component', () => {
  const baseItem = {
    id: 101,
    image: 'https://img.local/headset.png',
    name: 'Headset QA',
    price: 25,
    quantity: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TC_CI_001: renderiza nome, preço unitário e total da linha', () => {
    render(<CartItem item={baseItem} onChange={vi.fn()} onRemove={vi.fn()} />);

    expect(screen.getByText('Headset QA')).toBeInTheDocument();
    expect(screen.getByText('R$ 25.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 50.00')).toBeInTheDocument();
  });

  it('TC_CI_002: normaliza item inválido para valores seguros', () => {
    render(
      <CartItem
        item={{ id: 1, name: undefined, image: undefined, price: NaN, quantity: 0 }}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 0.00').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('cart_item.qty')).toHaveValue(1);
  });

  it('TC_CI_003: chama onChange quando quantidade válida (>0)', () => {
    const onChange = vi.fn();
    render(<CartItem item={baseItem} onChange={onChange} onRemove={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('cart_item.qty'), { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 101, quantity: 2, price: 25, name: 'Headset QA' }),
      5
    );
  });

  it('TC_CI_004: não chama onChange para quantidade inválida (<=0)', () => {
    const onChange = vi.fn();
    render(<CartItem item={baseItem} onChange={onChange} onRemove={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('cart_item.qty'), { target: { value: '0' } });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('TC_CI_005: prioriza onUpdateCart quando ambos callbacks de update existem', () => {
    const onUpdateCart = vi.fn();
    const onChange = vi.fn();

    render(
      <CartItem
        item={baseItem}
        onUpdateCart={onUpdateCart}
        onChange={onChange}
        onRemove={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('cart_item.qty'), { target: { value: '3' } });

    expect(onUpdateCart).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('TC_CI_006: chama onRemove ao clicar no botão delete', () => {
    const onRemove = vi.fn();
    render(<CartItem item={baseItem} onChange={vi.fn()} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    expect(onRemove).toHaveBeenCalledWith(
      expect.objectContaining({ id: 101, quantity: 2, price: 25, name: 'Headset QA' })
    );
  });

  it('TC_CI_007: prioriza onRemoveFromCart quando ambos callbacks de remoção existem', () => {
    const onRemoveFromCart = vi.fn();
    const onRemove = vi.fn();

    render(
      <CartItem
        item={baseItem}
        onChange={vi.fn()}
        onRemoveFromCart={onRemoveFromCart}
        onRemove={onRemove}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    expect(onRemoveFromCart).toHaveBeenCalledTimes(1);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('TC_CI_008: funciona sem callbacks explícitos (fallback noop)', () => {
    render(<CartItem item={baseItem} />);

    fireEvent.change(screen.getByLabelText('cart_item.qty'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'delete' }));

    expect(screen.getByText('Headset QA')).toBeInTheDocument();
  });
});
