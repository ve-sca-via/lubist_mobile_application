import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { VendorNavigator } from '@/navigation/VendorNavigator';
import { VendorBookingDetailsScreen } from '@/features/vendor/screens/VendorBookingDetailsScreen';
import { VendorRunPromoScreen } from '@/features/vendor/screens/VendorRunPromoScreen';
import { VendorServiceAddWizardScreen } from '@/features/vendor/screens/VendorServiceAddWizardScreen';
import { VendorServiceConfigureScreen } from '@/features/vendor/screens/VendorServiceConfigureScreen';

import { VendorStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<VendorStackParamList>();

export function VendorStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={VendorNavigator} name="Tabs" />
      <Stack.Screen component={VendorBookingDetailsScreen} name="BookingDetails" />
      <Stack.Screen component={VendorServiceAddWizardScreen} name="ServiceAddWizard" />
      <Stack.Screen component={VendorServiceConfigureScreen} name="ServiceConfigure" />
      <Stack.Screen component={VendorRunPromoScreen} name="RunPromo" />
    </Stack.Navigator>
  );
}
