import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EmailLoginScreen } from '@/features/auth/screens/EmailLoginScreen';
import { EmailSignupScreen } from '@/features/auth/screens/EmailSignupScreen';
import { ForgotPasswordScreen } from '@/features/auth/screens/ForgotPasswordScreen';
import { OtpVerifyScreen } from '@/features/auth/screens/OtpVerifyScreen';
import { SignInScreen } from '@/features/auth/screens/SignInScreen';
import { SignupScreen } from '@/features/auth/screens/SignupScreen';

import { AuthStackParamList } from './navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={SignInScreen} name="SignIn" />
      <Stack.Screen component={OtpVerifyScreen} name="OtpVerify" />
      <Stack.Screen component={SignupScreen} name="Signup" />
      <Stack.Screen component={EmailLoginScreen} name="EmailLogin" />
      <Stack.Screen component={EmailSignupScreen} name="EmailSignup" />
      <Stack.Screen component={ForgotPasswordScreen} name="ForgotPassword" />
    </Stack.Navigator>
  );
}
