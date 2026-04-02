import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/features/catalog/screens/HomeScreen';
import { CartScreen } from '@/features/cart/screens/CartScreen';
import { OrdersScreen } from '@/features/orders/screens/OrdersScreen';
import { AccountScreen } from '@/features/account/screens/AccountScreen';
import type { ShopTabsParamList } from './types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

const Tabs = createBottomTabNavigator<ShopTabsParamList>();

export function ShopNavigator() {
  const theme = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#007185',
        tabBarInactiveTintColor: '#444',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help';
          switch (route.name) {
            case 'Home': iconName = 'home-outline'; break;
            case 'Cart': iconName = 'cart-outline'; break;
            case 'Orders': iconName = 'package-variant'; break;
            case 'Account': iconName = 'account-outline'; break;
          }
          return <MaterialCommunityIcons name={iconName as any} size={size + 2} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      <Tabs.Screen name="Cart" component={CartScreen} options={{ tabBarLabel: 'Carrinho' }} />
      <Tabs.Screen name="Orders" component={OrdersScreen} options={{ tabBarLabel: 'Seus Pedidos' }} />
      <Tabs.Screen name="Account" component={AccountScreen} options={{ tabBarLabel: 'Você' }} />
    </Tabs.Navigator>
  );
}
