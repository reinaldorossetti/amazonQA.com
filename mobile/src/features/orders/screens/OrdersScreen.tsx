import { FlatList, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { listOrders } from '@/features/checkout/services/orders.api';
import type { RootStackParamList, ShopTabsParamList } from '@/app/navigation/types';
import { formatCurrency } from '@/shared/utils/format';

export function OrdersScreen({}: BottomTabScreenProps<ShopTabsParamList, 'Orders'>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => listOrders(),
  });

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={ordersQuery.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Title title={item.order_number} subtitle={`Status: ${item.status}`} />
            <Card.Content>
              <Text>Total: {formatCurrency(item.grand_total)}</Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}>Detalhes</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={!ordersQuery.isLoading ? <Text>Sem pedidos ainda.</Text> : null}
      />
    </View>
  );
}
