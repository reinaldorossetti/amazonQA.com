import { FlatList, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Button, Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getCart, deleteCartItem } from '../services/cart.api';
import { useAuth } from '@/app/providers/AuthProvider';
import type { RootStackParamList, ShopTabsParamList } from '@/app/navigation/types';
import type { CartItem } from '@/shared/types/models';
import { formatCurrency } from '@/shared/utils/format';

export function CartScreen({}: CompositeScreenProps<
  BottomTabScreenProps<ShopTabsParamList, 'Cart'>,
  BottomTabScreenProps<ShopTabsParamList>
>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([] as CartItem[]);
      return getCart(user.id);
    },
    enabled: Boolean(user?.id),
  });

  const deleteMutation = useMutation({
    mutationFn: (cartItemId: number) => deleteCartItem(cartItemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const cartItems = cartQuery.data ?? [];
  const total = cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  const renderHeader = () => (
    <View style={styles.headerBox}>
      <Text style={styles.subtotalText}>
        Subtotal ({totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'}):{' '}
        <Text style={styles.totalPriceText}>{formatCurrency(total)}</Text>
      </Text>
      <Button
        mode="contained"
        disabled={total <= 0}
        onPress={() => navigation.navigate('Checkout')}
        style={styles.checkoutBtn}
        labelStyle={styles.checkoutBtnText}
        buttonColor="#FFD814"
        textColor="#0F1111"
      >
        Fechar pedido
      </Button>
      <Divider style={{ marginVertical: 12 }} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Amazon Header */}
      <View style={styles.amazonHeader}>
        <Text style={styles.amazonHeaderText}>amazon.com.br</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={cartItems.length > 0 ? renderHeader : null}
        renderItem={({ item }) => (
          <View style={styles.cartItemCard}>
            <View style={styles.cartItemRow}>
              <View style={styles.itemImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <MaterialCommunityIcons name="image-outline" size={48} color="#ccc" />
                )}
              </View>
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                <Text style={styles.itemStock}>Em estoque</Text>
              </View>
            </View>

            <View style={styles.itemActionsRow}>
              <View style={styles.qtyContainer}>
                <Text>Qtd: {item.quantity}</Text>
              </View>
              
              <View style={styles.actionLinks}>
                <TouchableOpacity onPress={() => deleteMutation.mutate(item.id)}>
                  <Text style={styles.linkText}>Excluir</Text>
                </TouchableOpacity>
                <View style={styles.dividerPipe} />
                <TouchableOpacity>
                  <Text style={styles.linkText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !cartQuery.isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>O seu carrinho da Amazon está vazio.</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Home' as any)}
                textColor="#007185"
                style={{ marginTop: 8 }}
              >
                Continue comprando
              </Button>
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
    backgroundColor: '#eaeded', // Amazon gray
  },
  amazonHeader: {
    backgroundColor: '#84D8E3',
    paddingTop: 48,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amazonHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#111',
  },
  listContent: {
    padding: 12,
  },
  headerBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  subtotalText: {
    fontSize: 18,
    color: '#0F1111',
    marginBottom: 12,
  },
  totalPriceText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  checkoutBtn: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  checkoutBtnText: {
    fontSize: 14,
  },
  cartItemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cartItemRow: {
    flexDirection: 'row',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#0F1111',
    lineHeight: 20,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F1111',
    marginBottom: 4,
  },
  itemStock: {
    color: '#007600', // Amazon green stock
    fontSize: 12,
  },
  itemActionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  qtyContainer: {
    backgroundColor: '#F0F2F2',
    borderWidth: 1,
    borderColor: '#D5D9D9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  actionLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#007185',
    fontSize: 14,
  },
  dividerPipe: {
    width: 1,
    height: 14,
    backgroundColor: '#D5D9D9',
    marginHorizontal: 12,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0F1111',
  },
});
