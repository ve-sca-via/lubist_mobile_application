import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ClientNavigator } from '@/navigation/ClientNavigator';
import { SalonDetailsScreen } from '@/features/client/screens/SalonDetailsScreen';
import { SalonServicesScreen } from '@/features/client/screens/SalonServicesScreen';
import { SelectTimeScreen } from '@/features/client/screens/SelectTimeScreen';
import { CheckoutScreen } from '@/features/client/screens/CheckoutScreen';
import { BookingConfirmedScreen } from '@/features/client/screens/BookingConfirmedScreen';
import { ProductCatalogScreen } from '@/features/client/screens/ProductCatalogScreen';
import { ProductDetailScreen } from '@/features/client/screens/ProductDetailScreen';
import { CartScreen } from '@/features/client/screens/CartScreen';
import { ServiceCartScreen } from '@/features/client/screens/ServiceCartScreen';
import { ClientAccountScreen } from '@/features/client/screens/ClientAccountScreen';
import { ProfileScreen } from '@/features/client/screens/ProfileScreen';
import { MyReviewsScreen } from '@/features/client/screens/MyReviewsScreen';
import { ClientOffersScreen } from '@/features/client/screens/ClientOffersScreen';
import { WebPageScreen } from '@/features/client/screens/WebPageScreen';

import { ClientStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<ClientStackParamList>();

export function ClientStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ClientNavigator} name="Tabs" />
      <Stack.Screen component={ClientAccountScreen} name="Saved" />
      <Stack.Screen component={ProfileScreen} name="Profile" />
      <Stack.Screen component={SalonDetailsScreen} name="SalonDetails" />
      <Stack.Screen component={SalonServicesScreen} name="SalonServices" />
      <Stack.Screen component={SelectTimeScreen} name="SelectTime" />
      <Stack.Screen component={CheckoutScreen} name="Checkout" />
      <Stack.Screen component={BookingConfirmedScreen} name="BookingConfirmed" />
      <Stack.Screen component={ProductCatalogScreen} name="ProductCatalog" />
      <Stack.Screen component={ProductDetailScreen} name="ProductDetail" />
      <Stack.Screen component={CartScreen} name="Cart" />
      <Stack.Screen component={ServiceCartScreen} name="ServiceCart" />
      <Stack.Screen component={MyReviewsScreen} name="MyReviews" />
      <Stack.Screen component={ClientOffersScreen} name="Offers" />
      <Stack.Screen component={WebPageScreen} name="WebPage" />
    </Stack.Navigator>
  );
}
