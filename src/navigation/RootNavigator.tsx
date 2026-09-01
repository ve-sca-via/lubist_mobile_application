import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/store/AuthContext';
import { palette } from '@/theme/palette';

import { AdminNavigator } from './AdminNavigator';
import { AuthNavigator } from './AuthNavigator';
import { ClientStackNavigator } from './ClientStackNavigator';
import { RMNavigator } from './RMNavigator';
import { RootStackParamList } from './navigation.types';
import { VendorStackNavigator } from './VendorStackNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, role, isLoading } = useAuth();

  // Wait until the stored session is restored before choosing a stack. Without
  // this, we'd briefly mount the Auth stack and then swap it out on auto-login,
  // which crashes react-native-web ("removeChild") during that unmount.
  if (isLoading) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: '#FFFAF5', flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  if (!isAuthenticated || role === null) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'vendor' ? (
        <Stack.Screen name="Vendor" component={VendorStackNavigator} />
      ) : role === 'client' ? (
        <Stack.Screen name="Client" component={ClientStackNavigator} />
      ) : role === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : role === 'rm' ? (
        <Stack.Screen name="RM" component={RMNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
