import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Searchbar, Text } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../services/products.api';
import { addToCart } from '@/features/cart/services/cart.api';
import type { RootStackParamList, ShopTabsParamList } from '@/app/navigation/types';
import type { Product } from '@/shared/types/models';

export function HomeScreen({}: CompositeScreenProps<
  BottomTabScreenProps<ShopTabsParamList, 'Home'>,
  BottomTabScreenProps<ShopTabsParamList>
>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
  });

  const addMutation = useMutation({
    mutationFn: (productId: number) => addToCart({ products: [{ productId, quantity: 1 }] }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const filteredProducts = useMemo(() => {
    const items = productsQuery.data ?? [];
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter((p: Product) => p.name.toLowerCase().includes(term));
  }, [productsQuery.data, search]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Searchbar placeholder="Buscar produtos" value={search} onChangeText={setSearch} />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            onAddToCart={() => addMutation.mutate(item.id)}
          />
        )}
        ListEmptyComponent={!productsQuery.isLoading ? <Text style={{ marginTop: 24 }}>Nenhum produto encontrado.</Text> : null}
      />
    </View>
  );
}
