import { FlatList, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
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

  const total = (cartQuery.data ?? []).reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={cartQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Title title={item.name} subtitle={`${item.quantity} x ${formatCurrency(item.price)}`} />
            <Card.Actions>
              <Button onPress={() => deleteMutation.mutate(item.id)}>Remover</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={!cartQuery.isLoading ? <Text>Seu carrinho está vazio.</Text> : null}
      />
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Total: {formatCurrency(total)}</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" disabled={total <= 0} onPress={() => navigation.navigate('Checkout')}>
            Ir para checkout
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}
