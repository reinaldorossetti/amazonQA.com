import { View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

function detectBrand(cardNumber: string): string {
  const n = cardNumber.replace(/\D/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'MasterCard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^(4011|4312|4389|4514|4576|5041|5066|5090|6277|6362|6363|6500|6516|6550)/.test(n)) return 'Elo';
  return 'Desconhecida';
}

export function CardBrandChips({ cardNumber }: { cardNumber: string }) {
  const brand = detectBrand(cardNumber);
  return (
    <View testID="payments-card-brand-wrapper" style={{ marginTop: 8 }}>
      <Text testID="payments-card-brand-label" variant="labelMedium">Bandeira detectada</Text>
      <Chip testID="payments-card-brand-chip" style={{ marginTop: 4, alignSelf: 'flex-start' }}>{brand}</Chip>
    </View>
  );
}
