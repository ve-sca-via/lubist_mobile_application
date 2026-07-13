import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ClientAppointmentsScreen } from '@/features/client/screens/ClientAppointmentsScreen';
import { ClientDiscoverScreen } from '@/features/client/screens/ClientDiscoverScreen';
import { ClientHomeScreen } from '@/features/client/screens/ClientHomeScreen';
import { ClientShoppingScreen } from '@/features/client/screens/ClientShoppingScreen';
import { useCart } from '@/services/api/hooks/useBookingAPI';
import { palette } from '@/theme/palette';

import { ClientStackParamList, ClientTabParamList } from './navigation.types';

const Tab = createBottomTabNavigator<ClientTabParamList>();

// The "Cart" tab is a launcher: its onPress pushes the ServiceCart screen (a
// stack screen with a back button) instead of rendering here, so this component
// is never actually shown. (The product/shopping cart lives on the Shopping tab.)
function CartTabPlaceholder() {
  return null;
}

export function ClientNavigator() {
  // Item count for the Cart tab badge (the services cart).
  const { data: serviceCart } = useCart();
  const serviceCartCount = serviceCart?.item_count ?? 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: '#fffaf4',
          borderTopColor: 'transparent',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          elevation: 16,
          height: 68,
          left: 12,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
          right: 12,
          shadowColor: '#c0a995',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 18,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Home: 'home-outline',
            Discover: 'compass-outline',
            Bookings: 'calendar-outline',
            CartTab: 'cart-outline',
            Shopping: 'bag-handle-outline',
          } as const;

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ClientHomeScreen} />
      <Tab.Screen name="Discover" component={ClientDiscoverScreen} />
      <Tab.Screen name="Bookings" component={ClientAppointmentsScreen} />
      <Tab.Screen
        name="CartTab"
        component={CartTabPlaceholder}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: serviceCartCount > 0 ? serviceCartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: palette.primary },
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Don't focus an empty tab — push the ServiceCart screen instead.
            e.preventDefault();
            (
              navigation.getParent() as
                | NativeStackNavigationProp<ClientStackParamList>
                | undefined
            )?.navigate('ServiceCart');
          },
        })}
      />
      <Tab.Screen name="Shopping" component={ClientShoppingScreen} />
    </Tab.Navigator>
  );
}
