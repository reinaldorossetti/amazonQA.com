import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthNavigator } from './AuthNavigator';
import { ShopNavigator } from './ShopNavigator';
import { ProductDetailsScreen } from '@/features/catalog/screens/ProductDetailsScreen';
import { CheckoutScreen } from '@/features/checkout/screens/CheckoutScreen';
import { PaymentsScreen } from '@/features/payments/screens/PaymentsScreen';
import { ThankYouScreen } from '@/features/confirmation/screens/ThankYouScreen';
import { OrderDetailsScreen } from '@/features/orders/screens/OrderDetailsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#131921' }, headerTintColor: '#fff' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Shop" component={ShopNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Produto' }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
            <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Pagamento' }} />
            <Stack.Screen name="ThankYou" component={ThankYouScreen} options={{ title: 'Confirmação' }} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Pedido' }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
