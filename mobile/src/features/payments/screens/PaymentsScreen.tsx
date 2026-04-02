import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { CardBrandChips } from '../components/CardBrandChips';
import { payOrder } from '../services/payments.api';
import type { RootStackParamList } from '@/app/navigation/types';
import { getErrorMessage } from '@/shared/utils/error';

type Props = NativeStackScreenProps<RootStackParamList, 'Payments'>;

export function PaymentsScreen({ route, navigation }: Props) {
  const { orderId, remaining } = route.params;
  const [method, setMethod] = useState<'credit' | 'debit' | 'pix' | 'boleto'>('credit');
  const [cardNumber, setCardNumber] = useState('4111111111111111');
  const [holderName, setHolderName] = useState('Cliente AmazonQA');
  const [expiry, setExpiry] = useState('12/30');
  const [cvv, setCvv] = useState('123');
  const [error, setError] = useState<string | null>(null);

  const isCardMethod = method === 'credit' || method === 'debit';
  const hasRequiredCardFields = holderName.trim() && cardNumber.trim() && expiry.trim() && cvv.trim();

  const paymentMutation = useMutation({
    mutationFn: () => payOrder(orderId, {
      method,
      amount: Number(remaining.toFixed(2)),
      cardNumber,
      holderName,
      expiry,
      cvv,
      installments: 1,
    }),
    onMutate: () => {
      setError(null);
    },
    onSuccess: () => {
      navigation.replace('ThankYou', { orderId });
    },
    onError: (err) => {
      setError(getErrorMessage(err, 'Não foi possível processar o pagamento.'));
    },
  });

  const canSubmit = !paymentMutation.isPending && (!isCardMethod || Boolean(hasRequiredCardFields));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text testID="payments-title" variant="headlineSmall">Pagamento do pedido #{orderId}</Text>
      <Text variant="titleMedium">Saldo: R$ {remaining.toFixed(2)}</Text>
      <PaymentMethodSelector value={method} onChange={setMethod} />

      {isCardMethod ? (
        <>
          <TextInput testID="payments-card-holder-input" label="Nome no cartão" value={holderName} onChangeText={setHolderName} />
          <TextInput testID="payments-card-number-input" label="Número do cartão" value={cardNumber} onChangeText={setCardNumber} keyboardType="number-pad" />
          <CardBrandChips cardNumber={cardNumber} />
          <TextInput testID="payments-card-expiry-input" label="Validade" value={expiry} onChangeText={setExpiry} />
          <TextInput testID="payments-card-cvv-input" label="CVV" value={cvv} onChangeText={setCvv} secureTextEntry keyboardType="number-pad" />
        </>
      ) : null}

      {error ? <HelperText testID="payments-error-message" type="error">{error}</HelperText> : null}
      <Button testID="payments-confirm-button" mode="contained" onPress={() => paymentMutation.mutate()} loading={paymentMutation.isPending} disabled={!canSubmit}>
        Confirmar pagamento
      </Button>
    </ScrollView>
  );
}
