import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProductById } from '../services/products.api';
import { addToCart } from '@/features/cart/services/cart.api';
import type { RootStackParamList } from '@/app/navigation/types';
import { formatCurrency } from '@/shared/utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

export function ProductDetailsScreen({ route, navigation }: Props) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const productQuery = useQuery({
    queryKey: ['product', route.params.productId],
    queryFn: () => getProductById(route.params.productId),
  });

  const addMutation = useMutation({
    mutationFn: () => addToCart({ products: [{ productId: route.params.productId, quantity }] }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigation.navigate('Shop');
    },
  });

  const product = productQuery.data;
  if (!product) return <View style={{ flex: 1 }} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {product.image ? <Image source={{ uri: product.image }} style={{ width: '100%', height: 260, resizeMode: 'contain' }} /> : null}
      <Text variant="headlineSmall">{product.name}</Text>
      <Text variant="titleMedium">{formatCurrency(product.price)}</Text>
      <Text>{product.description || 'Sem descrição disponível.'}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button mode="outlined" onPress={() => setQuantity((q) => Math.max(1, q - 1))}>-</Button>
        <Button mode="outlined">{quantity}</Button>
        <Button mode="outlined" onPress={() => setQuantity((q) => q + 1)}>+</Button>
      </View>
      <Button mode="contained" onPress={() => addMutation.mutate()} loading={addMutation.isPending}>
        Adicionar ao carrinho
      </Button>
    </ScrollView>
  );
}
