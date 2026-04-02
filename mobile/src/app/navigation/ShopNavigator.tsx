import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '@/features/catalog/screens/HomeScreen';
import { CartScreen } from '@/features/cart/screens/CartScreen';
import { OrdersScreen } from '@/features/orders/screens/OrdersScreen';
import { AccountScreen } from '@/features/account/screens/AccountScreen';
import type { ShopTabsParamList } from './types';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/app/providers/AuthProvider';
import { getCart } from '@/features/cart/services/cart.api';
import type { CartItem } from '@/shared/types/models';
import { ShopTopBar } from './components/ShopTopBar';

const Tabs = createBottomTabNavigator<ShopTabsParamList>();

function CartIcon({ color }: { color: string }) {
  const { user } = useAuth();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([] as CartItem[]);
      return getCart(user.id);
    },
    enabled: Boolean(user?.id),
  });

  const quantity = cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

  return (
    <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="bag-handle-outline" size={30} color={color} />
      {quantity > 0 && (
        <Text
          testID="tab-cart-badge"
          style={{
            position: 'absolute',
            top: -5,
            right: -4,
            backgroundColor: '#E7A900',
            color: '#fff',
            fontSize: 11,
            fontWeight: 'bold',
            borderRadius: 10,
            minWidth: 18,
            textAlign: 'center',
            paddingHorizontal: 5,
            paddingVertical: 1,
            overflow: 'hidden',
          }}
        >
          {quantity}
        </Text>
      )}
    </View>
  );
}

export function ShopNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        header: () => <ShopTopBar />,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#E7A900',
        tabBarInactiveTintColor: '#222222',
        tabBarStyle: {
          backgroundColor: '#F3F3F3',
          borderTopWidth: 1,
          borderTopColor: '#DDDDDD',
          height: 66,
          paddingTop: 6,
          elevation: 8,
        },
        tabBarIcon: ({ color }) => {
          if (route.name === 'Cart') {
            return <CartIcon color={color} />;
          }

          let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Account':
              iconName = 'person-circle-outline';
              break;
            case 'Orders':
              iconName = 'grid-outline';
              break;
          }
          return <Ionicons name={iconName} size={30} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarButton: (props) => <TouchableOpacity {...props} testID="tab-home-button" />,
        }}
      />
      <Tabs.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarButton: (props) => <TouchableOpacity {...props} testID="tab-orders-button" />,
        }}
      />
      <Tabs.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarButton: (props) => <TouchableOpacity {...props} testID="tab-cart-button" />,
        }}
      />
      <Tabs.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarButton: (props) => <TouchableOpacity {...props} testID="tab-account-button" />,
        }}
      />
    </Tabs.Navigator>
  );
}
