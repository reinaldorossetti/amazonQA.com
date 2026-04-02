import { useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Searchbar, Text, useTheme } from 'react-native-paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const theme = useTheme();
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
    <View testID="home-screen" style={styles.container}>
      {/* Amazon Header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchRow}>
          <Searchbar
            testID="home-search-input"
            placeholder="Buscar produtos na Amazon"
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#111"
            elevation={0}
          />
        </View>
      </View>

      {/* Location Bar */}
      <TouchableOpacity style={styles.locationBar} activeOpacity={0.8}>
        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#fff" />
        <Text style={styles.locationText}>Enviar para Reinaldo - São Paulo 01000-000</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Horizontal Menu / Categories */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {['Ofertas do Dia', 'Prime', 'Música', 'Eletrônicos', 'Computadores', 'Livros'].map((cat, i) => (
            <TouchableOpacity key={i} style={styles.categoryItem}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        contentContainerStyle={styles.productList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            onAddToCart={() => addMutation.mutate(item.id)}
          />
        )}
        ListEmptyComponent={
          !productsQuery.isLoading ? (
            <View style={styles.emptyContainer}>
              <Text testID="home-empty-state-text" style={{ marginTop: 24, fontSize: 16 }}>Nenhum produto encontrado.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeded', // Amazon gray background
  },
  headerContainer: {
    backgroundColor: '#84D8E3', // Linear gradient substitute (Cyan/Blue)
    paddingTop: 48, // approximate status bar height
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a6a6a6',
  },
  searchInput: {
    fontSize: 15,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#37475A',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationText: {
    color: '#fff',
    marginLeft: 6,
    marginRight: 4,
    fontSize: 13,
  },
  categoriesWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoriesRow: {
    paddingHorizontal: 8,
    gap: 16,
  },
  categoryItem: {
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#111',
  },
  productList: {
    padding: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
