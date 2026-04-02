import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { ProductCard } from '@/features/catalog/components/ProductCard';

describe('ProductCard', () => {
  it('renders product name and triggers callbacks', () => {
    const onPress = jest.fn();
    const onAddToCart = jest.fn();

    const { getByText } = render(
      <PaperProvider>
        <ProductCard
          product={{ id: 1, name: 'Relógio', price: 50.99, image: undefined }}
          onPress={onPress}
          onAddToCart={onAddToCart}
        />
      </PaperProvider>
    );

    expect(getByText('Relógio')).toBeTruthy();
    fireEvent.press(getByText('Adicionar'));
    expect(onAddToCart).toHaveBeenCalledTimes(1);
  });
});
