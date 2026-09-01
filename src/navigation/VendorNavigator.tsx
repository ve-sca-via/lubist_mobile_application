import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

import { VendorBookingsScreen } from '@/features/vendor/screens/VendorBookingsScreen';
import { VendorDashboardScreen } from '@/features/vendor/screens/VendorDashboardScreen';
import { VendorProfileScreen } from '@/features/vendor/screens/VendorProfileScreen';
import { VendorServicesScreen } from '@/features/vendor/screens/VendorServicesScreen';
import { palette } from '@/theme/palette';

import { VendorTabParamList } from './navigation.types';

const Tab = createBottomTabNavigator<VendorTabParamList>();

const ICON_MAP = {
  Dashboard: 'grid-outline',
  Profile: 'person-circle-outline',
  Services: 'cut-outline',
  Bookings: 'calendar-outline',
} as const;

export function VendorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: '#534433',
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <Ionicons name={ICON_MAP[route.name]} size={focused ? 20 : 18} color={focused ? '#fff' : color} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={VendorDashboardScreen} />
      <Tab.Screen name="Profile" component={VendorProfileScreen} />
      <Tab.Screen name="Services" component={VendorServicesScreen} />
      <Tab.Screen name="Bookings" component={VendorBookingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.surface,
    borderTopColor: palette.border,
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconWrap: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  iconWrapActive: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    height: 40,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    width: 40,
  },
});
