import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { useSendPhoneOtp, useSendSignupPhoneOtp } from '@/services/api/hooks/useAuthAPI';

// Assets exported 1:1 from Figma ("Onboarding - Vibrant Luxury").
const logo = require('@/assets/auth/lubist-logo.png');
const collageSpa = require('@/assets/auth/collage-spa.png');
const collageNails = require('@/assets/auth/collage-nails.png');
const collageHair = require('@/assets/auth/collage-hair.png');
const collageSkincare = require('@/assets/auth/collage-skincare.png');

const colors = {
  bgTop: '#FFF8F4',
  bgMid: '#F0E0D1',
  bgBottom: '#FFFFFF',
  card: 'rgba(255, 248, 244, 0.95)',
  tileOverlay: 'rgba(248, 158, 7, 0.1)',
  heading: '#221A11',
  inputBg: '#F6E5D7',
  inputBorder: '#F0E0D1',
  divider: 'rgba(217, 195, 173, 0.5)',
  code: '#534433',
  chevron: 'rgba(83, 68, 51, 0.7)',
  placeholder: 'rgba(83, 68, 51, 0.5)',
  ctaStart: '#F89E07',
  ctaEnd: '#FFB962',
  ctaShadow: 'rgba(248, 158, 7, 0.25)',
  ctaText: '#FFFFFF',
  legal: 'rgba(83, 68, 51, 0.7)',
  link: '#865300',
  support: '#534433',
  guest: '#867461',
  tileShadow: 'rgba(134, 83, 0, 0.18)',
};

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

const COUNTRY_CODE = '91';

export function SignInScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<Navigation>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const { mutate: sendLoginOtp, isPending: isLoginPending } = useSendPhoneOtp();
  const { mutate: sendSignupOtp, isPending: isSignupPending } = useSendSignupPhoneOtp();

  const isPending = isLoginPending || isSignupPending;
  const isContinueEnabled = phoneNumber.length >= 10 && !isPending;

  // New number → fall back to the signup OTP on the same phone/OTP track (mirrors web).
  const startSignupOtp = () => {
    sendSignupOtp(
      { phone: phoneNumber, country_code: COUNTRY_CODE },
      {
        onSuccess: (data) => {
          navigation.navigate('OtpVerify', {
            phone: phoneNumber,
            countryCode: COUNTRY_CODE,
            verificationId: data.verification_id,
            mode: 'signup',
          });
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to send OTP');
        },
      },
    );
  };

  const handleContinue = () => {
    sendLoginOtp(
      { phone: phoneNumber, country_code: COUNTRY_CODE },
      {
        onSuccess: (data) => {
          navigation.navigate('OtpVerify', {
            phone: phoneNumber,
            countryCode: COUNTRY_CODE,
            verificationId: data.verification_id,
            mode: 'login',
            customerName: data.customer_name,
          });
        },
        onError: (error: any) => {
          const message = error.message || 'Failed to send OTP';
          const lower = message.toLowerCase();

          if (lower.includes('not registered') || lower.includes('404')) {
            startSignupOtp();
            return;
          }

          // Legacy fallback only: the current backend verifies an unverified
          // number through the login OTP itself, so it no longer returns this.
          // Keep it for users still hitting an older server. It used to fire on
          // any '403' as well, which told vendors and deactivated accounts to go
          // verify a phone that was already verified.
          if (lower.includes('not verified')) {
            Alert.alert(
              'Phone Not Verified',
              'This number is on an account created with email. Log in with your email, then verify this number in Profile settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Login with Email', onPress: () => navigation.navigate('EmailLogin') },
              ],
            );
            return;
          }

          // Everything else (wrong account type, deactivated account, network)
          // shows what the server actually said.
          Alert.alert('Error', message);
        }
      }
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Collage />

            <View style={styles.card}>
              <BrandHeader />
              <LoginForm
                isContinueEnabled={isContinueEnabled}
                onContinue={handleContinue}
                onChangePhone={(value) => setPhoneNumber(value.replace(/[^\d]/g, ''))}
                phoneNumber={phoneNumber}
                isPending={isPending}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable onPress={() => navigation.navigate('EmailLogin')} style={styles.emailButton}>
                <Ionicons color={colors.link} name="mail-outline" size={18} />
                <Text style={styles.emailButtonText}>Continue with Email</Text>
              </Pressable>

              <LegalActions
                onGuest={() => signIn({ role: 'client', guest: true }, { access_token: '', refresh_token: '' })}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function Collage() {
  return (
    <View style={styles.collage}>
      <View style={styles.collageRow}>
        <View style={styles.leftColumn}>
          <Tile source={collageSpa} style={styles.tileSpa} />
          <Tile source={collageNails} style={styles.tileNails} />
        </View>
        <View style={styles.rightColumn}>
          <Tile source={collageHair} style={styles.tileHair} />
          <Tile source={collageSkincare} style={styles.tileSkincare} />
        </View>
      </View>

      <LinearGradient
        colors={['rgba(255, 248, 244, 0)', colors.bgTop]}
        style={styles.bottomFade}
      />
    </View>
  );
}

function Tile({ source, style }: { source: number; style: object }) {
  return (
    <View style={[styles.tile, style]}>
      <Image source={source} style={styles.tileImage} />
      <View style={styles.tileOverlay} />
    </View>
  );
}

function BrandHeader() {
  return (
    <View style={styles.brand}>
      <Image resizeMode="contain" source={logo} style={styles.logo} />
      <Text style={styles.tagline}>Luxury You Aspire</Text>
    </View>
  );
}

function LoginForm({
  isContinueEnabled,
  onChangePhone,
  onContinue,
  phoneNumber,
  isPending,
}: {
  isContinueEnabled: boolean;
  onChangePhone: (value: string) => void;
  onContinue: () => void;
  phoneNumber: string;
  isPending?: boolean;
}) {
  return (
    <View style={styles.form}>
      <View style={styles.phoneInput}>
        <Pressable style={styles.countryCode}>
          <Text style={styles.countryCodeText}>+91</Text>
          <Ionicons color={colors.chevron} name="chevron-down" size={12} />
        </Pressable>
        <TextInput
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={onChangePhone}
          placeholder="Enter Mobile Number"
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          value={phoneNumber}
        />
      </View>

      <Pressable
        disabled={!isContinueEnabled}
        onPress={onContinue}
        style={({ pressed }) => [
          styles.ctaShadow,
          !isContinueEnabled && styles.ctaDisabled,
          pressed && isContinueEnabled && styles.ctaPressed,
        ]}
      >
        <LinearGradient
          colors={[colors.ctaStart, colors.ctaEnd]}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.cta}
        >
          {isPending ? (
            <ActivityIndicator color={colors.ctaText} />
          ) : (
            <Text style={styles.ctaText}>CONTINUE</Text>
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function LegalActions({ onGuest }: { onGuest: () => void }) {
  return (
    <View style={styles.legalActions}>
      <Text style={styles.legalText}>
        By continuing you agree to our <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
        <Text style={styles.legalLink}>Privacy Policy</Text>
      </Text>

      <View style={styles.secondaryActions}>
        <Pressable>
          <Text style={styles.supportText}>Having issues signing up? Contact Support</Text>
        </Pressable>
        <Pressable onPress={onGuest}>
          <Text style={styles.guestText}>Continue as guest</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.bgTop,
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  collage: {
    height: 438,
  },
  collageRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  leftColumn: {
    flex: 1,
    gap: 12,
    paddingTop: 32,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  tile: {
    borderRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    shadowColor: colors.tileShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  tileImage: {
    height: '100%',
    width: '100%',
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.tileOverlay,
  },
  tileSpa: {
    height: 192,
  },
  tileNails: {
    height: 128,
  },
  tileHair: {
    height: 144,
  },
  tileSkincare: {
    height: 208,
  },
  bottomFade: {
    bottom: 0,
    height: 128,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 12,
    marginTop: -48,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: 'rgba(134, 83, 0, 0.18)',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  brand: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  logo: {
    height: 100,
    width: 250,
  },
  tagline: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
    letterSpacing: -0.44,
    lineHeight: 28.6,
    marginTop: -1,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  phoneInput: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 16,
  },
  countryCode: {
    alignItems: 'center',
    borderRightColor: colors.divider,
    borderRightWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 32,
    paddingRight: 12,
  },
  countryCodeText: {
    color: colors.code,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.14,
  },
  input: {
    color: colors.code,
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    height: '100%',
    paddingHorizontal: 12,
  },
  ctaShadow: {
    borderRadius: 12,
    elevation: 8,
    shadowColor: colors.ctaShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  ctaDisabled: {
    opacity: 0.55,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  cta: {
    alignItems: 'center',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.ctaText,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    letterSpacing: 0.7,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
  },
  dividerLine: {
    backgroundColor: colors.divider,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.guest,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  emailButton: {
    alignItems: 'center',
    backgroundColor: colors.bgBottom,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 56,
    justifyContent: 'center',
    marginTop: 20,
  },
  emailButtonText: {
    color: colors.link,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  legalActions: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 32,
  },
  legalText: {
    color: colors.legal,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 22.75,
    maxWidth: 280,
    textAlign: 'center',
  },
  legalLink: {
    color: colors.link,
    textDecorationLine: 'underline',
  },
  secondaryActions: {
    alignItems: 'center',
    gap: 11,
    paddingTop: 15,
  },
  supportText: {
    color: colors.support,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  guestText: {
    color: colors.guest,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
});
