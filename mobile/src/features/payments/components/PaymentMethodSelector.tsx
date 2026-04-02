import { View } from 'react-native';
import { Chip } from 'react-native-paper';

const METHODS = [
  { value: 'credit', label: 'Crédito' },
  { value: 'debit', label: 'Débito' },
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
] as const;

interface PaymentMethodSelectorProps {
  value: 'credit' | 'debit' | 'pix' | 'boleto';
  onChange: (value: 'credit' | 'debit' | 'pix' | 'boleto') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {METHODS.map((method) => (
        <Chip
          key={method.value}
          testID={`payment-method-${method.value}`}
          selected={value === method.value}
          onPress={() => onChange(method.value)}
        >
          {method.label}
        </Chip>
      ))}
    </View>
  );
}
