import { View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { createOrder } from '../services/orders.api';
import { useAuth } from '@/app/providers/AuthProvider';
import { buildIdempotencyKey } from '@/shared/utils/format';
import type { RootStackParamList } from '@/app/navigation/types';
import type { Order } from '@/shared/types/models';
import { getErrorMessage } from '@/shared/utils/error';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const orderMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const key = buildIdempotencyKey(user.id);
      return createOrder({ shippingTotal: 0, discountTotal: 0 }, key);
    },
    onMutate: () => {
      setError(null);
    },
    onSuccess: (order: Order) => {
      const remaining = Number(order.grand_total ?? 0);
      navigation.navigate('Payments', { orderId: order.id, remaining });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Não foi possível criar o pedido.'));
    },
  });

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text variant="headlineSmall">Checkout</Text>
      <Text>Seu pedido será criado com chave de idempotência para evitar duplicidade.</Text>
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Button mode="contained" onPress={() => orderMutation.mutate()} loading={orderMutation.isPending} disabled={orderMutation.isPending}>
        Criar pedido
      </Button>
    </View>
  );
}
