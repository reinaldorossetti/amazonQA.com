import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/features/catalog/screens/HomeScreen';
import { CartScreen } from '@/features/cart/screens/CartScreen';
import { OrdersScreen } from '@/features/orders/screens/OrdersScreen';
import { AccountScreen } from '@/features/account/screens/AccountScreen';
import type { ShopTabsParamList } from './types';

const Tabs = createBottomTabNavigator<ShopTabsParamList>();

export function ShopNavigator() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Cart" component={CartScreen} />
      <Tabs.Screen name="Orders" component={OrdersScreen} />
      <Tabs.Screen name="Account" component={AccountScreen} />
    </Tabs.Navigator>
  );
}
