import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AuthStackParamList } from '@/navigation/navigation.types';
import { useAuth } from '@/store/AuthContext';
import { isHandledGlobally } from '@/services/api/client';
import {
  useVerifyPhoneOtp,
  useVerifySignupPhoneOtp,
  useSendPhoneOtp,
  useSendSignupPhoneOtp,
} from '@/services/api/hooks/useAuthAPI';

const colors = {
  bgTop: '#FFF8F4',
  bgMid: '#F0E0D1',
  bgBottom: '#FFFFFF',
  card: 'rgba(255, 248, 244, 0.95)',
  heading: '#221A11',
  text: '#534433',
  muted: 'rgba(83, 68, 51, 0.7)',
  inputBg: '#F6E5D7',
  inputBorder: '#F0E0D1',
  boxActive: '#F89E07',
  ctaStart: '#F89E07',
  ctaEnd: '#FFB962',
  ctaShadow: 'rgba(248, 158, 7, 0.25)',
  ctaText: '#FFFFFF',
  link: '#865300',
  backBtn: '#FFF1E6',
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const BOXES = Array.from({ length: OTP_LENGTH });

type Navigation = NativeStackNavigationProp<AuthStackParamList, 'OtpVerify'>;
type Route = RouteProp<AuthStackParamList, 'OtpVerify'>;

function maskPhone(phone: string, countryCode: string) {
  if (phone.length < 4) return `+${countryCode} ${phone}`;
  const last = phone.slice(-4);
  return `+${countryCode} ••••• ${last}`;
}

export function OtpVerifyScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { phone, countryCode, verificationId, mode, customerName } = route.params;
  const isSignup = mode === 'signup';

  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  // Kept in state so a resend can swap in a fresh verification id.
  const [activeVerificationId, setActiveVerificationId] = useState(verificationId);
  const inputRef = useRef<TextInput>(null);

  const { mutate: verifyOtp, isPending: isVerifyPending } = useVerifyPhoneOtp();
  const { mutate: verifySignupOtp, isPending: isVerifySignupPending } = useVerifySignupPhoneOtp();
  const { mutate: resendLoginOtp, isPending: isResendLoginPending } = useSendPhoneOtp();
  const { mutate: resendSignupOtp, isPending: isResendSignupPending } = useSendSignupPhoneOtp();

  const isPending =
    isVerifyPending || isVerifySignupPending || isResendLoginPending || isResendSignupPending;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const isComplete = code.length === OTP_LENGTH && !isPending;

  const handleChange = (value: string) => {
    setCode(value.replace(/[^\d]/g, '').slice(0, OTP_LENGTH));
  };

  const handleVerify = () => {
    if (isSignup) {
      // New number: verify OTP to obtain a verification token, then collect profile details.
      verifySignupOtp(
        { phone, otp: code, verification_id: activeVerificationId },
        {
          onSuccess: (verifyData) => {
            navigation.navigate('Signup', {
              phone,
              countryCode,
              verificationToken: verifyData.verification_token,
            });
          },
          onError: (error: any) => {
            Alert.alert('Verification Failed', error.message || 'Invalid or expired OTP. Please try again.');
          }
        }
      );
    } else {
      verifyOtp(
        { phone, otp: code, verification_id: activeVerificationId },
        {
          onSuccess: (data) => {
            signIn(data.user || { role: 'client' }, {
              access_token: data.access_token,
              refresh_token: data.refresh_token
            });
          },
          onError: (error: any) => {
            // Update-required / partner-account errors open a full-screen gate.
            if (isHandledGlobally(error)) return;
            Alert.alert('Verification Failed', error.message || 'Invalid or expired OTP. Please try again.');
          }
        }
      );
    }
  };

  const handleResend = () => {
    if (seconds > 0 || isPending) return;

    const resend = isSignup ? resendSignupOtp : resendLoginOtp;
    resend(
      { phone, country_code: countryCode },
      {
        onSuccess: (data) => {
          setActiveVerificationId(data.verification_id);
          setSeconds(RESEND_SECONDS);
          setCode('');
          inputRef.current?.focus();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to resend OTP');
        },
      },
    );
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons color={colors.heading} name="arrow-back" size={22} />
            </Pressable>

            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons color={colors.ctaStart} name="chatbox-ellipses-outline" size={28} />
              </View>

              <Text style={styles.title}>
                {!isSignup && customerName ? `Welcome back, ${customerName}` : 'Verify your number'}
              </Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{'\n'}
                <Text style={styles.phone}>{maskPhone(phone, countryCode)}</Text>
              </Text>

              {/* Single hidden input drives the whole code; the boxes below are display-only. */}
              <Pressable onPress={focusInput} style={styles.otpRow}>
                {BOXES.map((_, index) => {
                  const char = code[index] ?? '';
                  const isActive = focused && index === Math.min(code.length, OTP_LENGTH - 1);
                  return (
                    <View
                      key={index}
                      style={[styles.otpBox, (char || isActive) && styles.otpBoxFilled]}
                    >
                      <Text style={styles.otpChar}>{char}</Text>
                    </View>
                  );
                })}
                <TextInput
                  ref={inputRef}
                  autoFocus
                  caretHidden
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  onBlur={() => setFocused(false)}
                  onChangeText={handleChange}
                  onFocus={() => setFocused(true)}
                  style={styles.hiddenInput}
                  textContentType="oneTimeCode"
                  value={code}
                />
              </Pressable>

              <Pressable
                disabled={!isComplete}
                onPress={handleVerify}
                style={({ pressed }) => [
                  styles.ctaShadow,
                  !isComplete && styles.ctaDisabled,
                  pressed && isComplete && styles.ctaPressed,
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
                    <Text style={styles.ctaText}>VERIFY & CONTINUE</Text>
                  )}
                </LinearGradient>
              </Pressable>

              <View style={styles.resendRow}>
                {seconds > 0 ? (
                  <Text style={styles.resendMuted}>
                    Resend code in 0:{seconds.toString().padStart(2, '0')}
                  </Text>
                ) : (
                  <Pressable onPress={handleResend}>
                    <Text style={styles.resendLink}>Resend code</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.signupRow}>
                <Text style={styles.signupText}>Wrong number? </Text>
                <Pressable onPress={() => navigation.goBack()}>
                  <Text style={styles.signupLink}>Change number</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: colors.backBtn,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    elevation: 8,
    marginTop: 32,
    padding: 24,
    shadowColor: 'rgba(134, 83, 0, 0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  iconCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.bgBottom,
    borderRadius: 24,
    height: 64,
    justifyContent: 'center',
    marginBottom: 20,
    width: 64,
  },
  title: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 24,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  phone: {
    color: colors.heading,
    fontFamily: 'Inter_600SemiBold',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 28,
    position: 'relative',
  },
  otpBox: {
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    height: 56,
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.boxActive,
    borderWidth: 2,
  },
  otpChar: {
    color: colors.heading,
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 22,
  },
  hiddenInput: {
    bottom: 0,
    color: 'transparent',
    left: 0,
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ctaShadow: {
    borderRadius: 12,
    elevation: 8,
    marginTop: 28,
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
  resendRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendMuted: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  resendLink: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  signupLink: {
    color: colors.link,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
