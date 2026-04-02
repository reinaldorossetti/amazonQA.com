import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ThankYou'>;

export function ThankYouScreen({ route, navigation }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16, gap: 12 }}>
      <Text testID="thank-you-title" variant="headlineMedium">Obrigado pela compra!</Text>
      <Text testID="thank-you-order-message">Pedido #{route.params.orderId} confirmado com sucesso.</Text>
      <Button testID="thank-you-back-to-shop-button" mode="contained" onPress={() => navigation.navigate('Shop')}>
        Voltar para a loja
      </Button>
    </View>
  );
}
