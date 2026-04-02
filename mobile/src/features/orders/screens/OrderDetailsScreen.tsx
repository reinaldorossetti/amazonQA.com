import { FlatList, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '@/features/checkout/services/orders.api';
import { formatCurrency } from '@/shared/utils/format';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetails'>;

export function OrderDetailsScreen({ route }: Props) {
  const orderQuery = useQuery({
    queryKey: ['order', route.params.orderId],
    queryFn: () => getOrderById(route.params.orderId),
  });

  const order = orderQuery.data;

  if (!order) {
    return <View style={{ flex: 1, padding: 16 }}><Text>Carregando...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text variant="titleLarge">Pedido {order.order_number}</Text>
      <Text>Status: {order.status}</Text>
      <Text style={{ marginBottom: 12 }}>Total: {formatCurrency(order.grand_total)}</Text>

      <FlatList
        data={order.items ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8 }}>
            <Card.Title title={item.product_name_snapshot} subtitle={`${item.quantity} x ${formatCurrency(item.unit_price_snapshot)}`} />
          </Card>
        )}
      />
    </View>
  );
}
