import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, HelperText, Text, Divider } from 'react-native-paper';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Amazon Header */}
      <View style={styles.amazonHeader}>
        <Text style={styles.amazonHeaderText}>amazon.com.br</Text>
      </View>

      <Text testID="checkout-title" style={styles.pageTitle}>Concluir compra</Text>
      
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Revise os itens do pedido</Text>
        <Text style={styles.infoText}>
          Ao fazer o seu pedido, você concorda com as <Text style={styles.linkText}>Condições de Uso</Text> e o{' '}
          <Text style={styles.linkText}>Aviso de Privacidade</Text> da Amazon.
        </Text>

        <Divider style={{ marginVertical: 12 }} />

        {error ? <HelperText testID="checkout-error-message" type="error" visible={true} style={styles.errorText}>{error}</HelperText> : null}
        
        <Button
          testID="checkout-submit-button"
          mode="contained"
          onPress={() => orderMutation.mutate()}
          loading={orderMutation.isPending}
          disabled={orderMutation.isPending}
          buttonColor="#FFD814"
          textColor="#0F1111"
          style={styles.primaryBtn}
          labelStyle={styles.primaryBtnText}
        >
          Finalizar compra
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eaeded',
  },
  content: {
    paddingBottom: 24,
  },
  amazonHeader: {
    backgroundColor: '#84D8E3',
    paddingTop: 48,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amazonHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#111',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F1111',
    marginHorizontal: 12,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D5D9D9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F1111',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#0F1111',
    lineHeight: 18,
  },
  linkText: {
    color: '#007185',
  },
  errorText: {
    marginBottom: 8,
  },
  primaryBtn: {
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 4,
  },
  primaryBtnText: {
    fontSize: 15,
  },
});
