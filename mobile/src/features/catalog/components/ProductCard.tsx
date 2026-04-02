import { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import type { Product } from '@/shared/types/models';
import { formatCurrency } from '@/shared/utils/format';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

export const ProductCard = memo(function ProductCard({ product, onPress, onAddToCart }: ProductCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      {product.image ? <Image source={{ uri: product.image }} style={styles.image} /> : null}
      <Card.Content>
        <Text variant="titleMedium">{product.name}</Text>
        <Text variant="bodyMedium">{formatCurrency(product.price)}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" buttonColor="#FF9900" textColor="#000" onPress={onAddToCart}>
          Adicionar
        </Button>
      </Card.Actions>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
});
